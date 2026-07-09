<p align="center">
  <img src="https://github.com/webb-chen/webb-recruit/raw/main/assets/webb-recruit-banner.jpg" alt="Webb招聘助手 Banner" width="100%">
</p>

<h1 align="center">
  <span style="color: #5b8def">Webb</span>招聘助手
</h1>

<p align="center">
  <strong>智能招聘管理平台</strong> — 自动化招聘流程，提升招聘效率
</p>

<p align="center">
  <a href="https://github.com/webb-chen/webb-recruit/stargazers">
    <img src="https://img.shields.io/github/stars/webb-chen/webb-recruit?style=for-the-badge&color=5b8def&label=Stars" alt="Stars">
  </a>
  <a href="https://github.com/webb-chen/webb-recruit/forks">
    <img src="https://img.shields.io/github/forks/webb-chen/webb-recruit?style=for-the-badge&color=38d9a9&label=Forks" alt="Forks">
  </a>
  <a href="https://github.com/webb-chen/webb-recruit/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/webb-chen/webb-recruit?style=for-the-badge&color=f6a623" alt="License">
  </a>
  <br>
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis">
  <img src="https://img.shields.io/badge/Docker-28-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/Playwright-1.47-2EAD33?style=flat-square&logo=playwright&logoColor=white" alt="Playwright">
</p>

<p align="center">
  <a href="#-功能特性">功能特性</a> ·
  <a href="#-技术架构">技术架构</a> ·
  <a href="#-快速开始">快速开始</a> ·
  <a href="#-项目结构">项目结构</a> ·
  <a href="#-api文档">API文档</a> ·
  <a href="#-部署指南">部署指南</a> ·
  <a href="#-许可证">许可证</a>
</p>

---

## ✨ 功能特性

<table>
<tr>
<td width="50%">
  <h3>🤖 自动打招呼</h3>
  <p>基于 Playwright 浏览器自动化，模拟真实用户操作招聘平台。支持自定义话术模板、工作时段设置、智能间隔控制，实现无人值守式招聘。</p>
</td>
<td width="50%">
  <h3>👥 人才库管理</h3>
  <p>集中管理所有候选人信息，支持按岗位、状态、来源平台多维度筛选。候选人数据自动同步，简历文件一键下载，聊天记录完整追溯。</p>
</td>
</tr>
<tr>
<td width="50%">
  <h3>📊 数据统计</h3>
  <p>实时统计打招呼数量、回复率、候选人转化漏斗。支持按日/周/月趋势分析，可视化展示关键招聘指标，数据驱动决策。</p>
</td>
<td width="50%">
  <h3>📄 简历批量下载</h3>
  <p>MinIO 对象存储管理简历文件，支持按候选人、按岗位批量下载。自动分类整理，支持 Excel 导出候选人列表。</p>
</td>
</tr>
<tr>
<td>
  <h3>🌐 多平台支持</h3>
  <p>统一管理 BOSS直聘、智联招聘、鱼泡网等多个平台。平台账号独立管理，一键切换，数据统一汇总。</p>
</td>
<td>
  <h3>📝 模板管理</h3>
  <p>自定义打招呼话术和回复模板，支持按岗位关联、变量替换。内置多种场景模板，提高沟通效率。</p>
</td>
</tr>
</table>

---

## 🏗 技术架构

### 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                        用户浏览器                         │
│                   http://192.168.31.248:3000                │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                  Nginx (前端静态 + 反向代理)                │
│                     React 18 + Ant Design                 │
│              TypeScript + Vite 6 + ECharts                 │
│                  Zustand 状态管理                            │
└──────────────────────────┬──────────────────────────────┘
                           │ /api/v1/*
┌──────────────────────────▼──────────────────────────────┐
│                    FastAPI 后端服务                        │
│               Uvicorn ASGI :8000                           │
│     JWT认证 · 异步ORM · 依赖注入 · Swagger文档              │
├─────────────┬──────────────┬───────────────┬─────────────┤
│ PostgreSQL   │    Redis     │    MinIO      │   Celery     │
│  :5432       │    :6379     │  :9000/9001   │   Worker     │
│  核心数据     │  缓存·队列   │  文件存储      │  异步任务    │
└─────────────┴──────────────┴───────────────┴──────┬──────┘
                                                   │
                                     ┌─────────────▼─────────────┐
                                     │    Playwright 浏览器自动化    │
                                     │   BOSS直聘 · 智联 · 鱼泡网   │
                                     └───────────────────────────┘
```

### 技术栈

| 层级 | 技术 | 版本 | 说明 |
|:---:|:---:|:---:|:---|
| **前端** | React | 18.3 | 用户界面框架 |
| | TypeScript | 5.6 | 类型安全开发 |
| | Vite | 6.0 | 构建工具 |
| | Ant Design | 5.22 | 企业级 UI 组件库 |
| | ECharts | 5.5 | 数据可视化图表 |
| | Zustand | 5.0 | 轻量状态管理 |
| **后端** | FastAPI | 0.115 | 异步 Web 框架 |
| | SQLAlchemy | 2.0 | 异步 ORM |
| | Celery | 5.4 | 分布式任务队列 |
| | Playwright | 1.47 | 浏览器自动化 |
| | python-jose | 3.3 | JWT 认证 |
| **数据层** | PostgreSQL | 16 | 关系型数据库 |
| | Redis | 7 | 缓存 + 消息队列 |
| | MinIO | latest | S3 对象存储 |
| **部署** | Docker | 28 | 容器运行时 |
| | Docker Compose | v2 | 多容器编排 |
| | Nginx | alpine | 静态资源 + 反向代理 |

---

## 🚀 快速开始

### 环境要求

- Docker 24+ 和 Docker Compose v2
- 至少 4GB 内存
- CentOS 9 / Ubuntu 22.04 / Debian 12

### 一键部署

```bash
# 克隆项目
git clone https://github.com/webb-chen/webb-recruit.git
cd webb-recruit

# 配置环境变量
cp .env.example .env
# 编辑 .env 修改数据库密码、JWT密钥等配置

# 启动所有服务
docker compose up -d

# 查看服务状态
docker compose ps
```

### 访问系统

| 服务 | 地址 | 默认账号 |
|:---:|:---|:---|
| 前端界面 | http://localhost:3000 | admin / admin123 |
| API 文档 | http://localhost:8000/docs | - |
| MinIO 控制台 | http://localhost:9001 | minioadmin / minioadmin123 |
| 健康检查 | http://localhost:8000/health | - |

### 健康检查

```bash
curl http://localhost:8000/health
# {"status":"healthy","app":"Webb招聘助手自动化系统","version":"1.0.0"}
```

---

## 📁 项目结构

```
webb-recruit/
├── backend/                          # 后端应用
│   ├── app/
│   │   ├── api/                      # API 路由层 (8 模块)
│   │   │   ├── auth.py               # 认证 (注册/登录)
│   │   │   ├── users.py              # 用户管理
│   │   │   ├── jobs.py               # 岗位管理
│   │   │   ├── candidates.py         # 候选人管理
│   │   │   ├── stats.py              # 数据统计
│   │   │   ├── templates.py          # 模板管理
│   │   │   ├── automation.py         # 自动化任务
│   │   │   └── router.py            # 路由聚合
│   │   ├── models/                   # 数据模型 (8 张表)
│   │   ├── schemas/                  # Pydantic 数据验证
│   │   ├── services/                 # 业务逻辑层
│   │   │   ├── playwright_service.py # 浏览器自动化核心
│   │   │   ├── minio_service.py      # 文件存储服务
│   │   │   └── ..._service.py
│   │   ├── tasks/                    # Celery 异步任务
│   │   │   ├── celery_app.py        # 任务队列配置
│   │   │   └── say_hello.py         # 自动打招呼任务
│   │   ├── core/security.py          # JWT + bcrypt 安全
│   │   ├── config.py                 # 配置管理
│   │   ├── database.py               # 数据库连接
│   │   ├── dependencies.py          # 依赖注入
│   │   └── main.py                   # 应用入口
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                         # 前端应用
│   ├── src/
│   │   ├── api/                      # API 调用层 (7 模块)
│   │   ├── pages/                    # 页面组件 (8 个页面)
│   │   │   ├── Dashboard/            # 仪表盘
│   │   │   ├── Jobs/                 # 岗位管理
│   │   │   ├── Candidates/           # 候选人管理
│   │   │   ├── Stats/                # 数据统计
│   │   │   ├── Automation/           # 自动化任务
│   │   │   ├── Templates/            # 模板管理
│   │   │   ├── Settings/             # 系统设置
│   │   │   └── Login/                # 登录页
│   │   ├── components/               # 通用组件
│   │   │   ├── Layout/               # 主布局
│   │   │   ├── StatCard/             # 统计卡片
│   │   │   └── TrendChart/           # 趋势图表
│   │   ├── stores/                   # 状态管理
│   │   └── types/                    # TypeScript 类型
│   ├── Dockerfile
│   └── package.json
├── scripts/                          # 部署脚本
├── docker-compose.yml                 # 容器编排 (6 服务)
├── .env.example                      # 环境变量模板
├── .gitignore
├── assets/                            # 项目资源
└── README.md
```

---

## 📡 API 文档

系统提供完整的 RESTful API，所有接口统一使用 `/api/v1` 前缀。

| 模块 | 端点 | 方法 | 说明 |
|:---:|:---|:---:|:---|
| 认证 | `/api/v1/auth/register` | POST | 用户注册 |
| 认证 | `/api/v1/auth/login` | POST | 用户登录，返回 JWT |
| 用户 | `/api/v1/users/me` | GET | 当前用户信息 |
| 岗位 | `/api/v1/jobs/` | GET/POST | 岗位列表 / 创建岗位 |
| 候选人 | `/api/v1/candidates/` | GET | 候选人列表 (分页) |
| 候选人 | `/api/v1/candidates/{id}/resume` | GET | 下载简历 |
| 统计 | `/api/v1/stats/overview` | GET | 总览数据 |
| 统计 | `/api/v1/stats/trend` | GET | 趋势分析 |
| 自动化 | `/api/v1/automation/start` | POST | 启动自动打招呼 |
| 自动化 | `/api/v1/automation/stop` | POST | 停止自动化任务 |
| 模板 | `/api/v1/templates/` | GET/POST | 模板列表 / 创建模板 |

启动后端服务后，访问 `http://localhost:8000/docs` 查看完整的 Swagger 交互式文档。

---

## 🔧 部署指南

### 代理配置 (国内网络加速)

如果服务器在国内网络环境，Docker Hub 拉取镜像可能很慢。可配置局域网代理加速：

```bash
# 1. Docker Daemon 代理
cat > /etc/docker/daemon.json << 'EOF'
{
  "proxies": {
    "httpProxy": "http://YOUR_PROXY:7897",
    "httpsProxy": "http://YOUR_PROXY:7897",
    "noProxy": "localhost,127.0.0.1"
  }
}
EOF
systemctl restart docker

# 2. pip 代理
mkdir -p ~/.pip
cat > ~/.pip/pip.conf << 'EOF'
[global]
proxy = http://YOUR_PROXY:7897
EOF
```

### Docker Compose 服务

| 服务 | 镜像 | 端口 | 说明 |
|:---:|:---:|:---:|:---|
| postgres | postgres:16-alpine | 5432 | 关系型数据库 |
| redis | redis:7-alpine | 6379 | 缓存 + 消息队列 |
| minio | minio/minio | 9000/9001 | 对象存储 |
| backend | 自构建 | 8000 | FastAPI 后端 |
| celery-worker | 同 backend | - | 异步任务执行 |
| frontend | 自构建 | 3000 | React 前端 + Nginx |

### 常用命令

```bash
# 启动所有服务
docker compose up -d

# 重新构建并启动
docker compose up -d --build backend frontend

# 查看日志
docker compose logs -f backend

# 停止所有服务
docker compose down

# 停止并清除数据
docker compose down -v
```

---

## 🗄 数据库设计

8 张核心业务表：

```
users              ── 用户表 (认证、权限)
  │
  ├── jobs         ── 岗位表 (职位信息、平台、状态)
  │     │
  │     ├── candidates    ── 候选人表 (简历、状态、来源)
  │     │     │
  │     │     └── messages      ── 聊天消息表
  │     │
  │     ├── daily_progress ── 每日进度表 (统计)
  │     │
  │     └── templates       ── 话术模板表
  │
  ├── bot_action_logs  ── 操作日志表 (审计)
  │
  └── platform_accounts ── 平台账号表 (多平台管理)
```

---

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: 添加某个功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源许可证。

---

<p align="center">
  <sub>Built with ❤️ by <a href="https://github.com/webb-chen">webb-chen</a></sub>
  <br>
  <sub>© 2026 Webb招聘助手 · 智能招聘管理平台</sub>
</p>
