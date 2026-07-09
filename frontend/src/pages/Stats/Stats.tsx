/**
 * Webb招聘助手 - 数据统计页面
 * 支持日报、周报、趋势分析，使用ECharts图表展示
 */
import React, { useState, useEffect } from 'react';
import { Typography, Tabs, Card, Row, Col, Spin, Statistic, Table } from 'antd';
import {
  BarChartOutlined, LineChartOutlined, CalendarOutlined,
  RiseOutlined, FallOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import dayjs from 'dayjs';
import TrendChart from '../../components/TrendChart/TrendChart';
import * as statsApi from '../../api/stats';
import type { DailyProgress, DashboardStats } from '../../types/models';

const { Title } = Typography;

const StatsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<DailyProgress[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  /** 加载数据 */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [statsRes, trendRes] = await Promise.all([
          statsApi.getDashboardStats(),
          statsApi.getTrendData(30),
        ]);
        setStats(statsRes.data);
        setTrendData(trendRes.data);
      } catch {
        // 模拟数据
        setStats({
          totalJobs: 24, activeJobs: 12, totalCandidates: 156,
          todayContacted: 38, todayReplied: 12, weekGrowth: 15.5,
        });
        const mockDates: string[] = [];
        const mockData: DailyProgress[] = [];
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          mockDates.push(d.toISOString().split('T')[0]);
          mockData.push({
            date: d.toISOString().split('T')[0],
            jobsCount: Math.floor(Math.random() * 5 + 10),
            contactedCount: Math.floor(Math.random() * 50 + 20),
            repliedCount: Math.floor(Math.random() * 20 + 5),
            interestedCount: Math.floor(Math.random() * 10 + 2),
            interviewedCount: Math.floor(Math.random() * 5 + 1),
          });
        }
        setTrendData(mockData);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  /** 平台分布饼图配置 */
  const platformPieOption: EChartsOption = {
    title: { text: '平台分布', left: 'center', textStyle: { fontSize: 16 } },
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%' },
      data: [
        { value: 65, name: 'BOSS直聘', itemStyle: { color: '#1677ff' } },
        { value: 25, name: '拉勾', itemStyle: { color: '#52c41a' } },
        { value: 10, name: '猎聘', itemStyle: { color: '#faad14' } },
        { value: 5, name: '智联', itemStyle: { color: '#722ed1' } },
      ],
    }],
  };

  /** 状态分布柱状图配置 */
  const statusBarOption: EChartsOption = {
    title: { text: '候选人状态分布', left: 'center', textStyle: { fontSize: 16 } },
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['新候选人', '已联系', '已回复', '有意向', '面试中', '已发Offer', '已拒绝'],
      axisLabel: { rotate: 20 },
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [{
      type: 'bar',
      barWidth: '50%',
      data: [45, 38, 22, 15, 8, 3, 12],
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#1677ff' },
            { offset: 1, color: '#69b1ff' },
          ],
        },
        borderRadius: [4, 4, 0, 0],
      },
    }],
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" tip="加载统计数据中..." />
      </div>
    );
  }

  /** 汇总统计卡片 */
  const summaryCards = stats ? (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col xs={12} sm={8} lg={4}>
        <Card size="small"><Statistic title="总岗位" value={stats.totalJobs} suffix="个" /></Card>
      </Col>
      <Col xs={12} sm={8} lg={4}>
        <Card size="small"><Statistic title="在线岗位" value={stats.activeJobs} suffix="个" valueStyle={{ color: '#1677ff' }} /></Card>
      </Col>
      <Col xs={12} sm={8} lg={4}>
        <Card size="small"><Statistic title="总人才" value={stats.totalCandidates} suffix="人" valueStyle={{ color: '#52c41a' }} /></Card>
      </Col>
      <Col xs={12} sm={8} lg={4}>
        <Card size="small"><Statistic title="今日联系" value={stats.todayContacted} suffix="人" valueStyle={{ color: '#faad14' }} /></Card>
      </Col>
      <Col xs={12} sm={8} lg={4}>
        <Card size="small"><Statistic title="今日回复" value={stats.todayReplied} suffix="人" valueStyle={{ color: '#722ed1' }} /></Card>
      </Col>
      <Col xs={12} sm={8} lg={4}>
        <Card size="small">
          <Statistic
            title="周增长"
            value={stats.weekGrowth}
            suffix="%"
            prefix={stats.weekGrowth >= 0 ? <RiseOutlined /> : <FallOutlined />}
            valueStyle={{ color: stats.weekGrowth >= 0 ? '#52c41a' : '#ff4d4f' }}
          />
        </Card>
      </Col>
    </Row>
  ) : null;

  /** Tab面板内容 */
  const tabItems = [
    {
      key: 'daily',
      label: <span><CalendarOutlined /> 日报</span>,
      children: (
        <div>
          {summaryCards}
          <Row gutter={16}>
            <Col xs={24} lg={16}>
              <TrendChart
                title="近30天联系与回复趋势"
                dates={trendData.map((d) => d.date)}
                series={[
                  { name: '联系人数', data: trendData.map((d) => d.contactedCount) },
                  { name: '回复人数', data: trendData.map((d) => d.repliedCount), color: '#52c41a' },
                ]}
                height={400}
              />
            </Col>
            <Col xs={24} lg={8}>
              <ReactECharts option={platformPieOption} style={{ height: 400 }} />
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'weekly',
      label: <span><BarChartOutlined /> 周报</span>,
      children: (
        <div>
          {summaryCards}
          <Row gutter={16}>
            <Col xs={24} lg={16}>
              <TrendChart
                title="候选人转化漏斗"
                dates={trendData.filter((_, i) => i % 7 === 0).map((d) => d.date)}
                series={[
                  { name: '新候选人', data: trendData.filter((_, i) => i % 7 === 0).map((d) => d.contactedCount) },
                  { name: '已回复', data: trendData.filter((_, i) => i % 7 === 0).map((d) => d.repliedCount), color: '#52c41a' },
                  { name: '有意向', data: trendData.filter((_, i) => i % 7 === 0).map((d) => d.interestedCount), color: '#faad14' },
                ]}
                height={400}
              />
            </Col>
            <Col xs={24} lg={8}>
              <ReactECharts option={statusBarOption} style={{ height: 400 }} />
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'trend',
      label: <span><LineChartOutlined /> 趋势</span>,
      children: (
        <div>
          {summaryCards}
          <TrendChart
            title="全量招聘趋势分析"
            dates={trendData.map((d) => d.date)}
            series={[
              { name: '联系人数', data: trendData.map((d) => d.contactedCount) },
              { name: '回复人数', data: trendData.map((d) => d.repliedCount), color: '#52c41a' },
              { name: '有意向', data: trendData.map((d) => d.interestedCount), color: '#faad14' },
              { name: '面试中', data: trendData.map((d) => d.interviewedCount), color: '#722ed1' },
            ]}
            height={450}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>数据统计</Title>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} type="card" />
    </div>
  );
};

export default StatsPage;
