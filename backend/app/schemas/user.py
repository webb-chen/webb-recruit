"""用户Schema定义 - 请求和响应数据结构"""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class UserCreate(BaseModel):
    """创建用户请求"""
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    email: Optional[str] = Field(None, max_length=100, description="邮箱")
    password: str = Field(..., min_length=6, max_length=100, description="密码")
    phone_udid: Optional[str] = Field(None, max_length=50, description="手机号/设备标识")


class UserUpdate(BaseModel):
    """更新用户请求"""
    email: Optional[str] = Field(None, max_length=100, description="邮箱")
    phone_udid: Optional[str] = Field(None, max_length=50, description="手机号/设备标识")
    is_active: Optional[bool] = Field(None, description="是否激活")


class UserLogin(BaseModel):
    """用户登录请求"""
    username: str = Field(..., description="用户名")
    password: str = Field(..., description="密码")


class UserResponse(BaseModel):
    """用户响应"""
    id: int
    username: str
    email: Optional[str] = None
    phone_udid: Optional[str] = None
    is_active: bool
    is_vip: bool
    vip_expire_date: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserInfo(BaseModel):
    """用户简要信息（用于其他Schema嵌套）"""
    id: int
    username: str

    class Config:
        from_attributes = True
