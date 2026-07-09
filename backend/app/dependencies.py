"""公共依赖注入模块 - 获取当前登录用户"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.security import verify_token
from app.database import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """从JWT令牌中获取当前登录用户

    Args:
        token: JWT令牌（通过OAuth2自动注入）
        db: 数据库会话（通过依赖注入获取）

    Returns:
        当前登录的User模型实例

    Raises:
        HTTPException: 令牌无效或用户不存在时抛出401异常
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效的认证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = verify_token(token)
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    # 从数据库查询用户
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="用户已被禁用"
        )
    return user
