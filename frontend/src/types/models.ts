/**
 * Webb招聘助手 - 数据模型类型定义
 * 定义系统中所有核心数据结构的TypeScript接口
 */

// ===== 用户相关 =====
/** 用户信息 */
export interface User {
  id: number;
  username: string;
  email?: string;
  role: 'admin' | 'hr' | 'viewer';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

/** 登录请求参数 */
export interface LoginParams {
  username: string;
  password: string;
}

/** 注册请求参数 */
export interface RegisterParams {
  username: string;
  password: string;
  email?: string;
}

// ===== 岗位相关 =====
/** 招聘岗位状态 */
export type JobStatus = 'active' | 'paused' | 'closed';

/** 招聘岗位 */
export interface Job {
  id: number;
  title: string;
  companyName: string;
  platform: 'boss' | 'lagou' | 'liepin' | 'zhilian';
  salaryRange: string;
  workCity: string;
  workExperience: string;
  education: string;
  description: string;
  requirements: string;
  status: JobStatus;
  sourceUrl?: string;
  greetingsTemplate?: string;
  dailyLimit: number;
  contactedCount: number;
  createdAt: string;
  updatedAt: string;
}

/** 创建/编辑岗位参数 */
export interface JobFormData {
  title: string;
  companyName: string;
  platform: Job['platform'];
  salaryRange: string;
  workCity: string;
  workExperience: string;
  education: string;
  description: string;
  requirements: string;
  status?: JobStatus;
  sourceUrl?: string;
  greetingsTemplate?: string;
  dailyLimit?: number;
}

// ===== 候选人相关 =====
/** 候选人状态 */
export type CandidateStatus =
  | 'new'
  | 'contacted'
  | 'replied'
  | 'interested'
  | 'interviewed'
  | 'offered'
  | 'rejected'
  | 'blacklisted';

/** 候选人信息 */
export interface Candidate {
  id: number;
  name: string;
  gender?: 'male' | 'female';
  age?: number;
  phone?: string;
  email?: string;
  currentCompany?: string;
  currentTitle?: string;
  education?: string;
  workExperience?: number;
  skills?: string[];
  resumeUrl?: string;
  avatarUrl?: string;
  sourcePlatform?: string;
  sourceJobId?: number;
  status: CandidateStatus;
  tags?: string[];
  remarks?: string;
  lastContactedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** 批量更新候选人状态参数 */
export interface BatchUpdateStatusParams {
  ids: number[];
  status: CandidateStatus;
}

// ===== 统计数据 =====
/** 每日进度统计 */
export interface DailyProgress {
  date: string;
  jobsCount: number;
  contactedCount: number;
  repliedCount: number;
  interestedCount: number;
  interviewedCount: number;
}

/** 仪表盘概览统计 */
export interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalCandidates: number;
  todayContacted: number;
  todayReplied: number;
  weekGrowth: number;
}

// ===== 消息相关 =====
/** 消息类型 */
export type MessageType = 'sent' | 'received';

/** 消息记录 */
export interface Message {
  id: number;
  candidateId: number;
  type: MessageType;
  content: string;
  platform: string;
  sentAt: string;
  isRead: boolean;
}

// ===== 模板相关 =====
/** 消息模板类型 */
export type TemplateType = 'greetings' | 'follow_up' | 'invitation' | 'rejection';

/** 消息模板 */
export interface Template {
  id: number;
  name: string;
  type: TemplateType;
  content: string;
  variables?: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 创建/编辑模板参数 */
export interface TemplateFormData {
  name: string;
  type: TemplateType;
  content: string;
  isDefault?: boolean;
}

// ===== 自动化相关 =====
/** 机器人操作日志 */
export interface BotActionLog {
  id: number;
  action: 'login' | 'search' | 'greet' | 'reply' | 'error' | 'pause' | 'resume';
  platform: string;
  target?: string;
  content?: string;
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;
  createdAt: string;
}

/** 平台账号状态 */
export interface PlatformAccount {
  platform: string;
  isLoggedIn: boolean;
  lastCheckAt?: string;
  cookieExpiry?: string;
}

// ===== 分页 =====
export interface PaginationParams {
  page: number;
  pageSize: number;
}
