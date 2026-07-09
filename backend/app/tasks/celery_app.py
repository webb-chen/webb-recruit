"""Celery应用配置 - 异步任务队列"""

from celery import Celery
from app.config import settings

# 创建Celery应用实例
celery = Celery(
    "ai-supin",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

# Celery配置
celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Shanghai",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    result_expires=3600,  # 结果保留1小时
    task_default_queue="default",
    task_queues={
        "default": {
            "exchange": "default",
            "routing_key": "default",
        },
    },
)

# 自动发现任务模块
celery.autodiscover_tasks(["app.tasks"])
