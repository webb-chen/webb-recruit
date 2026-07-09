"""平台账号模型 - 存储招聘平台登录信息和Cookie"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class PlatformAccount(Base):
    """平台账号模型"""
    __tablename__ = "platform_accounts"

    id = Column(Integer, primary_key=True, index=True, comment="账号ID")
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, comment="所属用户ID")
    platform = Column(String(50), nullable=False, default="boss", comment="平台名称")
    account_name = Column(String(200), nullable=False, comment="账号名称")
    cookies = Column(Text, nullable=True, comment="Cookie信息(TEXT/JSON格式)")
    is_login = Column(Boolean, default=False, comment="是否处于登录状态")
    last_login_at = Column(DateTime, nullable=True, comment="最后登录时间")
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")

    # 关联关系
    user = relationship("User", back_populates="platform_accounts")
