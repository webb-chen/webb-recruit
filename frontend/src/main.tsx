/**
 * Webb招聘助手 - 应用入口文件
 * 渲染React应用到DOM
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 创建React根节点并渲染应用
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
