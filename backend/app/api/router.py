"""API路由注册中心 - 汇总所有路由模块"""

from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.jobs import router as jobs_router
from app.api.candidates import router as candidates_router
from app.api.stats import router as stats_router
from app.api.templates import router as templates_router
from app.api.automation import router as automation_router

# 创建主路由，统一添加/api/v1前缀
api_router = APIRouter(prefix="/api/v1")

# 注册各模块路由
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(jobs_router)
api_router.include_router(candidates_router)
api_router.include_router(stats_router)
api_router.include_router(templates_router)
api_router.include_router(automation_router)
