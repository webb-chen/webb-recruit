"""机器人操作日志模型 - 记录自动化操作的执行情况"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class BotActionLog(Base):
    """机器人操作日志模型"""
    __tablename__ = "bot_action_logs"

    id = Column(Integer, primary_key=True, index=True, comment="日志ID")
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, comment="所属用户ID")
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=True, index=True, comment="关联职位ID")
    # 操作类型: 1=打招呼, 2=复聊, 3=查看简历
    action_type = Column(Integer, nullable=False, comment="操作类型(1打招呼/2复聊/3查看简历)")
    platform = Column(String(50), nullable=False, default="boss", comment="操作平台")
    candidate_name = Column(String(100), nullable=True, comment="候选人姓名")
    content = Column(Text, nullable=True, comment="操作内容")
    status = Column(String(20), default="success", comment="执行状态(success/failed)")
    error_msg = Column(Text, nullable=True, comment="错误信息")
    created_at = Column(DateTime, default=datetime.utcnow, index=True, comment="创建时间")

    # 关联关系
    user = relationship("User", back_populates="bot_action_logs")
    job = relationship("Job", back_populates="bot_action_logs")
