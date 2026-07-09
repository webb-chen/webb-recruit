"""打招呼异步任务 - 通过Celery执行自动化打招呼操作"""

import logging
from datetime import date
from app.tasks.celery_app import celery

logger = logging.getLogger(__name__)


@celery.task(name="tasks.say_hello", bind=True, max_retries=2)
def start_say_hello_task(
    self,
    user_id: int,
    job_id: int,
    encrypt_job_id: str,
    hello_text: str,
    max_times: int,
    cookies: str,
    platform: str = "boss",
):
    """打招呼异步任务

    该任务通过Celery在后台执行，使用Playwright自动化完成打招呼操作。
    任务执行完成后会自动记录操作日志和每日进度。

    Args:
        user_id: 用户ID
        job_id: 职位ID
        encrypt_job_id: 加密的职位ID
        hello_text: 打招呼话术
        max_times: 最大打招呼次数
        cookies: 平台登录Cookie
        platform: 招聘平台
    """
    import asyncio
    from app.services.playwright_service import execute_say_hello_flow

    logger.info(
        f"开始执行打招呼任务: user_id={user_id}, job_id={job_id}, "
        f"max_times={max_times}, platform={platform}"
    )

    try:
        # 在新事件循环中执行异步流程
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        stats = loop.run_until_complete(
            execute_say_hello_flow(
                cookies=cookies,
                encrypt_job_id=encrypt_job_id,
                hello_text=hello_text,
                max_times=max_times,
            )
        )
        loop.close()

        # 记录操作结果
        success_count = stats.get("success_count", 0)
        fail_count = stats.get("fail_count", 0)
        errors = stats.get("errors", [])

        logger.info(
            f"打招呼任务完成: user_id={user_id}, job_id={job_id}, "
            f"success={success_count}, fail={fail_count}, errors={errors}"
        )

        # 异步更新每日进度（使用同步方式调用）
        try:
            loop2 = asyncio.new_event_loop()
            asyncio.set_event_loop(loop2)
            loop2.run_until_complete(
                _update_daily_progress(
                    user_id=user_id,
                    job_id=job_id,
                    say_hello_times=success_count,
                )
            )
            loop2.close()
        except Exception as e:
            logger.error(f"更新每日进度失败: {e}")

        # 记录操作日志
        try:
            loop3 = asyncio.new_event_loop()
            asyncio.set_event_loop(loop3)
            loop3.run_until_complete(
                _log_bot_actions(
                    user_id=user_id,
                    job_id=job_id,
                    details=stats.get("details", []),
                    platform=platform,
                )
            )
            loop3.close()
        except Exception as e:
            logger.error(f"记录操作日志失败: {e}")

        return {
            "status": "completed",
            "success_count": success_count,
            "fail_count": fail_count,
            "errors": errors,
        }

    except Exception as e:
        logger.error(f"打招呼任务异常: user_id={user_id}, job_id={job_id}, error={e}")
        raise self.retry(exc=e, countdown=60)


async def _update_daily_progress(
    user_id: int,
    job_id: int,
    say_hello_times: int,
):
    """更新每日进度数据"""
    from app.database import AsyncSessionLocal
    from app.models.daily_progress import DailyProgress
    from sqlalchemy import select

    async with AsyncSessionLocal() as session:
        try:
            today = date.today()
            result = await session.execute(
                select(DailyProgress).where(
                    DailyProgress.job_id == job_id,
                    DailyProgress.user_id == user_id,
                    DailyProgress.d_date == today,
                )
            )
            progress = result.scalar_one_or_none()

            if progress:
                progress.say_hello_times += say_hello_times
            else:
                progress = DailyProgress(
                    job_id=job_id,
                    user_id=user_id,
                    d_date=today,
                    say_hello_times=say_hello_times,
                )
                session.add(progress)

            await session.commit()
        except Exception as e:
            await session.rollback()
            raise


async def _log_bot_actions(
    user_id: int,
    job_id: int,
    details: list,
    platform: str,
):
    """记录机器人操作日志"""
    from app.database import AsyncSessionLocal
    from app.models.bot_action_log import BotActionLog
    from datetime import datetime

    async with AsyncSessionLocal() as session:
        try:
            for detail in details:
                log = BotActionLog(
                    user_id=user_id,
                    job_id=job_id,
                    action_type=1,  # 1=打招呼
                    platform=platform,
                    candidate_name=detail.get("candidate_name", ""),
                    content=detail.get("message", ""),
                    status="success" if detail.get("success") else "failed",
                    created_at=datetime.utcnow(),
                )
                session.add(log)

            await session.commit()
        except Exception as e:
            await session.rollback()
            raise
