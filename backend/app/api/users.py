"""用户管理API - 用户信息的查询和更新"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.common import ApiResponse
from app.services.user_service import update_user
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/users", tags=["用户管理"])


@router.get("/me", response_model=ApiResponse[UserResponse])
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """获取当前用户信息"""
    return ApiResponse(data=UserResponse.model_validate(current_user))


@router.put("/me", response_model=ApiResponse[UserResponse])
async def update_current_user(
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新当前用户信息"""
    updated_user = await update_user(
        db,
        user_id=current_user.id,
        email=user_data.email,
        phone_udid=user_data.phone_udid,
        is_active=user_data.is_active,
    )
    return ApiResponse(data=UserResponse.model_validate(updated_user))
