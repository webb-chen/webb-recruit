#!/bin/bash
# ============================================================
# AI速聘系统一键部署脚本
# 用途: 自动检查环境、构建镜像、启动容器、初始化数据
# 使用: bash scripts/deploy.sh
# ============================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 无颜色

# 项目目录
PROJECT_DIR="/opt/ai-supin"
SERVER_IP="192.168.31.248"

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}         AI速聘招聘自动化系统 - 一键部署脚本              ${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

# -------------------------------------------
# 步骤1: 检查Docker是否安装
# -------------------------------------------
echo -e "${YELLOW}[步骤1/8] 检查Docker环境...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker未安装！请先安装Docker。${NC}"
    echo "安装命令参考: curl -fsSL https://get.docker.com | sh"
    exit 1
fi
echo -e "${GREEN}  Docker版本: $(docker --version)${NC}"

# 检查Docker Compose是否可用
if ! docker compose version &> /dev/null; then
    echo -e "${RED}错误: Docker Compose不可用！请确保Docker版本支持compose命令。${NC}"
    exit 1
fi
echo -e "${GREEN}  Docker Compose版本: $(docker compose version --short)${NC}"
echo ""

# -------------------------------------------
# 步骤2: 切换到项目目录
# -------------------------------------------
echo -e "${YELLOW}[步骤2/8] 进入项目目录...${NC}"
cd "$PROJECT_DIR"
echo -e "${GREEN}  当前目录: $(pwd)${NC}"
echo ""

# -------------------------------------------
# 步骤3: 复制环境变量文件（如果不存在）
# -------------------------------------------
echo -e "${YELLOW}[步骤3/8] 准备环境变量配置...${NC}"
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}  已从 .env.example 创建 .env 文件${NC}"
    else
        echo -e "${YELLOW}  警告: .env.example 不存在，跳过${NC}"
    fi
else
    echo -e "${GREEN}  .env 文件已存在，跳过${NC}"
fi
echo ""

# -------------------------------------------
# 步骤4: 构建Docker镜像
# -------------------------------------------
echo -e "${YELLOW}[步骤4/8] 构建Docker镜像...${NC}"
docker compose build
echo -e "${GREEN}  镜像构建完成${NC}"
echo ""

# -------------------------------------------
# 步骤5: 启动所有容器
# -------------------------------------------
echo -e "${YELLOW}[步骤5/8] 启动Docker容器...${NC}"
docker compose up -d
echo -e "${GREEN}  容器启动命令已执行${NC}"
echo ""

# -------------------------------------------
# 步骤6: 等待数据库健康检查通过
# -------------------------------------------
echo -e "${YELLOW}[步骤6/8] 等待数据库就绪...${NC}"
MAX_RETRIES=30
RETRY_COUNT=0

until docker compose exec -T postgres pg_isready -U supin -d ai_supin &> /dev/null; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo -e "${RED}错误: 数据库启动超时！请检查postgres容器日志:${NC}"
        docker compose logs postgres --tail 20
        exit 1
    fi
    echo -e "  等待数据库就绪... (${RETRY_COUNT}/${MAX_RETRIES})"
    sleep 2
done
echo -e "${GREEN}  PostgreSQL数据库已就绪${NC}"
echo ""

# 等待Redis就绪
echo -e "${YELLOW}  等待Redis就绪...${NC}"
RETRY_COUNT=0
until docker compose exec -T redis redis-cli ping &> /dev/null; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo -e "${RED}错误: Redis启动超时！${NC}"
        docker compose logs redis --tail 20
        exit 1
    fi
    sleep 2
done
echo -e "${GREEN}  Redis已就绪${NC}"
echo ""

# -------------------------------------------
# 步骤7: 初始化数据库表
# -------------------------------------------
echo -e "${YELLOW}[步骤7/8] 初始化数据库...${NC}"

# 等待backend容器启动
echo "  等待后端服务启动..."
sleep 10

# 初始化数据库表（通过应用启动时自动init_db已执行，这里再确保一次）
docker exec ai-supin-backend python -c "
import asyncio
from app.database import init_db

async def main():
    try:
        await init_db()
        print('数据库表初始化成功')
    except Exception as e:
        print(f'数据库表初始化失败: {e}')
        raise

asyncio.run(main())
" 2>&1 || echo -e "${YELLOW}  注意: 如果表已存在则忽略上述警告${NC}"

echo ""

# 创建初始管理员账号
echo -e "${YELLOW}  创建初始管理员账号...${NC}"
docker exec ai-supin-backend python -c "
import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

async def main():
    engine = create_async_engine('postgresql+asyncpg://supin:supin123@postgres:5432/ai_supin')
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # 检查管理员是否已存在
        result = await session.execute(text(\"SELECT id FROM users WHERE username = 'admin'\"))
        existing = result.fetchone()
        if existing:
            print('管理员账号已存在，跳过创建')
        else:
            hashed_password = pwd_context.hash('admin123')
            await session.execute(
                text('INSERT INTO users (username, email, hashed_password, is_active, is_vip) VALUES (:username, :email, :password, :is_active, :is_vip)'),
                {'username': 'admin', 'email': 'admin@aisupin.com', 'password': hashed_password, 'is_active': True, 'is_vip': True}
            )
            await session.commit()
            print('初始管理员账号创建成功！')
            print('  用户名: admin')
            print('  密码: admin123')
    await engine.dispose()

asyncio.run(main())
" 2>&1

echo ""

# -------------------------------------------
# 步骤8: 打印访问信息
# -------------------------------------------
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}               部署完成！系统已成功启动                       ${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo -e "  前端页面:     ${BLUE}http://${SERVER_IP}:3000${NC}"
echo -e "  API文档:      ${BLUE}http://${SERVER_IP}:8000/docs${NC}"
echo -e "  MinIO控制台:  ${BLUE}http://${SERVER_IP}:9001${NC}"
echo -e "    (MinIO用户名: minioadmin / 密码: minioadmin123)"
echo ""
echo -e "  管理员账号:   用户名: ${BLUE}admin${NC} / 密码: ${BLUE}admin123${NC}"
echo ""
echo -e "${YELLOW}常用命令:${NC}"
echo "  查看容器状态: docker compose ps"
echo "  查看日志:     docker compose logs -f [服务名]"
echo "  停止服务:     docker compose down"
echo "  重启服务:     docker compose restart [服务名]"
echo ""
