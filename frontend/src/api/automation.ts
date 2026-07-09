/**
 * Webb招聘助手 - 自动化控制API
 * 处理打招呼机器人、登录状态、自动化日志
 */
import { request } from './client';
import type { BotActionLog, PlatformAccount } from '../types/models';
import type { PaginatedResponse } from '../types/api';

/** 启动打招呼机器人 */
export const startSayHello = (params?: {
  jobId?: number;
  limit?: number;
}) => request.post('/automation/say-hello/start', params);

/** 停止打招呼机器人 */
export const stopSayHello = () =>
  request.post('/automation/say-hello/stop');

/** 获取打招呼机器人状态 */
export const getSayHelloStatus = () =>
  request.get<{
    isRunning: boolean;
    jobId?: number;
    startTime?: string;
    contactedCount: number;
  }>('/automation/say-hello/status');

/** 提交平台登录Cookie */
export const submitLoginCookie = (params: {
  platform: string;
  cookie: string;
}) => request.post('/automation/login/cookie', params);

/** 检查平台登录状态 */
export const checkLoginStatus = (platform?: string) =>
  request.get<PlatformAccount[]>('/automation/login/status', {
    platform: platform || '',
  } as object);

/** 获取自动化操作日志 */
export const getAutomationLogs = (params: {
  page?: number;
  pageSize?: number;
  action?: string;
  platform?: string;
}) => request.get<PaginatedResponse<BotActionLog>>(
  '/automation/logs',
  params as object
);
