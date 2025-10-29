import { create } from 'zustand';
import Constants from 'expo-constants';
import { FormApi, FieldApi, RecordApi, buildJsonbFilterQuery, apiRequest } from '../lib/api';

// CN: 从 Expo extra 读取初始的用户名与 JWT，便于全局使用
const { USERNAME, JWT_TOKEN } = Constants.expoConfig?.extra || {};

export const useAppStore = create((set, get) => ({
  // CN: 用户与认证
  username: USERNAME || '',
  jwtToken: JWT_TOKEN || '',
  setAuth: ({ username, jwtToken }) => set({ username, jwtToken }),

  // CN: 表单数据与状态
  forms: [],
  loading: false,
  submitting: false,
  deletingId: null,
  error: null,

  // CN: 字段数据（按 formId 归档）
  fieldsByForm: {},
  recordsByForm: {}, // CN: { [formId]: { items: [], offset, hasMore } }

  // CN: 内部通用 setter
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

  // CN: Actions —— 统一封装 API 调用，页面只调这些方法
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

  // CN: 字段 Actions —— 列表与创建（先支持 text）
  fetchFields: async (formId) => {
    if (!formId) return;
    set({ loading: true, error: null });
    try {
      const data = await FieldApi.listByForm(formId);
      const arr = Array.isArray(data) ? data : [];
      // CN: 渲染按 order_index 升序
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
      // CN: 后端字段为 field_type（非 type），并需要 required/is_num/order_index
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

  // CN: 字段排序：批量更新 order_index
  reorderFields: async (formId, orderedIds) => {
    if (!formId || !Array.isArray(orderedIds)) return;
    // 本地更新
    const current = get().fieldsByForm[String(formId)] || [];
    const idToField = new Map(current.map((f) => [f.id, f]));
    const next = orderedIds.map((id, idx) => ({ ...idToField.get(id), order_index: idx + 1 }));
    get().setFieldsForForm(formId, next);
    // 持久化（串行，避免版本冲突）。失败不抛出，以免阻塞 UI
    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i];
      try { await FieldApi.update(id, { order_index: i + 1 }); } catch {}
    }
  },

  // CN: 记录 Actions —— 列表/创建/删除（分页）
  fetchRecords: async (formId, { limit = 50, append = false, conditions, join = 'AND' } = {}) => {
    if (!formId) return;
    set({ loading: true, error: null });
    try {
      const state = get().recordsByForm[String(formId)] || { items: [], offset: 0 };
      const offset = 0; // CN: 去除分页，始终从 0 开始
      let list;
      if (Array.isArray(conditions) && conditions.length > 0) {
        const base = buildJsonbFilterQuery(formId, conditions, join);
        const endpoint = `${base}&limit=${limit}&offset=${offset}`;
        list = await apiRequest(endpoint, 'GET');
      } else {
        list = await RecordApi.listByForm(formId, { limit, offset });
      }
      const items = Array.isArray(list) ? list : [];
      // CN: 去重，避免“重复数据”视觉问题（按 id 去重）
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
