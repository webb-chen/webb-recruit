"""MinIO对象存储服务层 - 处理文件上传和下载"""

import io
from typing import Optional
from minio import Minio
from minio.error import S3Error
from app.config import settings


class MinioService:
    """MinIO文件存储服务"""

    def __init__(self):
        """初始化MinIO客户端"""
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE,
        )
        self.bucket_name = settings.MINIO_BUCKET_NAME
        self._ensure_bucket()

    def _ensure_bucket(self):
        """确保存储桶存在，不存在则创建"""
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
        except S3Error:
            pass

    def upload_bytes(
        self,
        data: bytes,
        object_name: str,
        content_type: str = "application/octet-stream",
    ) -> str:
        """上传字节数据到MinIO

        Args:
            data: 文件二进制数据
            object_name: 对象存储路径/名称
            content_type: 文件MIME类型

        Returns:
            文件访问URL
        """
        data_stream = io.BytesIO(data)
        data_length = len(data)

        self.client.put_object(
            self.bucket_name,
            object_name,
            data_stream,
            data_length,
            content_type=content_type,
        )

        # 返回访问URL
        protocol = "https" if settings.MINIO_SECURE else "http"
        url = f"{protocol}://{settings.MINIO_ENDPOINT}/{self.bucket_name}/{object_name}"
        return url

    def upload_file(
        self,
        file_path: str,
        object_name: str,
        content_type: Optional[str] = None,
    ) -> str:
        """上传本地文件到MinIO

        Args:
            file_path: 本地文件路径
            object_name: 对象存储路径/名称
            content_type: 文件MIME类型（可选，自动检测）

        Returns:
            文件访问URL
        """
        from minio.commonconfig import CopySource

        result = self.client.fput_object(
            self.bucket_name,
            object_name,
            file_path,
            content_type=content_type,
        )

        protocol = "https" if settings.MINIO_SECURE else "http"
        url = f"{protocol}://{settings.MINIO_ENDPOINT}/{self.bucket_name}/{object_name}"
        return url

    def download_file(self, object_name: str) -> Optional[bytes]:
        """从MinIO下载文件

        Args:
            object_name: 对象存储路径/名称

        Returns:
            文件二进制数据，文件不存在时返回None
        """
        try:
            response = self.client.get_object(self.bucket_name, object_name)
            data = response.read()
            response.close()
            response.release_conn()
            return data
        except S3Error:
            return None

    def delete_file(self, object_name: str) -> bool:
        """从MinIO删除文件

        Args:
            object_name: 对象存储路径/名称

        Returns:
            删除是否成功
        """
        try:
            self.client.remove_object(self.bucket_name, object_name)
            return True
        except S3Error:
            return False

    def get_presigned_url(self, object_name: str, expires_hours: int = 24) -> str:
        """获取文件的预签名下载URL

        Args:
            object_name: 对象存储路径/名称
            expires_hours: URL有效时长（小时）

        Returns:
            预签名URL字符串
        """
        from datetime import timedelta
        url = self.client.presigned_get_object(
            self.bucket_name,
            object_name,
            expires=timedelta(hours=expires_hours),
        )
        return url
