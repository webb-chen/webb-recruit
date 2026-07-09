"""FastAPI应用入口 - 应用初始化、生命周期管理、路由注册"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db, close_db
from app.api.router import api_router

# 配置日志
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理 - 启动和关闭时的操作"""
    logger.info(f"正在启动 {settings.APP_NAME} v{settings.APP_VERSION}...")

    # 启动时初始化数据库
    try:
        await init_db()
        logger.info("数据库初始化完成")
    except Exception as e:
        logger.error(f"数据库初始化失败: {e}")

    logger.info("应用启动完成")

    yield  # 应用运行中

    # 关闭时清理资源
    logger.info("正在关闭应用...")
    try:
        await close_db()
        logger.info("数据库连接已关闭")
    except Exception as e:
        logger.error(f"关闭数据库连接失败: {e}")

    logger.info("应用已关闭")


# 创建FastAPI应用实例
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Webb招聘助手自动化系统 - Webb智能招聘助手，自动打招呼、复聊、管理候选人",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# 配置跨域中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册API路由
app.include_router(api_router)


@app.get("/", tags=["健康检查"])
async def root():
    """根路径 - 返回应用基本信息"""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
    }


@app.get("/health", tags=["健康检查"])
async def health_check():
    """健康检查接口"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.get("/ready", tags=["健康检查"])
async def readiness_check():
    """就绪检查接口（用于Kubernetes等容器编排工具）"""
    return {"status": "ready"}
