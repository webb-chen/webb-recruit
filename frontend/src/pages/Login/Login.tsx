/**
 * Webb招聘助手 - 登录页面
 * 居中卡片式登录表单
 */
import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, RobotOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  /** 处理登录表单提交 */
  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('登录成功');
      navigate('/dashboard');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 420,
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
        bodyStyle={{ padding: '40px 32px' }}
      >
        {/* 标题区域 */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <RobotOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 12 }} />
          <Title level={3} style={{ margin: 0 }}>
            Webb招聘助手 - 智能招聘助手
          </Title>
          <Text type="secondary">请登录您的账号</Text>
        </div>

        {/* 登录表单 */}
        <Form
          name="login"
          onFinish={handleLogin}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 44, fontSize: 16 }}
            >
              登 录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Webb招聘助手 v1.0 - 让招聘更智能
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
