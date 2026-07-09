"""认证相关API - 登录和令牌管理"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.user import UserLogin, UserCreate, UserResponse
from app.schemas.common import ApiResponse, TokenResponse
from app.services.user_service import create_user, authenticate_user
from app.core.security import create_access_token
from app.dependencies import get_current_user
from app.models.user import User
from datetime import timedelta
from app.config import settings

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/register", response_model=ApiResponse[UserResponse])
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """用户注册"""
    user = await create_user(
        db,
        username=user_data.username,
        password=user_data.password,
        email=user_data.email,
        phone_udid=user_data.phone_udid,
    )
    return ApiResponse(data=UserResponse.model_validate(user))


@router.post("/login", response_model=ApiResponse[TokenResponse])
async def login(
    user_data: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    """用户登录 - 返回JWT令牌"""
    user = await authenticate_user(db, user_data.username, user_data.password)

    # 生成JWT令牌
    access_token = create_access_token(
        data={"sub": str(user.id), "username": user.username},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return ApiResponse(data=TokenResponse(access_token=access_token))


@router.get("/me", response_model=ApiResponse[UserResponse])
async def get_me(current_user: User = Depends(get_current_user)):
    """获取当前登录用户信息"""
    return ApiResponse(data=UserResponse.model_validate(current_user))
