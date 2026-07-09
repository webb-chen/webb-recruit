"""职位管理API - 职位的增删改查和进度查看"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.job import JobCreate, JobUpdate, JobResponse
from app.schemas.common import ApiResponse, PaginatedResponse
from app.services.job_service import (
    create_job, get_jobs, get_job_by_id,
    update_job, delete_job, get_job_progress,
)
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/jobs", tags=["职位管理"])


@router.post("", response_model=ApiResponse[JobResponse])
async def create_new_job(
    job_data: JobCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建招聘职位"""
    job = await create_job(db, current_user.id, job_data)
    return ApiResponse(data=JobResponse.model_validate(job))


@router.get("", response_model=ApiResponse[PaginatedResponse[JobResponse]])
async def list_jobs(
    status: Optional[str] = Query(None, description="筛选状态"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取职位列表（分页）"""
    jobs, total = await get_jobs(db, current_user.id, status=status, page=page, page_size=page_size)
    total_pages = (total + page_size - 1) // page_size if page_size > 0 else 0
    return ApiResponse(data=PaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[JobResponse.model_validate(j) for j in jobs],
        total_pages=total_pages,
    ))


@router.get("/{job_id}", response_model=ApiResponse[JobResponse])
async def get_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取职位详情"""
    job = await get_job_by_id(db, job_id, current_user.id)
    return ApiResponse(data=JobResponse.model_validate(job))


@router.put("/{job_id}", response_model=ApiResponse[JobResponse])
async def update_job_info(
    job_id: int,
    job_data: JobUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新职位信息"""
    job = await update_job(db, job_id, current_user.id, job_data)
    return ApiResponse(data=JobResponse.model_validate(job))


@router.delete("/{job_id}", response_model=ApiResponse)
async def remove_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """删除职位"""
    await delete_job(db, job_id, current_user.id)
    return ApiResponse(message="删除成功")


@router.get("/{job_id}/progress", response_model=ApiResponse)
async def get_progress(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取职位招聘进度"""
    progress = await get_job_progress(db, job_id, current_user.id)
    return ApiResponse(data=progress)
