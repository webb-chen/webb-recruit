# AI速聘前端 - 多阶段构建Dockerfile
# 阶段1：Node.js构建
FROM node:20-alpine AS builder

WORKDIR /app

# 先复制依赖文件以利用Docker缓存层
COPY package.json package-lock.json ./
RUN npm ci --registry https://registry.npmmirror.com

# 复制源代码并构建
COPY . .
RUN npm run build

# 阶段2：Nginx部署
FROM nginx:alpine

# 复制构建产物到Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制Nginx配置
RUN cat > /etc/nginx/conf.d/default.conf << 'NGINXEOF'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # 开启gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1024;

    # 静态资源缓存
    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API反向代理到后端
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }

    # SPA路由支持 - 所有非文件请求返回index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINXEOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
