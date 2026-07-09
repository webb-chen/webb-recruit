"""消息Schema定义 - 请求和响应数据结构"""

from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime


class MessageCreate(BaseModel):
    """创建消息请求"""
    candidate_id: int = Field(..., description="关联候选人ID")
    platform: str = Field("boss", description="消息平台")
    direction: str = Field(..., description="消息方向(sent/received)")
    content: Optional[str] = Field(None, description="消息内容")
    msg_type: str = Field("text", description="消息类型(text/image/file)")
    is_ai_generated: bool = Field(False, description="是否为AI生成")


class MessageResponse(BaseModel):
    """消息响应"""
    id: int
    user_id: int
    candidate_id: int
    platform: str
    direction: str
    content: Optional[str] = None
    msg_type: str
    is_ai_generated: bool
    created_at: datetime

    class Config:
        from_attributes = True
