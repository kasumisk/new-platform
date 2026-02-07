#!/bin/bash

# AI Platform - 停止开发环境

echo "🛑 停止 AI Platform 开发环境..."

# 停止容器
docker stop ai-platform-postgres ai-platform-redis 2>/dev/null

echo "✅ 服务已停止"
echo ""
echo "如需完全清理（删除数据）："
echo "  docker rm ai-platform-postgres ai-platform-redis"
echo "  docker volume prune"
