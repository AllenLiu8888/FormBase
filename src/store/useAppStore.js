import { create } from 'zustand';
import Constants from 'expo-constants';
import { FormApi, FieldApi } from '../lib/api';

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

  // CN: 内部通用 setter
  setForms: (forms) => set({ forms: Array.isArray(forms) ? forms : [] }),
  setError: (error) => set({ error }),
  setFieldsForForm: (formId, fields) =>
    set((s) => ({ fieldsByForm: { ...s.fieldsByForm, [String(formId)]: Array.isArray(fields) ? fields : [] } })),

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
      get().setFieldsForForm(formId, Array.isArray(data) ? data : []);
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
}));
