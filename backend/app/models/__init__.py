"""数据库模型包 - 导入所有模型供Alembic迁移和ORM使用"""

from app.models.user import User
from app.models.job import Job
from app.models.candidate import Candidate
from app.models.daily_progress import DailyProgress
from app.models.message import Message
from app.models.template import Template
from app.models.bot_action_log import BotActionLog
from app.models.platform_account import PlatformAccount

__all__ = [
    "User",
    "Job",
    "Candidate",
    "DailyProgress",
    "Message",
    "Template",
    "BotActionLog",
    "PlatformAccount",
]
