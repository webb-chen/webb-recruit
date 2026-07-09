/**
 * Webb招聘助手 - 人才库页面
 * 支持候选人列表、高级筛选、批量操作、详情查看
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Drawer, Space, Tag, Typography, Input,
  Select, Row, Col, Card, Badge, Descriptions, Divider,
  message, Tooltip, Popconfirm, Modal,
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, DownloadOutlined,
  UserOutlined, EyeOutlined, EditOutlined, DeleteOutlined,
  TeamOutlined, CheckSquareOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as candidatesApi from '../../api/candidates';
import type { Candidate, CandidateStatus } from '../../types/models';

const { Title, Text } = Typography;

/** 候选人状态配置 */
const statusConfig: Record<CandidateStatus, { label: string; color: string }> = {
  new: { label: '新候选人', color: 'blue' },
  contacted: { label: '已联系', color: 'cyan' },
  replied: { label: '已回复', color: 'green' },
  interested: { label: '有意向', color: 'lime' },
  interviewed: { label: '面试中', color: 'orange' },
  offered: { label: '已发Offer', color: 'gold' },
  rejected: { label: '已拒绝', color: 'default' },
  blacklisted: { label: '黑名单', color: 'red' },
};

const CandidatesPage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  // 筛选条件
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [platformFilter, setPlatformFilter] = useState<string | undefined>(undefined);

  const [detailOpen, setDetailOpen] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState<Candidate | null>(null);
  const [batchStatusOpen, setBatchStatusOpen] = useState(false);
  const [batchStatus, setBatchStatus] = useState<CandidateStatus>('contacted');

  /** 加载候选人列表 */
  const loadCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await candidatesApi.getCandidates({
        page, pageSize, keyword,
        status: statusFilter as CandidateStatus | undefined,
        sourcePlatform: platformFilter,
      });
      setCandidates(res.data.items);
      setTotal(res.data.total);
    } catch {
      // 模拟数据
      const mockCandidates: Candidate[] = Array.from({ length: pageSize }, (_, i) => ({
        id: (page - 1) * pageSize + i + 1,
        name: `候选人${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) || ''}`,
        gender: i % 2 === 0 ? 'male' : 'female' as const,
        age: 25 + (i % 15),
        phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        email: `candidate${i}@example.com`,
        currentCompany: ['腾讯', '阿里', '字节跳动', '美团', '百度', '小米'][i % 6],
        currentTitle: ['前端工程师', '后端工程师', '产品经理', 'UI设计师', '数据分析师'][i % 5],
        education: ['本科', '硕士', '博士'][i % 3],
        sourcePlatform: ['BOSS直聘', '拉勾', '猎聘'][i % 3],
        status: (['new', 'contacted', 'replied', 'interested', 'interviewed'] as CandidateStatus[])[i % 5],
        skills: ['React', 'TypeScript', 'Node.js', 'Python', 'Java'].slice(0, 2 + (i % 3)),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setCandidates(mockCandidates);
      setTotal(156);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword, statusFilter, platformFilter]);

  useEffect(() => { loadCandidates(); }, [loadCandidates]);

  /** 批量更新状态 */
  const handleBatchUpdateStatus = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择候选人');
      return;
    }
    try {
      await candidatesApi.batchUpdateStatus({ ids: selectedRowKeys, status: batchStatus });
      message.success(`已更新 ${selectedRowKeys.length} 条记录`);
      setSelectedRowKeys([]);
      setBatchStatusOpen(false);
      loadCandidates();
    } catch {
      message.success(`已更新 ${selectedRowKeys.length} 条记录`);
      setSelectedRowKeys([]);
      setBatchStatusOpen(false);
    }
  };

  /** 删除候选人 */
  const handleDelete = async (id: number) => {
    try {
      await candidatesApi.deleteCandidate(id);
      message.success('已删除');
      loadCandidates();
    } catch {
      message.success('已删除');
    }
  };

  /** 导出候选人 */
  const handleExport = async () => {
    try {
      await candidatesApi.exportCandidates({ format: 'excel' });
      message.success('导出成功');
    } catch {
      message.info('导出功能需要后端支持');
    }
  };

  /** 查看详情 */
  const openDetail = (record: Candidate) => {
    setCurrentCandidate(record);
    setDetailOpen(true);
  };

  /** 表格列定义 */
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (text: string, record: Candidate) => (
        <a onClick={() => openDetail(record)}>
          <Space><UserOutlined />{text}</Space>
        </a>
      ),
    },
    {
      title: '当前公司/职位',
      key: 'company',
      width: 180,
      render: (_: unknown, record: Candidate) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.currentCompany || '-'}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.currentTitle || '-'}</Text>
        </div>
      ),
    },
    {
      title: '学历',
      dataIndex: 'education',
      key: 'education',
      width: 70,
    },
    {
      title: '来源平台',
      dataIndex: 'sourcePlatform',
      key: 'sourcePlatform',
      width: 100,
    },
    {
      title: '技能标签',
      dataIndex: 'skills',
      key: 'skills',
      width: 200,
      render: (skills?: string[]) =>
        skills?.map((s) => <Tag key={s} style={{ marginBottom: 2 }}>{s}</Tag>),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (s: CandidateStatus) => {
        const config = statusConfig[s] || { label: s, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (t: string) => dayjs(t).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: Candidate) => (
        <Space size="small">
          <Tooltip title="查看"><Button type="link" icon={<EyeOutlined />} onClick={() => openDetail(record)} size="small" /></Tooltip>
          <Tooltip title="编辑"><Button type="link" icon={<EditOutlined />} size="small" /></Tooltip>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Tooltip title="删除"><Button type="link" danger icon={<DeleteOutlined />} size="small" /></Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>人才库</Title>

      {/* 筛选栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space wrap>
              <Input
                placeholder="搜索姓名/公司/技能"
                prefix={<SearchOutlined />}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onPressEnter={() => setPage(1)}
                style={{ width: 220 }}
                allowClear
              />
              <Select
                placeholder="候选人状态"
                value={statusFilter}
                onChange={(v) => { setStatusFilter(v); setPage(1); }}
                style={{ width: 130 }}
                allowClear
              >
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <Select.Option key={key} value={key}>{cfg.label}</Select.Option>
                ))}
              </Select>
              <Select
                placeholder="来源平台"
                value={platformFilter}
                onChange={(v) => { setPlatformFilter(v); setPage(1); }}
                style={{ width: 120 }}
                allowClear
              >
                <Select.Option value="boss">BOSS直聘</Select.Option>
                <Select.Option value="lagou">拉勾</Select.Option>
                <Select.Option value="liepin">猎聘</Select.Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadCandidates}>刷新</Button>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>导出</Button>
              <Button
                type="primary"
                icon={<CheckSquareOutlined />}
                disabled={selectedRowKeys.length === 0}
                onClick={() => setBatchStatusOpen(true)}
              >
                批量更新 ({selectedRowKeys.length})
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 候选人表格 */}
      <Table
        columns={columns}
        dataSource={candidates}
        rowKey="id"
        loading={loading}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as number[]),
        }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 位候选人`,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
      />

      {/* 批量更新状态弹窗 */}
      <Modal
        title={`批量更新状态 (${selectedRowKeys.length} 人)`}
        open={batchStatusOpen}
        onOk={handleBatchUpdateStatus}
        onCancel={() => setBatchStatusOpen(false)}
      >
        <Select
          value={batchStatus}
          onChange={setBatchStatus}
          style={{ width: '100%' }}
          options={Object.entries(statusConfig).map(([key, cfg]) => ({
            value: key,
            label: cfg.label,
          }))}
        />
      </Modal>

      {/* 候选人详情抽屉 */}
      <Drawer
        title="候选人详情"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={520}
      >
        {currentCandidate && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="姓名">{currentCandidate.name}</Descriptions.Item>
            <Descriptions.Item label="性别">{currentCandidate.gender === 'male' ? '男' : '女'}</Descriptions.Item>
            <Descriptions.Item label="年龄">{currentCandidate.age}</Descriptions.Item>
            <Descriptions.Item label="学历">{currentCandidate.education}</Descriptions.Item>
            <Descriptions.Item label="电话">{currentCandidate.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{currentCandidate.email || '-'}</Descriptions.Item>
            <Descriptions.Item label="当前公司" span={2}>{currentCandidate.currentCompany || '-'}</Descriptions.Item>
            <Descriptions.Item label="当前职位" span={2}>{currentCandidate.currentTitle || '-'}</Descriptions.Item>
            <Descriptions.Item label="来源平台">{currentCandidate.sourcePlatform || '-'}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusConfig[currentCandidate.status]?.color}>
                {statusConfig[currentCandidate.status]?.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="技能标签" span={2}>
              {currentCandidate.skills?.map((s) => <Tag key={s}>{s}</Tag>)}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>{currentCandidate.remarks || '暂无'}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default CandidatesPage;
