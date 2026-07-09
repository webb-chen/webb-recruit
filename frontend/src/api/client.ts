/**
 * Webb招聘助手 - Axios HTTP客户端封装
 * 统一管理API请求配置、JWT令牌注入、错误处理
 */
import axios from 'axios';
import type { ApiResponse } from '../types/api';

// 创建axios实例，配置基础URL和超时
const apiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 自动注入JWT令牌
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 统一处理错误
apiClient.interceptors.response.use(
  (response) => {
    // 如果后端包装了ApiResponse，直接返回data部分
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      // 401未授权 - 跳转登录页
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      // 403禁止访问
      if (status === 403) {
        console.error('没有权限访问该资源');
      }
      // 500服务器错误
      if (status >= 500) {
        console.error('服务器内部错误，请稍后重试');
      }
    }
    return Promise.reject(error);
  }
);

// 导出封装的请求方法
export const request = {
  get: <T = unknown>(url: string, params?: object) =>
    apiClient.get<ApiResponse<T>>(url, { params }).then((res) => res.data),

  post: <T = unknown>(url: string, data?: object) =>
    apiClient.post<ApiResponse<T>>(url, data).then((res) => res.data),

  put: <T = unknown>(url: string, data?: object) =>
    apiClient.put<ApiResponse<T>>(url, data).then((res) => res.data),

  delete: <T = unknown>(url: string) =>
    apiClient.delete<ApiResponse<T>>(url).then((res) => res.data),

  // 文件上传专用方法
  upload: <T = unknown>(url: string, formData: FormData) =>
    apiClient
      .post<ApiResponse<T>>(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data),
};

export default apiClient;
