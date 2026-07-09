"""应用配置管理模块 - 使用Pydantic Settings管理所有配置"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import json


class Settings(BaseSettings):
    """应用全局配置"""

    # ===== 数据库配置 =====
    DATABASE_URL: str = "postgresql+asyncpg://supin:supin123@postgres:5432/ai_supin"

    # ===== Redis配置 =====
    REDIS_URL: str = "redis://redis:6379/0"

    # ===== JWT安全配置 =====
    SECRET_KEY: str = "change-me-in-production-please"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ===== MinIO对象存储配置 =====
    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET_NAME: str = "ai-supin"
    MINIO_SECURE: bool = False

    # ===== OpenAI配置 =====
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_BASE_URL: str = ""

    # ===== 跨域配置 =====
    # 支持从环境变量读取逗号分隔的字符串，也支持JSON数组格式
    CORS_ORIGINS: str = "*"

    # ===== 应用配置 =====
    APP_NAME: str = "Webb招聘助手自动化系统"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """将CORS_ORIGINS字符串解析为列表"""
        if self.CORS_ORIGINS == "*":
            return ["*"]
        # 尝试JSON解析
        try:
            result = json.loads(self.CORS_ORIGINS)
            if isinstance(result, list):
                return [str(x) for x in result]
        except (json.JSONDecodeError, TypeError):
            pass
        # 按逗号分隔
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


# 创建全局配置实例
settings = Settings()
