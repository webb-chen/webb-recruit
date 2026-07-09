/**
 * Webb招聘助手 - 统计数据API
 * 处理仪表盘统计、日报、周报、趋势数据
 */
import { request } from './client';
import type { DashboardStats, DailyProgress } from '../types/models';

/** 获取仪表盘概览统计 */
export const getDashboardStats = () =>
  request.get<DashboardStats>('/stats/dashboard');

/** 获取每日统计数据 */
export const getDailyStats = (date?: string) =>
  request.get<DailyProgress>('/stats/daily', { date: date || '' } as object);

/** 获取每周统计数据 */
export const getWeeklyStats = () =>
  request.get<DailyProgress[]>('/stats/weekly');

/** 获取趋势数据（指定天数） */
export const getTrendData = (days?: number) =>
  request.get<DailyProgress[]>('/stats/trend', {
    days: days || 30,
  } as object);
