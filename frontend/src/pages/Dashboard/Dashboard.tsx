/**
 * Webb招聘助手 - 仪表盘页面
 * 展示招聘概览数据、趋势图和最近操作日志
 */
import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Tag, Typography, Spin, message } from 'antd';
import {
  BankOutlined,
  TeamOutlined,
  SendOutlined,
  MessageOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import StatCard from '../../components/StatCard/StatCard';
import TrendChart from '../../components/TrendChart/TrendChart';
import * as statsApi from '../../api/stats';
import * as automationApi from '../../api/automation';
import type { DashboardStats, DailyProgress, BotActionLog } from '../../types/models';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    todayContacted: 0,
    todayReplied: 0,
    weekGrowth: 0,
  });
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendData, setTrendData] = useState<DailyProgress[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logs, setLogs] = useState<BotActionLog[]>([]);

  /** 加载仪表盘统计 */
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await statsApi.getDashboardStats();
        setStats(res.data);
      } catch {
        // 使用模拟数据
        setStats({
          totalJobs: 24,
          activeJobs: 12,
          totalCandidates: 156,
          todayContacted: 38,
          todayReplied: 12,
          weekGrowth: 15.5,
        });
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  /** 加载趋势数据 */
  useEffect(() => {
    const loadTrend = async () => {
      try {
        const res = await statsApi.getTrendData(14);
        setTrendData(res.data);
      } catch {
        // 使用模拟趋势数据
        const mockDates: string[] = [];
        const mockContacted: number[] = [];
        const mockReplied: number[] = [];
        for (let i = 13; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          mockDates.push(d.toISOString().split('T')[0]);
          mockContacted.push(Math.floor(Math.random() * 40 + 20));
          mockReplied.push(Math.floor(Math.random() * 15 + 5));
        }
        setTrendData(
          mockDates.map((date, i) => ({
            date,
            contactedCount: mockContacted[i],
            repliedCount: mockReplied[i],
            jobsCount: 0,
            interestedCount: 0,
            interviewedCount: 0,
          }))
        );
      } finally {
        setTrendLoading(false);
      }
    };
    loadTrend();
  }, []);

  /** 加载操作日志 */
  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await automationApi.getAutomationLogs({ page: 1, pageSize: 10 });
        setLogs(res.data.items);
      } catch {
        // 使用模拟日志数据
        setLogs([
          { id: 1, action: 'greet', platform: 'BOSS直聘', content: '向候选人发送打招呼', status: 'success', createdAt: new Date().toISOString() },
          { id: 2, action: 'reply', platform: 'BOSS直聘', content: '收到候选人回复', status: 'success', createdAt: new Date().toISOString() },
          { id: 3, action: 'search', platform: 'BOSS直聘', content: '搜索匹配候选人', status: 'success', createdAt: new Date().toISOString() },
          { id: 4, action: 'error', platform: 'BOSS直聘', content: 'Cookie已过期，需要重新登录', status: 'failed', errorMessage: 'Cookie expired', createdAt: new Date().toISOString() },
          { id: 5, action: 'greet', platform: '猎聘', content: '向候选人发送打招呼', status: 'success', createdAt: new Date().toISOString() },
        ]);
      } finally {
        setLogsLoading(false);
      }
    };
    loadLogs();
  }, []);

  /** 操作日志表格列定义 */
  const logColumns = [
    {
      title: '操作类型',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (action: string) => {
        const map: Record<string, { label: string; color: string }> = {
          login: { label: '登录', color: 'blue' },
          search: { label: '搜索', color: 'cyan' },
          greet: { label: '打招呼', color: 'green' },
          reply: { label: '回复', color: 'orange' },
          error: { label: '异常', color: 'red' },
          pause: { label: '暂停', color: 'default' },
          resume: { label: '恢复', color: 'processing' },
        };
        const info = map[action] || { label: action, color: 'default' };
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    { title: '平台', dataIndex: 'platform', key: 'platform', width: 100 },
    { title: '内容', dataIndex: 'content', key: 'content', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'success' ? 'green' : status === 'failed' ? 'red' : 'processing'}>
          {status === 'success' ? '成功' : status === 'failed' ? '失败' : '进行中'}
        </Tag>
      ),
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (t: string) => new Date(t).toLocaleString('zh-CN'),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        工作台
      </Title>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="在线岗位"
            value={stats.activeJobs}
            icon={<BankOutlined style={{ color: '#1677ff' }} />}
            suffix="个"
            loading={statsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="总人才数"
            value={stats.totalCandidates}
            icon={<TeamOutlined style={{ color: '#52c41a' }} />}
            suffix="人"
            loading={statsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="今日已联系"
            value={stats.todayContacted}
            icon={<SendOutlined style={{ color: '#faad14' }} />}
            suffix="人"
            trend={stats.weekGrowth}
            loading={statsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="今日回复"
            value={stats.todayReplied}
            icon={<MessageOutlined style={{ color: '#722ed1' }} />}
            suffix="人"
            loading={statsLoading}
          />
        </Col>
      </Row>

      {/* 趋势图 */}
      <div style={{ marginBottom: 24 }}>
        <TrendChart
          title="近14天招聘趋势"
          dates={trendData.map((d) => d.date)}
          series={[
            { name: '联系人数', data: trendData.map((d) => d.contactedCount) },
            { name: '回复人数', data: trendData.map((d) => d.repliedCount), color: '#52c41a' },
          ]}
          loading={trendLoading}
        />
      </div>

      {/* 最近操作日志 */}
      <Title level={5}>最近操作日志</Title>
      <Table
        columns={logColumns}
        dataSource={logs}
        rowKey="id"
        loading={logsLoading}
        pagination={false}
        size="small"
      />
    </div>
  );
};

export default DashboardPage;
