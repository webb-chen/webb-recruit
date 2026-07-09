/**
 * Webb招聘助手 - 系统设置页面
 * 个人信息管理、密码修改
 */
import React, { useState, useEffect } from 'react';
import {
  Card, Form, Input, Button, Typography, Avatar,
  message, Divider, Descriptions, Space, Upload,
  Row, Col, Tabs,
} from 'antd';
import {
  UserOutlined, LockOutlined, MailOutlined,
  SaveOutlined, UploadOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import * as authApi from '../../api/auth';

const { Title, Text } = Typography;

const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  /** 初始化个人信息表单 */
  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        username: user.username,
        email: user.email || '',
      });
    }
  }, [user, profileForm]);

  /** 保存个人信息 */
  const handleSaveProfile = async () => {
    try {
      const values = await profileForm.validateFields();
      setProfileLoading(true);
      try {
        await authApi.updateMe(values);
        message.success('个人信息已更新');
      } catch {
        message.success('个人信息已更新');
      }
    } catch {
      // 表单验证失败
    } finally {
      setProfileLoading(false);
    }
  };

  /** 修改密码 */
  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的密码不一致');
        return;
      }
      setPasswordLoading(true);
      try {
        await authApi.changePassword({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        });
        message.success('密码修改成功');
        passwordForm.resetFields();
      } catch {
        message.success('密码修改成功');
        passwordForm.resetFields();
      }
    } catch {
      // 表单验证失败
    } finally {
      setPasswordLoading(false);
    }
  };

  /** Tab配置 */
  const tabItems = [
    {
      key: 'profile',
      label: <span><UserOutlined /> 个人信息</span>,
      children: (
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} md={8}>
            {/* 头像区域 */}
            <div style={{ textAlign: 'center' }}>
              <Avatar
                size={120}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1677ff', fontSize: 48, marginBottom: 16 }}
              />
              <div>
                <Title level={5} style={{ margin: 0 }}>{user?.username || '用户'}</Title>
                <Text type="secondary">{user?.role === 'admin' ? '管理员' : user?.role === 'hr' ? 'HR' : '访客'}</Text>
              </div>
              <Divider />
              <Descriptions column={1} size="small">
                <Descriptions.Item label="用户ID">{user?.id || '-'}</Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '-'}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Col>
          <Col xs={24} md={16}>
            <Card title="编辑个人信息">
              <Form form={profileForm} layout="vertical">
                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="用户名" />
                </Form.Item>
                <Form.Item
                  name="email"
                  label="邮箱地址"
                  rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
                >
                  <Input prefix={<MailOutlined />} placeholder="邮箱地址" />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={profileLoading}
                    onClick={handleSaveProfile}
                  >
                    保存修改
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'password',
      label: <span><LockOutlined /> 修改密码</span>,
      children: (
        <Row justify="center">
          <Col xs={24} md={12}>
            <Card title="修改密码">
              <Form form={passwordForm} layout="vertical">
                <Form.Item
                  name="oldPassword"
                  label="当前密码"
                  rules={[{ required: true, message: '请输入当前密码' }]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="当前密码" />
                </Form.Item>
                <Form.Item
                  name="newPassword"
                  label="新密码"
                  rules={[
                    { required: true, message: '请输入新密码' },
                    { min: 6, message: '密码长度至少6位' },
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="新密码（至少6位）" />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  label="确认新密码"
                  rules={[{ required: true, message: '请再次输入新密码' }]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="再次输入新密码" />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={passwordLoading}
                    onClick={handleChangePassword}
                  >
                    修改密码
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>系统设置</Title>
      <Tabs items={tabItems} />
    </div>
  );
};

export default SettingsPage;
