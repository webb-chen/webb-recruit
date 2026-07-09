FROM mcr.microsoft.com/playwright/python:v1.49.1-jammy

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TZ=Asia/Shanghai \
    HTTP_PROXY=http://192.168.31.137:7897 \
    HTTPS_PROXY=http://192.168.31.137:7897 \
    NO_PROXY=localhost,127.0.0.1,192.168.31.0/24

# 安装中文字体
RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-wqy-zenhei fonts-wqy-microhei \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 清除代理环境变量，运行时不需要
ENV HTTP_PROXY="" \
    HTTPS_PROXY="" \
    NO_PROXY=""

COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
