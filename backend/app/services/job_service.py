"""职位服务层 - 处理职位相关的业务逻辑"""

from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status
from app.models.job import Job
from app.models.candidate import Candidate
from app.models.daily_progress import DailyProgress
from app.schemas.job import JobCreate, JobUpdate
from datetime import date


async def create_job(db: AsyncSession, user_id: int, job_data: JobCreate) -> Job:
    """创建招聘职位

    Args:
        db: 数据库会话
        user_id: 用户ID
        job_data: 职位创建数据

    Returns:
        创建成功的职位对象
    """
    job = Job(user_id=user_id, **job_data.model_dump())
    db.add(job)
    await db.flush()
    await db.refresh(job)
    return job


async def get_jobs(
    db: AsyncSession,
    user_id: int,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[Job], int]:
    """获取用户职位列表（分页）

    Args:
        db: 数据库会话
        user_id: 用户ID
        status: 筛选状态（可选）
        page: 页码
        page_size: 每页数量

    Returns:
        职位列表和总数的元组
    """
    query = select(Job).where(Job.user_id == user_id)
    count_query = select(func.count(Job.id)).where(Job.user_id == user_id)

    if status:
        query = query.where(Job.status == status)
        count_query = count_query.where(Job.status == status)

    query = query.order_by(Job.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    jobs = result.scalars().all()

    count_result = await db.execute(count_query)
    total = count_result.scalar()

    return list(jobs), total


async def get_job_by_id(db: AsyncSession, job_id: int, user_id: int) -> Job:
    """根据ID获取职位（需验证归属用户）

    Args:
        db: 数据库会话
        job_id: 职位ID
        user_id: 用户ID

    Returns:
        职位对象

    Raises:
        HTTPException: 职位不存在时抛出404异常
    """
    result = await db.execute(
        select(Job).where(Job.id == job_id, Job.user_id == user_id)
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="职位不存在"
        )
    return job


async def update_job(
    db: AsyncSession,
    job_id: int,
    user_id: int,
    job_data: JobUpdate,
) -> Job:
    """更新职位信息

    Args:
        db: 数据库会话
        job_id: 职位ID
        user_id: 用户ID
        job_data: 更新数据

    Returns:
        更新后的职位对象
    """
    job = await get_job_by_id(db, job_id, user_id)
    update_data = job_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(job, key, value)
    await db.flush()
    await db.refresh(job)
    return job


async def delete_job(db: AsyncSession, job_id: int, user_id: int) -> None:
    """删除职位

    Args:
        db: 数据库会话
        job_id: 职位ID
        user_id: 用户ID
    """
    job = await get_job_by_id(db, job_id, user_id)
    await db.delete(job)
    await db.flush()


async def get_job_progress(db: AsyncSession, job_id: int, user_id: int) -> Dict[str, Any]:
    """获取职位招聘进度汇总

    Args:
        db: 数据库会话
        job_id: 职位ID
        user_id: 用户ID

    Returns:
        包含各项统计数据和今日进度的字典
    """
    # 验证职位归属
    await get_job_by_id(db, job_id, user_id)

    # 候选人总数
    total_candidates_result = await db.execute(
        select(func.count(Candidate.id)).where(Candidate.job_id == job_id)
    )
    total_candidates = total_candidates_result.scalar() or 0

    # 各状态候选人数
    status_counts = {}
    for status_val in range(6):
        result = await db.execute(
            select(func.count(Candidate.id)).where(
                Candidate.job_id == job_id,
                Candidate.status == status_val
            )
        )
        status_counts[f"status_{status_val}"] = result.scalar() or 0

    # 今日进度
    today = date.today()
    today_progress_result = await db.execute(
        select(DailyProgress).where(
            DailyProgress.job_id == job_id,
            DailyProgress.d_date == today
        )
    )
    today_progress = today_progress_result.scalar_one_or_none()

    today_data = {}
    if today_progress:
        today_data = {
            "say_hello_times": today_progress.say_hello_times,
            "look_times": today_progress.look_times,
            "repeat_call_times": today_progress.repeat_call_times,
            "candidate_count": today_progress.candidate_count,
            "resume_count": today_progress.resume_count,
            "phone_wechat_count": today_progress.phone_wechat_count,
        }
    else:
        today_data = {
            "say_hello_times": 0,
            "look_times": 0,
            "repeat_call_times": 0,
            "candidate_count": 0,
            "resume_count": 0,
            "phone_wechat_count": 0,
        }

    return {
        "job_id": job_id,
        "total_candidates": total_candidates,
        "status_counts": status_counts,
        "today_progress": today_data,
    }
