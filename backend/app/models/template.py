"""话术模板模型 - 存储打招呼和回复的话术模板"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Template(Base):
    """话术模板模型"""
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True, comment="模板ID")
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, comment="所属用户ID")
    name = Column(String(200), nullable=False, comment="模板名称")
    content = Column(Text, nullable=False, comment="模板内容")
    platform = Column(String(50), default="boss", comment="适用平台")
    is_default = Column(Boolean, default=False, comment="是否为默认模板")
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")

    # 关联关系
    user = relationship("User", back_populates="templates")
    jobs = relationship("Job", back_populates="template")
