"""统计服务层 - 处理数据统计和看板相关业务逻辑"""

from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import date, timedelta
from app.models.candidate import Candidate
from app.models.daily_progress import DailyProgress
from app.models.job import Job
from app.models.bot_action_log import BotActionLog


async def get_dashboard_stats(db: AsyncSession, user_id: int) -> Dict[str, Any]:
    """获取用户看板统计数据

    Args:
        db: 数据库会话
        user_id: 用户ID

    Returns:
        包含各项汇总统计数据的字典
    """
    today = date.today()

    # 活跃职位数
    active_jobs_result = await db.execute(
        select(func.count(Job.id)).where(
            Job.user_id == user_id,
            Job.status == "open"
        )
    )
    active_jobs = active_jobs_result.scalar() or 0

    # 候选人总数
    total_candidates_result = await db.execute(
        select(func.count(Candidate.id)).where(Candidate.user_id == user_id)
    )
    total_candidates = total_candidates_result.scalar() or 0

    # 今日打招呼次数
    today_hello_result = await db.execute(
        select(func.coalesce(func.sum(DailyProgress.say_hello_times), 0)).where(
            DailyProgress.user_id == user_id,
            DailyProgress.d_date == today
        )
    )
    today_hello = today_hello_result.scalar() or 0

    # 今日新增候选人
    today_new_result = await db.execute(
        select(func.coalesce(func.sum(DailyProgress.candidate_count), 0)).where(
            DailyProgress.user_id == user_id,
            DailyProgress.d_date == today
        )
    )
    today_new = today_new_result.scalar() or 0

    # 今日获取联系方式
    today_phone_result = await db.execute(
        select(func.coalesce(func.sum(DailyProgress.phone_wechat_count), 0)).where(
            DailyProgress.user_id == user_id,
            DailyProgress.d_date == today
        )
    )
    today_phone = today_phone_result.scalar() or 0

    # 累计获取联系方式
    total_phone_result = await db.execute(
        select(func.count(Candidate.id)).where(
            Candidate.user_id == user_id,
            Candidate.status >= 4
        )
    )
    total_phone = total_phone_result.scalar() or 0

    # 操作成功率
    success_result = await db.execute(
        select(func.count(BotActionLog.id)).where(
            BotActionLog.user_id == user_id,
            BotActionLog.status == "success",
            BotActionLog.created_at >= datetime.combine(today, datetime.min.time())
        )
    )
    fail_result = await db.execute(
        select(func.count(BotActionLog.id)).where(
            BotActionLog.user_id == user_id,
            BotActionLog.status == "failed",
            BotActionLog.created_at >= datetime.combine(today, datetime.min.time())
        )
    )
    success_count = success_result.scalar() or 0
    fail_count = fail_result.scalar() or 0
    total_actions = success_count + fail_count
    success_rate = round((success_count / total_actions * 100), 1) if total_actions > 0 else 0.0

    return {
        "active_jobs": active_jobs,
        "total_candidates": total_candidates,
        "today_hello": today_hello,
        "today_new_candidates": today_new,
        "today_phone_wechat": today_phone,
        "total_phone_wechat": total_phone,
        "today_action_success_rate": success_rate,
    }


async def get_daily_stats(
    db: AsyncSession,
    user_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    job_id: Optional[int] = None,
) -> List[Dict[str, Any]]:
    """获取每日统计数据列表

    Args:
        db: 数据库会话
        user_id: 用户ID
        start_date: 开始日期（可选）
        end_date: 结束日期（可选）
        job_id: 职位ID筛选（可选）

    Returns:
        每日统计数据列表
    """
    if not start_date:
        start_date = today - timedelta(days=30)
    if not end_date:
        end_date = today

    query = select(DailyProgress).where(
        DailyProgress.user_id == user_id,
        DailyProgress.d_date >= start_date,
        DailyProgress.d_date <= end_date
    )

    if job_id:
        query = query.where(DailyProgress.job_id == job_id)

    query = query.order_by(DailyProgress.d_date.asc())

    result = await db.execute(query)
    progresses = result.scalars().all()

    return [
        {
            "d_date": p.d_date.isoformat(),
            "say_hello_times": p.say_hello_times,
            "look_times": p.look_times,
            "repeat_call_times": p.repeat_call_times,
            "candidate_count": p.candidate_count,
            "resume_count": p.resume_count,
            "phone_wechat_count": p.phone_wechat_count,
        }
        for p in progresses
    ]


async def get_trend_data(
    db: AsyncSession,
    user_id: int,
    days: int = 30,
    metric: str = "say_hello_times",
) -> List[Dict[str, Any]]:
    """获取趋势数据（用于图表展示）

    Args:
        db: 数据库会话
        user_id: 用户ID
        days: 天数（默认30天）
        metric: 统计指标名称

    Returns:
        趋势数据列表，每个元素包含日期和指标值
    """
    end_date = today
    start_date = today - timedelta(days=days)

    # 获取有效字段映射
    valid_metrics = {
        "say_hello_times": DailyProgress.say_hello_times,
        "look_times": DailyProgress.look_times,
        "repeat_call_times": DailyProgress.repeat_call_times,
        "candidate_count": DailyProgress.candidate_count,
        "resume_count": DailyProgress.resume_count,
        "phone_wechat_count": DailyProgress.phone_wechat_count,
    }

    if metric not in valid_metrics:
        raise ValueError(f"无效的统计指标: {metric}")

    # 按日期聚合
    col = valid_metrics[metric]
    query = select(
        DailyProgress.d_date,
        func.coalesce(func.sum(col), 0).label(metric)
    ).where(
        DailyProgress.user_id == user_id,
        DailyProgress.d_date >= start_date,
        DailyProgress.d_date <= end_date
    ).group_by(DailyProgress.d_date).order_by(DailyProgress.d_date.asc())

    result = await db.execute(query)
    rows = result.all()

    # 填充无数据的日期
    trend_data = []
    current_date = start_date
    date_map = {row[0]: row[1] for row in rows}

    while current_date <= end_date:
        trend_data.append({
            "date": current_date.isoformat(),
            "value": date_map.get(current_date, 0),
        })
        current_date += timedelta(days=1)

    return trend_data
