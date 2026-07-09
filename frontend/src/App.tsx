/**
 * Webb招聘助手 - 应用根组件
 * 路由配置、路由守卫、主题配置
 */
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from './components/Layout/Layout';
import LoginPage from './pages/Login/Login';
import DashboardPage from './pages/Dashboard/Dashboard';
import JobsPage from './pages/Jobs/Jobs';
import CandidatesPage from './pages/Candidates/Candidates';
import StatsPage from './pages/Stats/Stats';
import AutomationPage from './pages/Automation/Automation';
import TemplatesPage from './pages/Templates/Templates';
import SettingsPage from './pages/Settings/Settings';
import { useAuthStore } from './stores/authStore';

/**
 * 路由守卫组件
 * 未登录用户重定向到登录页
 */
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loadAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
    }
  }, [isAuthenticated, navigate, location]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

/**
 * 已登录用户访问登录页时重定向到工作台
 */
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

/** 应用根组件 */
const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
          fontSize: 14,
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          {/* 公开路由 */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* 受保护路由 - 需要登录 */}
          <Route
            element={
              <RequireAuth>
                <MainLayout />
              </RequireAuth>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/candidates" element={<CandidatesPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/automation" element={<AutomationPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* 默认路由 */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
