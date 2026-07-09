/**
 * Webb招聘助手 - 候选人管理API
 * 处理候选人的增删改查、批量操作、简历管理
 */
import { request } from './client';
import type {
  Candidate,
  CandidateStatus,
  BatchUpdateStatusParams,
  PaginationParams,
} from '../types/models';
import type { PaginatedResponse } from '../types/api';

/** 获取候选人列表 */
export const getCandidates = (params: PaginationParams & {
  status?: CandidateStatus;
  keyword?: string;
  sourcePlatform?: string;
  jobId?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => request.get<PaginatedResponse<Candidate>>('/candidates', params as object);

/** 获取候选人详情 */
export const getCandidateDetail = (id: number) =>
  request.get<Candidate>(`/candidates/${id}`);

/** 创建候选人 */
export const createCandidate = (data: Partial<Candidate>) =>
  request.post<Candidate>('/candidates', data);

/** 更新候选人 */
export const updateCandidate = (id: number, data: Partial<Candidate>) =>
  request.put<Candidate>(`/candidates/${id}`, data);

/** 删除候选人 */
export const deleteCandidate = (id: number) =>
  request.delete(`/candidates/${id}`);

/** 批量更新候选人状态 */
export const batchUpdateStatus = (params: BatchUpdateStatusParams) =>
  request.post('/candidates/batch-status', params);

/** 批量下载简历 */
export const batchDownloadResumes = (ids: number[]) =>
  request.post('/candidates/batch-download', { ids });

/** 导出候选人数据 */
export const exportCandidates = (params: {
  status?: CandidateStatus;
  sourcePlatform?: string;
  format?: 'excel' | 'csv';
}) => request.get('/candidates/export', params as object);

/** 上传简历文件 */
export const uploadResume = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.upload<Candidate>('/candidates/upload-resume', formData);
};
