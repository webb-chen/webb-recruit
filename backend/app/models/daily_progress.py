"""每日进度模型 - 统计每日招聘自动化操作数据"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime, date
from app.database import Base


class DailyProgress(Base):
    """每日进度模型"""
    __tablename__ = "daily_progress"

    id = Column(Integer, primary_key=True, index=True, comment="进度ID")
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True, comment="关联职位ID")
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, comment="所属用户ID")
    d_date = Column(Date, nullable=False, index=True, comment="统计日期")
    say_hello_times = Column(Integer, default=0, comment="打招呼次数")
    look_times = Column(Integer, default=0, comment="查看次数")
    repeat_call_times = Column(Integer, default=0, comment="复聊次数")
    repeat_call_view_times = Column(Integer, default=0, comment="复聊查看次数")
    candidate_activate_count = Column(Integer, default=0, comment="候选人激活数")
    resume_count = Column(Integer, default=0, comment="简历下载数")
    candidate_count = Column(Integer, default=0, comment="新增候选人数")
    phone_wechat_count = Column(Integer, default=0, comment="获取电话/微信号数")
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")

    # 关联关系
    user = relationship("User", back_populates="daily_progresses")
    job = relationship("Job", back_populates="daily_progresses")
