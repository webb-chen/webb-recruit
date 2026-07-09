/**
 * Webb招聘助手 - 用户认证状态管理
 * 使用Zustand管理用户登录状态、JWT令牌
 */
import { create } from 'zustand';
import type { User } from '../types/models';
import * as authApi from '../api/auth';

/** 认证状态接口 */
interface AuthState {
  /** 当前用户信息 */
  user: User | null;
  /** JWT访问令牌 */
  token: string | null;
  /** 是否已登录 */
  isAuthenticated: boolean;
  /** 登录操作 */
  login: (username: string, password: string) => Promise<void>;
  /** 登出操作 */
  logout: () => void;
  /** 加载已保存的登录状态 */
  loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  /** 登录 - 调用API并保存令牌 */
  login: async (username, password) => {
    try {
      const res = await authApi.login({ username, password });
      const { access_token, user } = res.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      set({
        token: access_token,
        user: user as User,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },

  /** 登出 - 清除令牌和状态 */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  /** 加载已保存的登录状态 - 页面刷新时恢复 */
  loadAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }
    try {
      const res = await authApi.getMe();
      set({
        user: res.data,
        token,
        isAuthenticated: true,
      });
    } catch {
      // 令牌失效，清除登录状态
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ isAuthenticated: false, user: null, token: null });
    }
  },
}));
