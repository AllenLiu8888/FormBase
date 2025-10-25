import { create } from 'zustand';
import Constants from 'expo-constants';
import { FormApi } from '../lib/api';

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

  // CN: 内部通用 setter
  setForms: (forms) => set({ forms: Array.isArray(forms) ? forms : [] }),
  setError: (error) => set({ error }),

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
}));
