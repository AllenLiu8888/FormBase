import { create } from 'zustand';
import Constants from 'expo-constants';
import { FormApi, FieldApi, RecordApi, buildJsonbFilterQuery, apiRequest } from '../lib/api';

// Read initial username and JWT from Expo extra for global use
const { USERNAME, JWT_TOKEN } = Constants.expoConfig?.extra || {};

export const useAppStore = create((set, get) => ({
  // User/auth
  username: USERNAME || '',
  jwtToken: JWT_TOKEN || '',
  setAuth: ({ username, jwtToken }) => set({ username, jwtToken }),

  // Forms data and global UI state
  forms: [],
  loading: false,
  submitting: false,
  deletingId: null,
  error: null,

  // Field and record data, bucketed by formId
  fieldsByForm: {},
  recordsByForm: {}, // { [formId]: { items: [], offset, hasMore } }

  // Internal generic setters
  setForms: (forms) => set({ forms: Array.isArray(forms) ? forms : [] }),
  setError: (error) => set({ error }),
  setFieldsForForm: (formId, fields) =>
    set((s) => ({ fieldsByForm: { ...s.fieldsByForm, [String(formId)]: Array.isArray(fields) ? fields : [] } })),
  setRecordsForForm: (formId, items, offset = 0, hasMore = true) =>
    set((s) => ({
      recordsByForm: {
        ...s.recordsByForm,
        [String(formId)]: { items: Array.isArray(items) ? items : [], offset, hasMore },
      },
    })),

  // Actions — unified API calls; screens only interact with these
  fetchForms: async () => {
    set({ loading: true, error: null });
    try {
      const data = await FormApi.list();
      set({ forms: Array.isArray(data) ? data : [], loading: false });
    } catch (e) {
      set({ error: e, loading: false });
    }
  },

  createForm: async ({ name, description }) => {
    set({ submitting: true, error: null });
    try {
      const created = await FormApi.create({ name, description });
      const createdItem = Array.isArray(created) ? created[0] : created;
      set({ forms: [createdItem, ...get().forms] });
    } catch (e) {
      set({ error: e });
      throw e;
    } finally {
      set({ submitting: false });
    }
  },

  updateForm: async (id, { name, description }) => {
    set({ submitting: true, error: null });
    try {
      await FormApi.update(id, { name, description });
      const next = get().forms.map((f) => (f.id === id ? { ...f, name, description } : f));
      set({ forms: next });
    } catch (e) {
      set({ error: e });
      throw e;
    } finally {
      set({ submitting: false });
    }
  },

  deleteForm: async (id) => {
    set({ deletingId: id, error: null });
    try {
      await FormApi.remove(id);
      set({ forms: get().forms.filter((f) => f.id !== id) });
    } catch (e) {
      set({ error: e });
      throw e;
    } finally {
      set({ deletingId: null });
    }
  },

  // Field actions — list and create (supports multiple field types)
  fetchFields: async (formId) => {
    if (!formId) return;
    set({ loading: true, error: null });
    try {
      const data = await FieldApi.listByForm(formId);
      const arr = Array.isArray(data) ? data : [];
      // Sort by ascending order_index for rendering
      arr.sort((a, b) => (a?.order_index ?? 0) - (b?.order_index ?? 0));
      get().setFieldsForForm(formId, arr);
      set({ loading: false });
    } catch (e) {
      set({ error: e, loading: false });
    }
  },

  createField: async (formId, { name, field_type, required = false, is_num = false, options }) => {
    if (!formId || !name) return;
    set({ submitting: true, error: null });
    try {
      // Backend expects field_type (not type) and requires required/is_num/order_index
      const key = String(formId);
      const current = get().fieldsByForm[key] || [];
      const payload = {
        form_id: Number(formId),
        name,
        field_type: field_type || 'text',
        required: Boolean(required),
        is_num: Boolean(is_num),
        order_index: current.length + 1,
        ...(options ? { options } : {}),
      };
      const created = await FieldApi.create(payload);
      const createdItem = Array.isArray(created) ? created[0] : created;
      set((s) => ({ fieldsByForm: { ...s.fieldsByForm, [key]: [createdItem, ...current] } }));
    } catch (e) {
      set({ error: e });
      throw e;
    } finally {
      set({ submitting: false });
    }
  },

  // Field reordering — batch update order_index
  reorderFields: async (formId, orderedIds) => {
    if (!formId || !Array.isArray(orderedIds)) return;
    // Local optimistic update
    const current = get().fieldsByForm[String(formId)] || [];
    const idToField = new Map(current.map((f) => [f.id, f]));
    const next = orderedIds.map((id, idx) => ({ ...idToField.get(id), order_index: idx + 1 }));
    get().setFieldsForForm(formId, next);
    // Persist sequentially to avoid version conflicts; swallow errors to keep UI responsive
    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i];
      try { await FieldApi.update(id, { order_index: i + 1 }); } catch {}
    }
  },

  // Record actions — list/create/delete (UI uses de-duplicated list)
  fetchRecords: async (formId, { limit = 50, append = false, conditions, join = 'AND' } = {}) => {
    if (!formId) return;
    set({ loading: true, error: null });
    try {
      const state = get().recordsByForm[String(formId)] || { items: [], offset: 0 };
      const offset = 0; // Remove pagination; always start from 0
      let list;
      if (Array.isArray(conditions) && conditions.length > 0) {
        const base = buildJsonbFilterQuery(formId, conditions, join);
        const endpoint = `${base}&limit=${limit}&offset=${offset}`;
        list = await apiRequest(endpoint, 'GET');
      } else {
        list = await RecordApi.listByForm(formId, { limit, offset });
      }
      const items = Array.isArray(list) ? list : [];
      // De-duplicate by id to avoid visual duplicates
      const unique = [];
      const seen = new Set();
      for (const it of items) {
        const key = it?.id ?? JSON.stringify(it);
        if (!seen.has(key)) { seen.add(key); unique.push(it); }
      }
      get().setRecordsForForm(formId, unique, unique.length, false);
      set({ loading: false });
    } catch (e) {
      set({ error: e, loading: false });
    }
  },

  createRecord: async (formId, values) => {
    if (!formId || !values) return;
    set({ submitting: true, error: null });
    try {
      const created = await RecordApi.create({ form_id: Number(formId), values });
      const createdItem = Array.isArray(created) ? created[0] : created;
      const key = String(formId);
      const current = (get().recordsByForm[key]?.items) || [];
      get().setRecordsForForm(formId, [createdItem, ...current], (get().recordsByForm[key]?.offset) || 0, true);
    } catch (e) {
      set({ error: e });
      throw e;
    } finally {
      set({ submitting: false });
    }
  },

  deleteRecord: async (formId, id) => {
    if (!formId || !id) return;
    set({ deletingId: id, error: null });
    try {
      await RecordApi.remove(id);
      const key = String(formId);
      const current = (get().recordsByForm[key]?.items) || [];
      const next = current.filter((r) => r.id !== id);
      get().setRecordsForForm(formId, next, (get().recordsByForm[key]?.offset) || 0, true);
    } catch (e) {
      set({ error: e });
      throw e;
    } finally {
      set({ deletingId: null });
    }
  },
}));
