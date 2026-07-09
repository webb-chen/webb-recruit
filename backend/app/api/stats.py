"""统计看板API - 数据统计和趋势图表"""

from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.common import ApiResponse
from app.services.stats_service import get_dashboard_stats, get_daily_stats, get_trend_data
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/stats", tags=["数据统计"])


@router.get("/dashboard", response_model=ApiResponse)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取看板汇总数据"""
    stats = await get_dashboard_stats(db, current_user.id)
    return ApiResponse(data=stats)


@router.get("/daily", response_model=ApiResponse)
async def get_daily(
    start_date: Optional[date] = Query(None, description="开始日期"),
    end_date: Optional[date] = Query(None, description="结束日期"),
    job_id: Optional[int] = Query(None, description="职位ID筛选"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取每日统计数据列表"""
    stats = await get_daily_stats(db, current_user.id, start_date=start_date, end_date=end_date, job_id=job_id)
    return ApiResponse(data=stats)


@router.get("/trend", response_model=ApiResponse)
async def get_trend(
    days: int = Query(30, ge=1, le=365, description="统计天数"),
    metric: str = Query("say_hello_times", description="统计指标"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取趋势数据（用于图表展示）"""
    trend = await get_trend_data(db, current_user.id, days=days, metric=metric)
    return ApiResponse(data=trend)
