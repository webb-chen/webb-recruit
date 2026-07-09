/**
 * Webb招聘助手 - 消息模板API
 * 处理招呼语、跟进、面试邀请等模板的增删改查
 */
import { request } from './client';
import type { Template, TemplateFormData } from '../types/models';

/** 获取模板列表 */
export const getTemplates = (params?: {
  type?: string;
}) => request.get<Template[]>('/templates', params as object);

/** 创建模板 */
export const createTemplate = (data: TemplateFormData) =>
  request.post<Template>('/templates', data);

/** 更新模板 */
export const updateTemplate = (id: number, data: Partial<TemplateFormData>) =>
  request.put<Template>(`/templates/${id}`, data);

/** 删除模板 */
export const deleteTemplate = (id: number) =>
  request.delete(`/templates/${id}`);
