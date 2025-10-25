import { create } from 'zustand';
import Constants from 'expo-constants';

// CN: 从 Expo extra 读取初始的用户名与 JWT，便于全局使用
const { USERNAME, JWT_TOKEN } = Constants.expoConfig?.extra || {};

export const useAppStore = create((set, get) => ({
  // CN: 用户与认证
  username: USERNAME || '',
  jwtToken: JWT_TOKEN || '',
  setAuth: ({ username, jwtToken }) => set({ username, jwtToken }),

  // CN: 表单缓存（用于简单的内存层缓存）
  forms: [],
  setForms: (forms) => set({ forms: Array.isArray(forms) ? forms : [] }),
}));
