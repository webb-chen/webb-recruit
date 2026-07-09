"""候选人管理API - 候选人的增删改查和批量操作"""

import os
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.candidate import CandidateCreate, CandidateUpdate, CandidateBatchUpdate, CandidateResponse
from app.schemas.common import ApiResponse, PaginatedResponse
from app.services.candidate_service import (
    create_candidate, get_candidates, get_candidate_by_id,
    update_candidate, batch_update_status, delete_candidate,
    export_candidates, download_resumes_zip, upload_resume,
)
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/candidates", tags=["候选人管理"])


@router.post("", response_model=ApiResponse[CandidateResponse])
async def create_new_candidate(
    candidate_data: CandidateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建候选人"""
    candidate = await create_candidate(db, current_user.id, candidate_data)
    return ApiResponse(data=CandidateResponse.model_validate(candidate))


@router.post("/batch", response_model=ApiResponse)
async def batch_create_candidates(
    candidates_data: List[CandidateCreate],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """批量创建候选人"""
    from app.services.candidate_service import batch_create_candidates
    count = await batch_create_candidates(db, current_user.id, candidates_data)
    return ApiResponse(data={"count": count})


@router.get("", response_model=ApiResponse[PaginatedResponse[CandidateResponse]])
async def list_candidates(
    job_id: Optional[int] = Query(None, description="职位ID筛选"),
    status: Optional[int] = Query(None, description="状态筛选"),
    keyword: Optional[str] = Query(None, description="关键词搜索"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取候选人列表（分页+筛选）"""
    candidates, total = await get_candidates(
        db, current_user.id, job_id=job_id, status=status,
        keyword=keyword, page=page, page_size=page_size
    )
    total_pages = (total + page_size - 1) // page_size if page_size > 0 else 0
    return ApiResponse(data=PaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[CandidateResponse.model_validate(c) for c in candidates],
        total_pages=total_pages,
    ))


@router.get("/{candidate_id}", response_model=ApiResponse[CandidateResponse])
async def get_candidate(
    candidate_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取候选人详情"""
    candidate = await get_candidate_by_id(db, candidate_id, current_user.id)
    return ApiResponse(data=CandidateResponse.model_validate(candidate))


@router.put("/{candidate_id}", response_model=ApiResponse[CandidateResponse])
async def update_candidate_info(
    candidate_id: int,
    candidate_data: CandidateUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新候选人信息"""
    candidate = await update_candidate(db, candidate_id, current_user.id, candidate_data)
    return ApiResponse(data=CandidateResponse.model_validate(candidate))


@router.delete("/{candidate_id}", response_model=ApiResponse)
async def remove_candidate(
    candidate_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """删除候选人"""
    await delete_candidate(db, candidate_id, current_user.id)
    return ApiResponse(message="删除成功")


@router.put("/batch/status", response_model=ApiResponse)
async def batch_update_candidate_status(
    batch_data: CandidateBatchUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """批量更新候选人状态"""
    count = await batch_update_status(db, current_user.id, batch_data.ids, batch_data.status)
    return ApiResponse(data={"count": count})


@router.get("/export/excel", response_model=ApiResponse)
async def export_to_excel(
    job_id: Optional[int] = Query(None, description="职位ID筛选"),
    status: Optional[int] = Query(None, description="状态筛选"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """导出候选人数据为Excel"""
    file_url = await export_candidates(db, current_user.id, job_id=job_id, status=status)
    return ApiResponse(data={"download_url": file_url})


@router.post("/download-resumes", response_model=ApiResponse)
async def download_resumes(
    candidate_ids: List[int],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """批量下载候选人简历（ZIP包）"""
    file_url = await download_resumes_zip(db, current_user.id, candidate_ids)
    return ApiResponse(data={"download_url": file_url})


@router.post("/{candidate_id}/resume", response_model=ApiResponse[CandidateResponse])
async def upload_candidate_resume(
    candidate_id: int,
    file: UploadFile = File(..., description="简历文件"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """上传候选人简历"""
    file_data = await file.read()
    if not file_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="上传文件为空"
        )
    candidate = await upload_resume(
        db, current_user.id, candidate_id, file_data, file.filename
    )
    return ApiResponse(data=CandidateResponse.model_validate(candidate))
