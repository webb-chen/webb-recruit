#!/usr/bin/env python3
"""
创建初始管理员账号脚本
用途: 通过SQLAlchemy同步方式连接PostgreSQL，创建admin管理员用户
使用: docker exec ai-supin-backend python /app/scripts/create-admin.py
      或在容器内: python scripts/create-admin.py
"""

import sys
import os

# 确保可以找到app模块
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# 配置
DB_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+asyncpg://supin:supin123@postgres:5432/ai_supin"
).replace("+asyncpg", "+psycopg2")

ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@aisupin.com")


def create_admin():
    """创建初始管理员账号"""
    # 使用psycopg2同步驱动
    engine = create_engine(DB_URL)
    Session = sessionmaker(bind=engine)
    session = Session()

    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    try:
        # 检查管理员是否已存在
        result = session.execute(
            text("SELECT id FROM users WHERE username = :username"),
            {"username": ADMIN_USERNAME}
        ).fetchone()

        if result:
            print(f"管理员账号 '{ADMIN_USERNAME}' 已存在 (ID: {result[0]})，跳过创建")
            return

        # 创建管理员
        hashed_password = pwd_context.hash(ADMIN_PASSWORD)
        session.execute(
            text(
                "INSERT INTO users (username, email, hashed_password, is_active, is_vip) "
                "VALUES (:username, :email, :password, :is_active, :is_vip)"
            ),
            {
                "username": ADMIN_USERNAME,
                "email": ADMIN_EMAIL,
                "password": hashed_password,
                "is_active": True,
                "is_vip": True,
            }
        )
        session.commit()
        print(f"管理员账号创建成功！")
        print(f"  用户名: {ADMIN_USERNAME}")
        print(f"  密码: {ADMIN_PASSWORD}")
        print(f"  邮箱: {ADMIN_EMAIL}")

    except Exception as e:
        session.rollback()
        print(f"创建管理员失败: {e}")
        sys.exit(1)
    finally:
        session.close()
        engine.dispose()


if __name__ == "__main__":
    create_admin()
