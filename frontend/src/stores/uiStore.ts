/**
 * Webb招聘助手 - UI状态管理
 * 管理侧边栏折叠等界面状态
 */
import { create } from 'zustand';

/** UI状态接口 */
interface UIState {
  /** 侧边栏是否折叠 */
  sidebarCollapsed: boolean;
  /** 切换侧边栏折叠状态 */
  toggleSidebar: () => void;
  /** 设置侧边栏折叠状态 */
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) =>
    set({ sidebarCollapsed: collapsed }),
}));
