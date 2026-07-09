"""候选人Schema定义 - 请求和响应数据结构"""

from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


class CandidateCreate(BaseModel):
    """创建候选人请求"""
    job_id: int = Field(..., description="关联职位ID")
    platform: str = Field("boss", description="来源平台")
    boss_encrypt_user_id: Optional[str] = Field(None, description="平台加密用户ID")
    name: Optional[str] = Field(None, description="姓名")
    gender: Optional[str] = Field(None, description="性别")
    age: Optional[int] = Field(None, description="年龄")
    educational: Optional[str] = Field(None, description="学历")
    expected_city: Optional[str] = Field(None, description="期望城市")
    expected_job_name: Optional[str] = Field(None, description="期望职位")
    expected_salary_min: Optional[int] = Field(None, description="期望薪资下限")
    expected_salary_max: Optional[int] = Field(None, description="期望薪资上限")
    job_intention: Optional[str] = Field(None, description="求职意向")
    phone: Optional[str] = Field(None, description="手机号")
    weixin: Optional[str] = Field(None, description="微信号")
    resume_link: Optional[str] = Field(None, description="简历链接")
    work_company: Optional[str] = Field(None, description="当前工作单位")


class CandidateUpdate(BaseModel):
    """更新候选人请求"""
    name: Optional[str] = Field(None, description="姓名")
    gender: Optional[str] = Field(None, description="性别")
    age: Optional[int] = Field(None, description="年龄")
    educational: Optional[str] = Field(None, description="学历")
    expected_city: Optional[str] = Field(None, description="期望城市")
    expected_job_name: Optional[str] = Field(None, description="期望职位")
    expected_salary_min: Optional[int] = Field(None, description="期望薪资下限")
    expected_salary_max: Optional[int] = Field(None, description="期望薪资上限")
    phone: Optional[str] = Field(None, description="手机号")
    weixin: Optional[str] = Field(None, description="微信号")
    status: Optional[int] = Field(None, description="状态")
    lock_status: Optional[int] = Field(None, description="锁定状态")


class CandidateBatchUpdate(BaseModel):
    """批量更新候选人状态"""
    ids: List[int] = Field(..., description="候选人ID列表")
    status: int = Field(..., description="目标状态")


class CandidateResponse(BaseModel):
    """候选人响应"""
    id: int
    user_id: int
    job_id: int
    platform: str
    boss_encrypt_user_id: Optional[str] = None
    name: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    educational: Optional[str] = None
    expected_city: Optional[str] = None
    expected_job_name: Optional[str] = None
    expected_salary_min: Optional[int] = None
    expected_salary_max: Optional[int] = None
    job_intention: Optional[str] = None
    phone: Optional[str] = None
    weixin: Optional[str] = None
    resume_link: Optional[str] = None
    work_company: Optional[str] = None
    status: int
    lock_status: int
    lock_user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
