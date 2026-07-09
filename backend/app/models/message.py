"""消息模型 - 存储与候选人的聊天记录"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Message(Base):
    """消息模型"""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True, comment="消息ID")
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, comment="所属用户ID")
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True, comment="关联候选人ID")
    platform = Column(String(50), nullable=False, default="boss", comment="消息平台")
    direction = Column(String(20), nullable=False, comment="消息方向(sent=发送/received=接收)")
    content = Column(Text, nullable=True, comment="消息内容")
    msg_type = Column(String(20), default="text", comment="消息类型(text/image/file)")
    is_ai_generated = Column(Boolean, default=False, comment="是否为AI生成")
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")

    # 关联关系
    user = relationship("User", back_populates="messages")
    candidate = relationship("Candidate", back_populates="messages")
