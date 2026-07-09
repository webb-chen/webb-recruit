"""候选人服务层 - 处理候选人相关的业务逻辑"""

import os
import io
import zipfile
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from fastapi import HTTPException, status
from app.models.candidate import Candidate
from app.models.job import Job
from app.schemas.candidate import CandidateCreate, CandidateUpdate
from app.services.minio_service import MinioService


async def create_candidate(
    db: AsyncSession,
    user_id: int,
    candidate_data: CandidateCreate,
) -> Candidate:
    """创建候选人记录

    Args:
        db: 数据库会话
        user_id: 用户ID
        candidate_data: 候选人数据

    Returns:
        创建成功的候选人对象
    """
    # 检查是否已存在（同一职位下同一平台加密ID）
    if candidate_data.boss_encrypt_user_id and candidate_data.job_id:
        existing = await db.execute(
            select(Candidate).where(
                and_(
                    Candidate.job_id == candidate_data.job_id,
                    Candidate.boss_encrypt_user_id == candidate_data.boss_encrypt_user_id
                )
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该候选人已存在于此职位下"
            )

    candidate = Candidate(user_id=user_id, **candidate_data.model_dump())
    db.add(candidate)
    await db.flush()
    await db.refresh(candidate)
    return candidate


async def batch_create_candidates(
    db: AsyncSession,
    user_id: int,
    candidates_data: List[CandidateCreate],
) -> int:
    """批量创建候选人记录

    Args:
        db: 数据库会话
        user_id: 用户ID
        candidates_data: 候选人数据列表

    Returns:
        成功创建的候选人数量
    """
    count = 0
    for data in candidates_data:
        try:
            await create_candidate(db, user_id, data)
            count += 1
        except HTTPException:
            continue
    return count


async def get_candidates(
    db: AsyncSession,
    user_id: int,
    job_id: Optional[int] = None,
    status: Optional[int] = None,
    keyword: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[List[Candidate], int]:
    """获取候选人列表（分页+筛选）

    Args:
        db: 数据库会话
        user_id: 用户ID
        job_id: 职位ID筛选
        status: 状态筛选
        keyword: 关键词搜索（姓名/公司）
        page: 页码
        page_size: 每页数量

    Returns:
        候选人列表和总数的元组
    """
    query = select(Candidate).where(Candidate.user_id == user_id)
    count_query = select(func.count(Candidate.id)).where(Candidate.user_id == user_id)

    if job_id:
        query = query.where(Candidate.job_id == job_id)
        count_query = count_query.where(Candidate.job_id == job_id)

    if status is not None:
        query = query.where(Candidate.status == status)
        count_query = count_query.where(Candidate.status == status)

    if keyword:
        search_pattern = f"%{keyword}%"
        query = query.where(
            Candidate.name.ilike(search_pattern) |
            Candidate.work_company.ilike(search_pattern)
        )
        count_query = count_query.where(
            Candidate.name.ilike(search_pattern) |
            Candidate.work_company.ilike(search_pattern)
        )

    query = query.order_by(Candidate.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    candidates = result.scalars().all()

    count_result = await db.execute(count_query)
    total = count_result.scalar()

    return list(candidates), total


async def get_candidate_by_id(
    db: AsyncSession,
    candidate_id: int,
    user_id: int,
) -> Candidate:
    """根据ID获取候选人

    Args:
        db: 数据库会话
        candidate_id: 候选人ID
        user_id: 用户ID

    Returns:
        候选人对象

    Raises:
        HTTPException: 候选人不存在时抛出404异常
    """
    result = await db.execute(
        select(Candidate).where(
            Candidate.id == candidate_id,
            Candidate.user_id == user_id
        )
    )
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="候选人不存在"
        )
    return candidate


async def update_candidate(
    db: AsyncSession,
    candidate_id: int,
    user_id: int,
    candidate_data: CandidateUpdate,
) -> Candidate:
    """更新候选人信息

    Args:
        db: 数据库会话
        candidate_id: 候选人ID
        user_id: 用户ID
        candidate_data: 更新数据

    Returns:
        更新后的候选人对象
    """
    candidate = await get_candidate_by_id(db, candidate_id, user_id)
    update_data = candidate_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(candidate, key, value)
    await db.flush()
    await db.refresh(candidate)
    return candidate


async def batch_update_status(
    db: AsyncSession,
    user_id: int,
    candidate_ids: List[int],
    status: int,
) -> int:
    """批量更新候选人状态

    Args:
        db: 数据库会话
        user_id: 用户ID
        candidate_ids: 候选人ID列表
        status: 目标状态

    Returns:
        成功更新的数量
    """
    count = 0
    for cid in candidate_ids:
        try:
            candidate = await get_candidate_by_id(db, cid, user_id)
            candidate.status = status
            count += 1
        except HTTPException:
            continue
    await db.flush()
    return count


async def delete_candidate(
    db: AsyncSession,
    candidate_id: int,
    user_id: int,
) -> None:
    """删除候选人

    Args:
        db: 数据库会话
        candidate_id: 候选人ID
        user_id: 用户ID
    """
    candidate = await get_candidate_by_id(db, candidate_id, user_id)
    await db.delete(candidate)
    await db.flush()


async def export_candidates(
    db: AsyncSession,
    user_id: int,
    job_id: Optional[int] = None,
    status: Optional[int] = None,
) -> str:
    """导出候选人数据为Excel文件并上传到MinIO

    Args:
        db: 数据库会话
        user_id: 用户ID
        job_id: 职位ID筛选
        status: 状态筛选

    Returns:
        Excel文件的MinIO下载链接
    """
    import pandas as pd
    from datetime import datetime

    candidates, _ = await get_candidates(
        db, user_id, job_id=job_id, status=status, page=1, page_size=10000
    )

    if not candidates:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="没有可导出的候选人数据"
        )

    # 转换为DataFrame
    data = []
    for c in candidates:
        data.append({
            "姓名": c.name or "",
            "性别": c.gender or "",
            "年龄": c.age or "",
            "学历": c.educational or "",
            "期望城市": c.expected_city or "",
            "期望职位": c.expected_job_name or "",
            "期望薪资": f"{c.expected_salary_min or ''}-{c.expected_salary_max or ''}",
            "手机号": c.phone or "",
            "微信号": c.weixin or "",
            "当前公司": c.work_company or "",
            "状态": c.status,
            "创建时间": c.created_at.strftime("%Y-%m-%d %H:%M:%S") if c.created_at else "",
        })

    df = pd.DataFrame(data)

    # 写入Excel到内存
    output = io.BytesIO()
    df.to_excel(output, index=False, engine="openpyxl")
    output.seek(0)

    # 上传到MinIO
    minio_svc = MinioService()
    filename = f"exports/candidates_{user_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.xlsx"
    file_url = minio_svc.upload_bytes(output.getvalue(), filename, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

    return file_url


async def download_resumes_zip(
    db: AsyncSession,
    user_id: int,
    candidate_ids: List[int],
) -> str:
    """批量下载候选人简历并打包为ZIP

    Args:
        db: 数据库会话
        user_id: 用户ID
        candidate_ids: 候选人ID列表

    Returns:
        ZIP文件的MinIO下载链接
    """
    minio_svc = MinioService()
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
        has_files = False
        for cid in candidate_ids:
            try:
                candidate = await get_candidate_by_id(db, cid, user_id)
                if candidate.resume_link:
                    # 尝试从MinIO下载简历
                    try:
                        file_data = minio_svc.download_file(candidate.resume_link)
                        if file_data:
                            safe_name = (candidate.name or f"candidate_{cid}").replace("/", "_")
                            zipf.writestr(f"{safe_name}_resume.pdf", file_data)
                            has_files = True
                    except Exception:
                        continue
            except HTTPException:
                continue

        if not has_files:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="没有可下载的简历文件"
            )

    zip_buffer.seek(0)
    from datetime import datetime
    filename = f"exports/resumes_{user_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.zip"
    file_url = minio_svc.upload_bytes(
        zip_buffer.getvalue(), filename,
        "application/zip"
    )
    return file_url


async def upload_resume(
    db: AsyncSession,
    user_id: int,
    candidate_id: int,
    file_data: bytes,
    filename: str,
) -> Candidate:
    """上传候选人简历到MinIO

    Args:
        db: 数据库会话
        user_id: 用户ID
        candidate_id: 候选人ID
        file_data: 文件二进制数据
        filename: 文件名

    Returns:
        更新后的候选人对象
    """
    candidate = await get_candidate_by_id(db, candidate_id, user_id)

    minio_svc = MinioService()
    ext = os.path.splitext(filename)[1] or ".pdf"
    object_name = f"resumes/{user_id}/{candidate_id}_{filename}"
    file_url = minio_svc.upload_bytes(file_data, object_name, "application/pdf")

    candidate.resume_link = file_url
    await db.flush()
    await db.refresh(candidate)
    return candidate
