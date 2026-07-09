/**
 * Webb招聘助手 - API响应类型定义
 * 定义统一的API响应数据结构
 */

/** 通用API响应 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/** 分页API响应 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** 登录响应数据 */
export interface LoginResponseData {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    username: string;
    email?: string;
    role: string;
  };
}
