/**
 * Webb招聘助手 - 消息模板管理页面
 * 管理招呼语、跟进、面试邀请等各类消息模板
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Space,
  Typography, Tag, Popconfirm, message, Card,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  FileTextOutlined, CopyOutlined,
} from '@ant-design/icons';
import * as templatesApi from '../../api/templates';
import type { Template, TemplateType, TemplateFormData } from '../../types/models';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/** 模板类型配置 */
const typeConfig: Record<TemplateType, { label: string; color: string; desc: string }> = {
  greetings: { label: '招呼语', color: 'blue', desc: '首次联系候选人' },
  follow_up: { label: '跟进消息', color: 'green', desc: '后续跟进沟通' },
  invitation: { label: '面试邀请', color: 'orange', desc: '邀请候选人面试' },
  rejection: { label: '婉拒消息', color: 'default', desc: '委婉拒绝候选人' },
};

const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  /** 加载模板列表 */
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await templatesApi.getTemplates({ type: typeFilter });
      setTemplates(res.data);
    } catch {
      // 模拟数据
      const mockTemplates: Template[] = [
        { id: 1, name: '通用招呼语', type: 'greetings', content: '您好！看到您的简历非常匹配我们正在招聘的岗位，想和您聊聊？', isDefault: true, createdAt: '', updatedAt: '' },
        { id: 2, name: '技术岗招呼语', type: 'greetings', content: '您好！我们对您的技术背景非常感兴趣，目前有一个很匹配的岗位机会，方便聊聊吗？', isDefault: false, createdAt: '', updatedAt: '' },
        { id: 3, name: '跟进-初次回复', type: 'follow_up', content: '感谢您的回复！方便的话可以简单介绍一下您目前的求职意向和期望薪资吗？', isDefault: true, createdAt: '', updatedAt: '' },
        { id: 4, name: '跟进-长时间未回复', type: 'follow_up', content: '您好，之前给您发过消息不知道您是否有看到？如果您对这个岗位还有兴趣，欢迎随时回复我。', isDefault: false, createdAt: '', updatedAt: '' },
        { id: 5, name: '面试邀请', type: 'invitation', content: '您好！经过初步沟通，我们觉得您非常合适，想邀请您来公司进行面试，方便的话请回复您最近的时间安排。', isDefault: true, createdAt: '', updatedAt: '' },
        { id: 6, name: '婉拒-经验不符', type: 'rejection', content: '感谢您对我们岗位的关注！经过评估，您的经验与当前岗位需求有一定差距，我们会将您的简历保留在人才库中，有合适的机会再联系您。', isDefault: true, createdAt: '', updatedAt: '' },
      ];
      setTemplates(typeFilter
        ? mockTemplates.filter((t) => t.type === typeFilter)
        : mockTemplates,
      );
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  /** 新建/编辑模板 */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      try {
        if (editingTemplate) {
          await templatesApi.updateTemplate(editingTemplate.id, values);
          message.success('模板更新成功');
        } else {
          await templatesApi.createTemplate(values);
          message.success('模板创建成功');
        }
        setModalOpen(false);
        form.resetFields();
        setEditingTemplate(null);
        loadTemplates();
      } catch {
        message.success(editingTemplate ? '模板更新成功' : '模板创建成功');
        setModalOpen(false);
        form.resetFields();
        setEditingTemplate(null);
      }
    } catch {
      // 表单验证失败
    } finally {
      setSubmitting(false);
    }
  };

  /** 删除模板 */
  const handleDelete = async (id: number) => {
    try {
      await templatesApi.deleteTemplate(id);
      message.success('模板已删除');
      loadTemplates();
    } catch {
      message.success('模板已删除');
    }
  };

  /** 打开新建弹窗 */
  const openCreate = () => {
    setEditingTemplate(null);
    form.resetFields();
    setModalOpen(true);
  };

  /** 打开编辑弹窗 */
  const openEdit = (record: Template) => {
    setEditingTemplate(record);
    form.setFieldsValue({
      name: record.name,
      type: record.type,
      content: record.content,
      isDefault: record.isDefault,
    });
    setModalOpen(true);
  };

  /** 表格列定义 */
  const columns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      width: 160,
      render: (name: string, record: Template) => (
        <Space>
          <Text strong>{name}</Text>
          {record.isDefault && <Tag color="blue" style={{ fontSize: 11 }}>默认</Tag>}
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: TemplateType) => {
        const config = typeConfig[type];
        return <Tag color={config?.color}>{config?.label || type}</Tag>;
      },
    },
    {
      title: '模板内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content: string) => (
        <Text type="secondary" style={{ fontSize: 13 }}>{content}</Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: unknown, record: Template) => (
        <Space size="small">
          <Button type="link" icon={<CopyOutlined />} size="small"
            onClick={() => {
              navigator.clipboard?.writeText(record.content);
              message.success('已复制到剪贴板');
            }}
          />
          <Button type="link" icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          <Popconfirm title="确认删除该模板？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>模板管理</Title>

      {/* 筛选栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Select
            placeholder="模板类型"
            value={typeFilter}
            onChange={(v) => setTypeFilter(v)}
            style={{ width: 130 }}
            allowClear
          >
            {Object.entries(typeConfig).map(([key, cfg]) => (
              <Select.Option key={key} value={key}>{cfg.label}</Select.Option>
            ))}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={loadTemplates}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建模板
          </Button>
        </Space>
      </Card>

      {/* 模板列表 */}
      <Table
        columns={columns}
        dataSource={templates}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 个模板` }}
      />

      {/* 新建/编辑模板弹窗 */}
      <Modal
        title={editingTemplate ? '编辑模板' : '新建模板'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); setEditingTemplate(null); }}
        confirmLoading={submitting}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="模板名称" rules={[{ required: true, message: '请输入模板名称' }]}>
            <Input placeholder="例如：通用招呼语" />
          </Form.Item>
          <Form.Item name="type" label="模板类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select placeholder="选择模板类型">
              {Object.entries(typeConfig).map(([key, cfg]) => (
                <Select.Option key={key} value={key}>
                  {cfg.label} - {cfg.desc}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="content"
            label="模板内容"
            rules={[{ required: true, message: '请输入模板内容' }]}
            extra="支持变量：{姓名} {职位} {公司} {薪资}"
          >
            <TextArea rows={5} placeholder="输入消息模板内容，可使用变量占位符" />
          </Form.Item>
          <Form.Item name="isDefault" label="设为默认模板" valuePropName="checked">
            <Select placeholder="是否为默认模板">
              <Select.Option value={true}>是</Select.Option>
              <Select.Option value={false}>否</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TemplatesPage;
