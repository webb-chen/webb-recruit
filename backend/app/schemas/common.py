"""公共Schema定义 - 分页响应和通用响应封装"""

from typing import TypeVar, Generic, List, Optional
from pydantic import BaseModel
from datetime import datetime


# 泛型类型
T = TypeVar("T")


class PaginationParams(BaseModel):
    """分页参数"""
    page: int = 1
    page_size: int = 20

    @property
    def offset(self) -> int:
        """计算SQL偏移量"""
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        """获取每页数量上限"""
        return self.page_size


class PaginatedResponse(BaseModel, Generic[T]):
    """分页响应封装"""
    total: int
    page: int
    page_size: int
    items: List[T]
    total_pages: Optional[int] = None

    def __init__(self, **data):
        super().__init__(**data)
        if self.total_pages is None and self.page_size > 0:
            self.total_pages = (self.total + self.page_size - 1) // self.page_size


class ApiResponse(BaseModel, Generic[T]):
    """统一API响应格式"""
    code: int = 200
    message: str = "success"
    data: Optional[T] = None


class TokenResponse(BaseModel):
    """JWT令牌响应"""
    access_token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    """简单消息响应"""
    message: str


class IdResponse(BaseModel):
    """ID响应"""
    id: int
