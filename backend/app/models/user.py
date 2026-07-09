"""用户模型 - 存储用户基本信息和VIP状态"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    """用户模型"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, comment="用户ID")
    username = Column(String(50), unique=True, nullable=False, index=True, comment="用户名")
    email = Column(String(100), unique=True, nullable=True, index=True, comment="邮箱")
    hashed_password = Column(String(255), nullable=False, comment="密码哈希")
    phone_udid = Column(String(50), unique=True, nullable=True, index=True, comment="手机号/设备唯一标识")
    is_active = Column(Boolean, default=True, comment="是否激活")
    is_vip = Column(Boolean, default=False, comment="是否VIP用户")
    vip_expire_date = Column(DateTime, nullable=True, comment="VIP过期时间")
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")

    # 关联关系
    jobs = relationship("Job", back_populates="user", lazy="selectin")
    candidates = relationship("Candidate", back_populates="user", lazy="selectin")
    templates = relationship("Template", back_populates="user", lazy="selectin")
    daily_progresses = relationship("DailyProgress", back_populates="user", lazy="selectin")
    platform_accounts = relationship("PlatformAccount", back_populates="user", lazy="selectin")
    bot_action_logs = relationship("BotActionLog", back_populates="user", lazy="selectin")
    messages = relationship("Message", back_populates="user", lazy="selectin")
