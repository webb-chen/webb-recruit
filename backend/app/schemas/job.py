"""职位Schema定义 - 请求和响应数据结构"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class JobCreate(BaseModel):
    """创建职位请求"""
    post_name: str = Field(..., max_length=200, description="职位名称")
    encrypt_job_id: Optional[str] = Field(None, max_length=100, description="平台加密职位ID")
    platform: str = Field("boss", max_length=50, description="招聘平台")
    area: Optional[str] = Field(None, max_length=200, description="工作地区")
    filters: Optional[Dict[str, Any]] = Field(default=dict, description="筛选条件")
    say_hello_max_times: int = Field(100, description="每日打招呼最大次数")
    say_hello_text: Optional[str] = Field(None, description="打招呼话术")
    repeat_config: Optional[Dict[str, Any]] = Field(default=dict, description="复聊配置")
    ai_config: Optional[Dict[str, Any]] = Field(default=dict, description="AI配置")
    ai_knowledge: Optional[str] = Field(None, description="AI知识库内容")
    template_id: Optional[int] = Field(None, description="关联模板ID")


class JobUpdate(BaseModel):
    """更新职位请求"""
    post_name: Optional[str] = Field(None, max_length=200, description="职位名称")
    area: Optional[str] = Field(None, max_length=200, description="工作地区")
    filters: Optional[Dict[str, Any]] = Field(None, description="筛选条件")
    say_hello_max_times: Optional[int] = Field(None, description="每日打招呼最大次数")
    say_hello_text: Optional[str] = Field(None, description="打招呼话术")
    repeat_config: Optional[Dict[str, Any]] = Field(None, description="复聊配置")
    ai_config: Optional[Dict[str, Any]] = Field(None, description="AI配置")
    ai_knowledge: Optional[str] = Field(None, description="AI知识库内容")
    template_id: Optional[int] = Field(None, description="关联模板ID")
    status: Optional[str] = Field(None, description="状态(open/closed)")


class JobResponse(BaseModel):
    """职位响应"""
    id: int
    user_id: int
    post_name: str
    encrypt_job_id: Optional[str] = None
    platform: str
    area: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None
    say_hello_max_times: int
    say_hello_text: Optional[str] = None
    repeat_config: Optional[Dict[str, Any]] = None
    ai_config: Optional[Dict[str, Any]] = None
    ai_knowledge: Optional[str] = None
    template_id: Optional[int] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
