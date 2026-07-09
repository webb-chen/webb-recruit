/**
 * Webb招聘助手 - 主布局组件
 * 包含侧边栏导航、顶部栏、内容区域的整体布局
 */
import React, { useState } from 'react';
import { Layout, Menu, theme, Avatar, Dropdown, Space } from 'antd';
import {
  DashboardOutlined,
  BankOutlined,
  TeamOutlined,
  BarChartOutlined,
  RobotOutlined,
  FileTextOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

/** 侧边栏菜单配置 */
const menuItems: MenuProps['items'] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '工作台' },
  { key: '/jobs', icon: <BankOutlined />, label: '岗位管理' },
  { key: '/candidates', icon: <TeamOutlined />, label: '人才库' },
  { key: '/stats', icon: <BarChartOutlined />, label: '数据统计' },
  { key: '/automation', icon: <RobotOutlined />, label: '自动化控制' },
  { key: '/templates', icon: <FileTextOutlined />, label: '模板管理' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
];

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  /** 用户下拉菜单 */
  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: '个人信息' },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  /** 处理菜单点击 */
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  /** 处理用户菜单点击 */
  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    } else if (key === 'profile') {
      navigate('/settings');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏导航 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <h1
            style={{
              color: '#fff',
              margin: 0,
              fontSize: collapsed ? 16 : 20,
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {collapsed ? 'AI' : 'Webb招聘助手'}
          </h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        {/* 顶部栏 */}
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 9,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}
        >
          <div
            style={{ cursor: 'pointer', fontSize: 18 }}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>

          <Dropdown
            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
            placement="bottomRight"
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
              <span>{user?.username || '用户'}</span>
            </Space>
          </Dropdown>
        </Header>

        {/* 内容区域 */}
        <Content
          style={{
            margin: 24,
            padding: 24,
            minHeight: 'calc(100vh - 64px - 48px)',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
