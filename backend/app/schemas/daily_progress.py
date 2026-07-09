"""每日进度Schema定义 - 请求和响应数据结构"""

from typing import Optional
from pydantic import BaseModel, Field
from datetime import date, datetime


class DailyProgressCreate(BaseModel):
    """创建每日进度请求"""
    job_id: int = Field(..., description="关联职位ID")
    d_date: date = Field(..., description="统计日期")
    say_hello_times: int = Field(0, description="打招呼次数")
    look_times: int = Field(0, description="查看次数")
    repeat_call_times: int = Field(0, description="复聊次数")
    repeat_call_view_times: int = Field(0, description="复聊查看次数")
    candidate_activate_count: int = Field(0, description="候选人激活数")
    resume_count: int = Field(0, description="简历下载数")
    candidate_count: int = Field(0, description="新增候选人数")
    phone_wechat_count: int = Field(0, description="获取电话/微信号数")


class DailyProgressUpdate(BaseModel):
    """更新每日进度请求"""
    say_hello_times: Optional[int] = Field(None, description="打招呼次数")
    look_times: Optional[int] = Field(None, description="查看次数")
    repeat_call_times: Optional[int] = Field(None, description="复聊次数")
    repeat_call_view_times: Optional[int] = Field(None, description="复聊查看次数")
    candidate_activate_count: Optional[int] = Field(None, description="候选人激活数")
    resume_count: Optional[int] = Field(None, description="简历下载数")
    candidate_count: Optional[int] = Field(None, description="新增候选人数")
    phone_wechat_count: Optional[int] = Field(None, description="获取电话/微信号数")


class DailyProgressResponse(BaseModel):
    """每日进度响应"""
    id: int
    job_id: int
    user_id: int
    d_date: date
    say_hello_times: int
    look_times: int
    repeat_call_times: int
    repeat_call_view_times: int
    candidate_activate_count: int
    resume_count: int
    candidate_count: int
    phone_wechat_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DailyProgressSummary(BaseModel):
    """每日进度汇总（跨职位）"""
    d_date: date
    total_say_hello: int = 0
    total_look: int = 0
    total_repeat_call: int = 0
    total_candidate: int = 0
    total_resume: int = 0
    total_phone_wechat: int = 0
