/**
 * Webb招聘助手 - 认证相关API
 * 处理用户登录、注册、个人信息管理
 */
import { request } from './client';
import type { User, LoginParams, RegisterParams } from '../types/models';
import type { LoginResponseData } from '../types/api';

/** 用户登录 */
export const login = (params: LoginParams) =>
  request.post<LoginResponseData>('/auth/login', params);

/** 用户注册 */
export const register = (params: RegisterParams) =>
  request.post<LoginResponseData>('/auth/register', params);

/** 获取当前用户信息 */
export const getMe = () => request.get<User>('/auth/me');

/** 更新当前用户信息 */
export const updateMe = (data: Partial<Pick<User, 'email' | 'username'>>) =>
  request.put<User>('/auth/me', data);

/** 修改密码 */
export const changePassword = (data: {
  oldPassword: string;
  newPassword: string;
}) => request.put('/auth/me/password', data);
