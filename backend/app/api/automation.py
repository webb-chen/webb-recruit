"""自动化操作API - 启动打招呼、复聊、查看简历等自动化任务"""

import json
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.schemas.common import ApiResponse
from app.dependencies import get_current_user
from app.models.user import User
from app.models.platform_account import PlatformAccount
from app.tasks.say_hello import start_say_hello_task

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/automation", tags=["自动化操作"])


@router.post("/say-hello", response_model=ApiResponse)
async def start_say_hello(
    job_id: int,
    hello_text: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """启动打招呼自动化任务

    Args:
        job_id: 职位ID
        hello_text: 打招呼话术（为空则使用职位默认话术）
    """
    # 获取职位信息
    from app.models.job import Job
    result = await db.execute(
        select(Job).where(Job.id == job_id, Job.user_id == current_user.id)
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="职位不存在")

    # 检查职位状态
    if job.status != "open":
        raise HTTPException(status_code=400, detail="职位已关闭，无法启动自动化")

    # 获取平台账号Cookie
    account_result = await db.execute(
        select(PlatformAccount).where(
            PlatformAccount.user_id == current_user.id,
            PlatformAccount.platform == job.platform,
            PlatformAccount.is_login == True,
        )
    )
    account = account_result.scalar_one_or_none()
    if not account or not account.cookies:
        raise HTTPException(
            status_code=400,
            detail="未找到有效的平台登录信息，请先登录平台账号"
        )

    # 使用自定义话术或职位默认话术
    text = hello_text or job.say_hello_text
    if not text:
        raise HTTPException(status_code=400, detail="请提供打招呼话术")

    # 通过Celery异步执行打招呼任务
    task = start_say_hello_task.delay(
        user_id=current_user.id,
        job_id=job.id,
        encrypt_job_id=job.encrypt_job_id or "",
        hello_text=text,
        max_times=job.say_hello_max_times,
        cookies=account.cookies,
        platform=job.platform,
    )

    return ApiResponse(data={
        "task_id": task.id,
        "message": "打招呼任务已启动",
        "job_name": job.post_name,
        "max_times": job.say_hello_max_times,
    })


@router.post("/stop/{task_id}", response_model=ApiResponse)
async def stop_automation(task_id: str):
    """停止自动化任务

    Args:
        task_id: Celery任务ID
    """
    try:
        from app.tasks.celery_app import celery
        celery.control.revoke(task_id, terminate=True, signal="SIGTERM")
        return ApiResponse(message="任务已停止")
    except Exception as e:
        logger.error(f"停止任务失败: {e}")
        raise HTTPException(status_code=500, detail="停止任务失败")


@router.get("/status/{task_id}", response_model=ApiResponse)
async def get_task_status(task_id: str):
    """查询任务执行状态

    Args:
        task_id: Celery任务ID
    """
    try:
        from app.tasks.celery_app import celery
        result = celery.AsyncResult(task_id)

        status_map = {
            "PENDING": "等待中",
            "STARTED": "执行中",
            "SUCCESS": "已完成",
            "FAILURE": "执行失败",
            "REVOKED": "已取消",
        }

        return ApiResponse(data={
            "task_id": task_id,
            "status": result.state,
            "status_text": status_map.get(result.state, "未知"),
            "result": result.result if result.ready() else None,
        })
    except Exception as e:
        logger.error(f"查询任务状态失败: {e}")
        raise HTTPException(status_code=500, detail="查询任务状态失败")


@router.post("/update-cookies", response_model=ApiResponse)
async def update_account_cookies(
    platform: str,
    account_name: str,
    cookies: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新平台账号Cookie

    Args:
        platform: 平台名称
        account_name: 账号名称
        cookies: Cookie内容（JSON字符串）
    """
    # 查找现有账号
    result = await db.execute(
        select(PlatformAccount).where(
            PlatformAccount.user_id == current_user.id,
            PlatformAccount.platform == platform,
        )
    )
    account = result.scalar_one_or_none()

    if account:
        # 更新现有账号
        account.cookies = cookies
        account.account_name = account_name
        account.is_login = True
        from datetime import datetime
        account.last_login_at = datetime.utcnow()
    else:
        # 创建新账号记录
        from datetime import datetime
        account = PlatformAccount(
            user_id=current_user.id,
            platform=platform,
            account_name=account_name,
            cookies=cookies,
            is_login=True,
            last_login_at=datetime.utcnow(),
        )
        db.add(account)

    await db.flush()
    return ApiResponse(message="Cookie更新成功", data={"account_id": account.id})


@router.get("/account-status", response_model=ApiResponse)
async def get_account_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取平台账号登录状态"""
    result = await db.execute(
        select(PlatformAccount).where(
            PlatformAccount.user_id == current_user.id,
        ).order_by(PlatformAccount.updated_at.desc())
    )
    accounts = result.scalars().all()

    account_list = []
    for a in accounts:
        account_list.append({
            "id": a.id,
            "platform": a.platform,
            "account_name": a.account_name,
            "is_login": a.is_login,
            "last_login_at": a.last_login_at.isoformat() if a.last_login_at else None,
            "updated_at": a.updated_at.isoformat() if a.updated_at else None,
        })

    return ApiResponse(data=account_list)
