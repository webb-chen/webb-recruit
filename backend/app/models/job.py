"""招聘职位模型 - 存储招聘岗位配置信息"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Job(Base):
    """招聘职位模型"""
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True, comment="职位ID")
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, comment="所属用户ID")
    post_name = Column(String(200), nullable=False, comment="职位名称")
    encrypt_job_id = Column(String(100), nullable=True, comment="平台加密的职位ID")
    platform = Column(String(50), nullable=False, default="boss", comment="招聘平台(boss/liepin等)")
    area = Column(String(200), nullable=True, comment="工作地区")
    filters = Column(JSON, nullable=True, default=dict, comment="筛选条件(JSON)")
    say_hello_max_times = Column(Integer, default=100, comment="每日打招呼最大次数")
    say_hello_text = Column(Text, nullable=True, comment="打招呼话术")
    repeat_config = Column(JSON, nullable=True, default=dict, comment="复聊配置(JSON)")
    ai_config = Column(JSON, nullable=True, default=dict, comment="AI配置(JSON)")
    ai_knowledge = Column(Text, nullable=True, comment="AI知识库内容")
    template_id = Column(Integer, ForeignKey("templates.id", ondelete="SET NULL"), nullable=True, comment="关联模板ID")
    status = Column(String(20), default="open", comment="状态(open/closed)")
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")

    # 关联关系
    user = relationship("User", back_populates="jobs")
    template = relationship("Template", back_populates="jobs")
    candidates = relationship("Candidate", back_populates="job", lazy="selectin")
    daily_progresses = relationship("DailyProgress", back_populates="job", lazy="selectin")
    bot_action_logs = relationship("BotActionLog", back_populates="job", lazy="selectin")
