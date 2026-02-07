#!/bin/bash

# AI Platform - 开发环境启动脚本

echo "🚀 启动 AI Platform 开发环境..."

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 启动 PostgreSQL
echo "📦 启动 PostgreSQL..."
docker run -d \
    --name ai-platform-postgres \
    -e POSTGRES_DB=ai_platform \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -p 5432:5432 \
    postgres:16-alpine 2>/dev/null || docker start ai-platform-postgres

# 等待 PostgreSQL 启动
echo "⏳ 等待数据库启动..."
sleep 3

# 启动 Redis
echo "📦 启动 Redis..."
docker run -d \
    --name ai-platform-redis \
    -p 6379:6379 \
    redis:7-alpine 2>/dev/null || docker start ai-platform-redis

echo ""
echo "✅ 数据库服务已启动"
echo ""
echo "📊 服务信息："
echo "  PostgreSQL: localhost:5432"
echo "  Redis: localhost:6379"
echo "  Database: ai_platform"
echo "  User: postgres"
echo "  Password: postgres"
echo ""
echo "接下来运行："
echo "  1. pnpm db:seed     # 植入种子数据"
echo "  2. pnpm start:dev   # 启动开发服务器"
echo ""
