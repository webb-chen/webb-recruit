#!/bin/bash
cd /opt/ai-supin
echo "Waiting for any existing builds to finish..."
while docker buildx ls 2>/dev/null | grep -i running >/dev/null 2>&1; do sleep 5; done
sleep 5

# Kill stale build processes
pkill -f "docker.*compose.*build" 2>/dev/null
sleep 3

echo "Starting build..."
docker compose build 2>&1
echo "BUILD_EXIT_CODE=$?"

echo "Starting containers..."
docker compose up -d 2>&1
echo "UP_EXIT_CODE=$?"

echo "Waiting for postgres..."
for i in $(seq 1 30); do
    if docker exec ai-supin-postgres pg_isready -U supin -d ai_supin >/dev/null 2>&1; then
        echo "Postgres ready after $i tries"
        break
    fi
    echo "Waiting for postgres... ($i/30)"
    sleep 3
done

echo "Waiting for backend..."
for i in $(seq 1 30); do
    if docker exec ai-supin-backend python -c "import requests; r=requests.get('http://localhost:8000/health'); print(r.json())" 2>/dev/null; then
        echo "Backend ready after $i tries"
        break
    fi
    echo "Waiting for backend... ($i/30)"
    sleep 3
done

echo "=== Creating admin ==="
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
        result = await session.execute(text(\"SELECT id FROM users WHERE username = 'admin'\"))
        existing = result.fetchone()
        if existing:
            print('Admin already exists, skipping')
        else:
            hashed_password = pwd_context.hash('admin123')
            await session.execute(
                text('INSERT INTO users (username, email, hashed_password, is_active, is_vip) VALUES (:username, :email, :password, :is_active, :is_vip)'),
                {'username': 'admin', 'email': 'admin@aisupin.com', 'password': hashed_password, 'is_active': True, 'is_vip': True}
            )
            await session.commit()
            print('Admin created: admin / admin123')
    await engine.dispose()

asyncio.run(main())
" 2>&1

echo ""
echo "=== Container Status ==="
docker compose ps

echo ""
echo "=== Health Check ==="
curl -s http://localhost:8000/health || echo "Backend not responding"

echo ""
echo "=== Frontend Check ==="
curl -s http://localhost:3000 | head -5

echo ""
echo "=== ALL DONE ==="
