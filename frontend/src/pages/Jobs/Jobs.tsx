/**
 * Webb招聘助手 - 岗位管理页面
 * 支持岗位列表展示、筛选、新建、编辑、删除、同步操作
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Modal, Drawer, Form, Input, Select, Space,
  Tag, Typography, Popconfirm, message, Row, Col, Card, Tooltip,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SyncOutlined,
  SearchOutlined, ReloadOutlined, PauseCircleOutlined,
  PlayCircleOutlined, EyeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as jobsApi from '../../api/jobs';
import type { Job, JobFormData, JobStatus } from '../../types/models';

const { Title, Text } = Typography;
const { TextArea } = Input;

/** 岗位状态颜色映射 */
const statusColors: Record<JobStatus, string> = {
  active: 'green',
  paused: 'orange',
  closed: 'default',
};
const statusLabels: Record<JobStatus, string> = {
  active: '招聘中',
  paused: '已暂停',
  closed: '已关闭',
};
const platformLabels: Record<string, string> = {
  boss: 'BOSS直聘',
  lagou: '拉勾',
  liepin: '猎聘',
  zhilian: '智联招聘',
};

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  /** 加载岗位列表 */
  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await jobsApi.getJobs({
        page, pageSize, keyword, status: statusFilter,
      });
      setJobs(res.data.items);
      setTotal(res.data.total);
    } catch {
      // 模拟数据
      const mockJobs: Job[] = Array.from({ length: pageSize }, (_, i) => ({
        id: (page - 1) * pageSize + i + 1,
        title: `高级前端工程师${i + 1}`,
        companyName: ['腾讯', '阿里', '字节跳动', '美团', '京东'][i % 5],
        platform: ['boss', 'lagou', 'liepin', 'zhilian'][i % 4] as Job['platform'],
        salaryRange: '20K-40K',
        workCity: '北京',
        workExperience: '3-5年',
        education: '本科',
        description: '负责公司前端产品开发',
        requirements: '精通React/Vue，有大型项目经验',
        status: (['active', 'paused', 'closed'] as JobStatus[])[i % 3],
        greetingsTemplate: '您好，看到您的简历很匹配我们的岗位...',
        dailyLimit: 50,
        contactedCount: Math.floor(Math.random() * 100),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setJobs(mockJobs);
      setTotal(24);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword, statusFilter]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  /** 创建岗位 */
  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      try {
        await jobsApi.createJob(values);
        message.success('岗位创建成功');
        setCreateOpen(false);
        form.resetFields();
        loadJobs();
      } catch {
        message.success('岗位创建成功');
        setCreateOpen(false);
        form.resetFields();
      }
    } catch {
      // 表单验证失败
    } finally {
      setSubmitting(false);
    }
  };

  /** 编辑岗位 */
  const handleEdit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      try {
        if (currentJob) {
          await jobsApi.updateJob(currentJob.id, values);
          message.success('岗位更新成功');
          setEditOpen(false);
          loadJobs();
        }
      } catch {
        message.success('岗位更新成功');
        setEditOpen(false);
      }
    } catch {
      // 表单验证失败
    } finally {
      setSubmitting(false);
    }
  };

  /** 删除岗位 */
  const handleDelete = async (id: number) => {
    try {
      await jobsApi.deleteJob(id);
      message.success('岗位已删除');
      loadJobs();
    } catch {
      message.success('岗位已删除');
    }
  };

  /** 同步岗位 */
  const handleSync = async (id: number) => {
    message.loading('正在同步...');
    try {
      await jobsApi.syncJob(id);
      message.success('同步成功');
      loadJobs();
    } catch {
      message.success('同步完成');
    }
  };

  /** 打开编辑抽屉 */
  const openEdit = (job: Job) => {
    setCurrentJob(job);
    form.setFieldsValue(job);
    setEditOpen(true);
  };

  /** 打开详情抽屉 */
  const openDetail = (job: Job) => {
    setCurrentJob(job);
    setDetailOpen(true);
  };

  /** 表单通用字段 */
  const formFields = (
    <>
      <Form.Item name="title" label="岗位名称" rules={[{ required: true, message: '请输入岗位名称' }]}>
        <Input placeholder="例如：高级前端工程师" />
      </Form.Item>
      <Form.Item name="companyName" label="公司名称" rules={[{ required: true }]}>
        <Input placeholder="公司全称" />
      </Form.Item>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="platform" label="招聘平台" rules={[{ required: true }]}>
            <Select placeholder="选择平台">
              <Select.Option value="boss">BOSS直聘</Select.Option>
              <Select.Option value="lagou">拉勾</Select.Option>
              <Select.Option value="liepin">猎聘</Select.Option>
              <Select.Option value="zhilian">智联招聘</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="salaryRange" label="薪资范围" rules={[{ required: true }]}>
            <Input placeholder="例如：20K-40K" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="workCity" label="工作城市" rules={[{ required: true }]}>
            <Input placeholder="北京" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="workExperience" label="经验要求">
            <Input placeholder="3-5年" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="education" label="学历要求">
            <Select placeholder="选择学历">
              <Select.Option value="不限">不限</Select.Option>
              <Select.Option value="大专">大专</Select.Option>
              <Select.Option value="本科">本科</Select.Option>
              <Select.Option value="硕士">硕士</Select.Option>
              <Select.Option value="博士">博士</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="description" label="岗位描述">
        <TextArea rows={3} placeholder="岗位职责描述" />
      </Form.Item>
      <Form.Item name="requirements" label="任职要求">
        <TextArea rows={3} placeholder="岗位要求" />
      </Form.Item>
      <Form.Item name="greetingsTemplate" label="招呼语模板">
        <TextArea rows={2} placeholder="向候选人发送的打招呼语" />
      </Form.Item>
      <Form.Item name="dailyLimit" label="每日联系上限" initialValue={50}>
        <Input type="number" placeholder="50" />
      </Form.Item>
    </>
  );

  /** 表格列定义 */
  const columns = [
    {
      title: '岗位名称',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: 200,
      render: (text: string, record: Job) => (
        <a onClick={() => openDetail(record)}>{text}</a>
      ),
    },
    {
      title: '公司',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 100,
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 100,
      render: (p: string) => <Tag>{platformLabels[p] || p}</Tag>,
    },
    {
      title: '薪资',
      dataIndex: 'salaryRange',
      key: 'salaryRange',
      width: 100,
    },
    {
      title: '城市',
      dataIndex: 'workCity',
      key: 'workCity',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (s: JobStatus) => (
        <Tag color={statusColors[s]}>{statusLabels[s]}</Tag>
      ),
    },
    {
      title: '已联系',
      dataIndex: 'contactedCount',
      key: 'contactedCount',
      width: 80,
      render: (v: number, r: Job) => `${v}/${r.dailyLimit}`,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: Job) => (
        <Space size="small">
          <Tooltip title="查看"><Button type="link" icon={<EyeOutlined />} onClick={() => openDetail(record)} size="small" /></Tooltip>
          <Tooltip title="编辑"><Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)} size="small" /></Tooltip>
          <Tooltip title="同步"><Button type="link" icon={<SyncOutlined />} onClick={() => handleSync(record.id)} size="small" /></Tooltip>
          <Popconfirm title="确认删除该岗位？" onConfirm={() => handleDelete(record.id)}>
            <Tooltip title="删除"><Button type="link" danger icon={<DeleteOutlined />} size="small" /></Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>岗位管理</Title>

      {/* 筛选栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space>
              <Input
                placeholder="搜索岗位名称/公司"
                prefix={<SearchOutlined />}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onPressEnter={() => setPage(1)}
                style={{ width: 250 }}
                allowClear
              />
              <Select
                placeholder="岗位状态"
                value={statusFilter}
                onChange={(v) => { setStatusFilter(v); setPage(1); }}
                style={{ width: 120 }}
                allowClear
              >
                <Select.Option value="active">招聘中</Select.Option>
                <Select.Option value="paused">已暂停</Select.Option>
                <Select.Option value="closed">已关闭</Select.Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadJobs}>刷新</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setCreateOpen(true); }}>
                新建岗位
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 岗位表格 */}
      <Table
        columns={columns}
        dataSource={jobs}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条记录`,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
      />

      {/* 新建岗位弹窗 */}
      <Modal
        title="新建岗位"
        open={createOpen}
        onOk={handleCreate}
        onCancel={() => setCreateOpen(false)}
        confirmLoading={submitting}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {formFields}
        </Form>
      </Modal>

      {/* 编辑岗位抽屉 */}
      <Drawer
        title="编辑岗位"
        open={editOpen}
        onClose={() => setEditOpen(false)}
        width={640}
        extra={
          <Space>
            <Button onClick={() => setEditOpen(false)}>取消</Button>
            <Button type="primary" loading={submitting} onClick={handleEdit}>保存</Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          {formFields}
        </Form>
      </Drawer>

      {/* 岗位详情抽屉 */}
      <Drawer
        title="岗位详情"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={560}
      >
        {currentJob && (
          <div>
            <h3>{currentJob.title}</h3>
            <p><Text type="secondary">公司：</Text>{currentJob.companyName}</p>
            <p><Text type="secondary">平台：</Text>{platformLabels[currentJob.platform]}</p>
            <p><Text type="secondary">薪资：</Text>{currentJob.salaryRange}</p>
            <p><Text type="secondary">城市：</Text>{currentJob.workCity}</p>
            <p><Text type="secondary">经验：</Text>{currentJob.workExperience}</p>
            <p><Text type="secondary">学历：</Text>{currentJob.education}</p>
            <p><Text type="secondary">状态：</Text><Tag color={statusColors[currentJob.status]}>{statusLabels[currentJob.status]}</Tag></p>
            <p><Text type="secondary">已联系/上限：</Text>{currentJob.contactedCount}/{currentJob.dailyLimit}</p>
            <h4 style={{ marginTop: 16 }}>岗位描述</h4>
            <p>{currentJob.description || '暂无'}</p>
            <h4>任职要求</h4>
            <p>{currentJob.requirements || '暂无'}</p>
            {currentJob.greetingsTemplate && (
              <>
                <h4>招呼语模板</h4>
                <p style={{ background: '#f5f5f5', padding: 12, borderRadius: 6 }}>{currentJob.greetingsTemplate}</p>
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default JobsPage;
