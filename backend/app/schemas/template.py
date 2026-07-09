"""话术模板Schema定义 - 请求和响应数据结构"""

from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime


class TemplateCreate(BaseModel):
    """创建话术模板请求"""
    name: str = Field(..., max_length=200, description="模板名称")
    content: str = Field(..., description="模板内容")
    platform: str = Field("boss", description="适用平台")
    is_default: bool = Field(False, description="是否为默认模板")


class TemplateUpdate(BaseModel):
    """更新话术模板请求"""
    name: Optional[str] = Field(None, max_length=200, description="模板名称")
    content: Optional[str] = Field(None, description="模板内容")
    platform: Optional[str] = Field(None, description="适用平台")
    is_default: Optional[bool] = Field(None, description="是否为默认模板")


class TemplateResponse(BaseModel):
    """话术模板响应"""
    id: int
    user_id: int
    name: str
    content: str
    platform: str
    is_default: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
