/**
 * Webb招聘助手 - 岗位管理API
 * 处理招聘岗位的增删改查、同步等操作
 */
import { request } from './client';
import type {
  Job,
  JobFormData,
  DailyProgress,
  PaginationParams,
} from '../types/models';
import type { PaginatedResponse } from '../types/api';

/** 获取岗位列表 */
export const getJobs = (params: PaginationParams & {
  status?: string;
  platform?: string;
  keyword?: string;
}) => request.get<PaginatedResponse<Job>>('/jobs', params as object);

/** 获取岗位详情 */
export const getJobDetail = (id: number) =>
  request.get<Job>(`/jobs/${id}`);

/** 创建岗位 */
export const createJob = (data: JobFormData) =>
  request.post<Job>('/jobs', data);

/** 更新岗位 */
export const updateJob = (id: number, data: Partial<JobFormData>) =>
  request.put<Job>(`/jobs/${id}`, data);

/** 删除岗位 */
export const deleteJob = (id: number) =>
  request.delete(`/jobs/${id}`);

/** 同步岗位（从招聘平台拉取） */
export const syncJob = (id: number) =>
  request.post<Job>(`/jobs/${id}/sync`);

/** 获取岗位每日进度 */
export const getJobProgress = (jobId: number, days?: number) =>
  request.get<DailyProgress[]>(`/jobs/${jobId}/progress`, {
    days: days || 7,
  } as object);
