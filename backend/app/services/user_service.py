"""用户服务层 - 处理用户相关的业务逻辑"""

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.user import User
from app.core.security import get_password_hash, verify_password


async def create_user(
    db: AsyncSession,
    username: str,
    password: str,
    email: Optional[str] = None,
    phone_udid: Optional[str] = None,
) -> User:
    """创建新用户

    Args:
        db: 数据库会话
        username: 用户名
        password: 明文密码
        email: 邮箱（可选）
        phone_udid: 手机号/设备标识（可选）

    Returns:
        创建成功的用户对象

    Raises:
        HTTPException: 用户名或邮箱已存在时抛出400异常
    """
    # 检查用户名是否已存在
    result = await db.execute(select(User).where(User.username == username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )

    # 检查邮箱是否已存在
    if email:
        result = await db.execute(select(User).where(User.email == email))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱已被注册"
            )

    # 创建用户
    user = User(
        username=username,
        hashed_password=get_password_hash(password),
        email=email,
        phone_udid=phone_udid,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def authenticate_user(
    db: AsyncSession,
    username: str,
    password: str,
) -> User:
    """验证用户登录凭据

    Args:
        db: 数据库会话
        username: 用户名
        password: 明文密码

    Returns:
        验证成功的用户对象

    Raises:
        HTTPException: 用户名不存在或密码错误时抛出401异常
    """
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )

    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="用户已被禁用"
        )

    return user


async def get_user_by_id(db: AsyncSession, user_id: int) -> User:
    """根据ID获取用户

    Args:
        db: 数据库会话
        user_id: 用户ID

    Returns:
        用户对象

    Raises:
        HTTPException: 用户不存在时抛出404异常
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    return user


async def update_user(
    db: AsyncSession,
    user_id: int,
    email: Optional[str] = None,
    phone_udid: Optional[str] = None,
    is_active: Optional[bool] = None,
) -> User:
    """更新用户信息

    Args:
        db: 数据库会话
        user_id: 用户ID
        email: 新邮箱
        phone_udid: 新手机号/设备标识
        is_active: 激活状态

    Returns:
        更新后的用户对象

    Raises:
        HTTPException: 用户不存在时抛出404异常
    """
    user = await get_user_by_id(db, user_id)

    if email is not None:
        # 检查邮箱是否被其他用户使用
        result = await db.execute(
            select(User).where(User.email == email, User.id != user_id)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱已被其他用户使用"
            )
        user.email = email

    if phone_udid is not None:
        user.phone_udid = phone_udid

    if is_active is not None:
        user.is_active = is_active

    await db.flush()
    await db.refresh(user)
    return user
