#!/bin/bash

# Vercel 项目设置脚本
# 用于初始化 .vercel-web 和 .vercel-admin 配置

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  Vercel 项目配置初始化${NC}"
echo -e "${GREEN}======================================${NC}"

cd "$ROOT_DIR"

# 设置 Web 项目
echo -e "${BLUE}设置 Web 项目...${NC}"
if [ -d ".vercel" ]; then
    rm -rf ".vercel"
fi

echo -e "${YELLOW}请选择 Web 项目 (new-platform)${NC}"
vercel link

if [ -d ".vercel" ]; then
    rm -rf ".vercel-web"
    mv ".vercel" ".vercel-web"
    echo -e "${GREEN}✓ Web 项目配置已保存到 .vercel-web/${NC}"
else
    echo -e "${RED}✗ Web 项目配置失败${NC}"
    exit 1
fi

# 设置 Admin 项目
echo -e "${BLUE}设置 Admin 项目...${NC}"
echo -e "${YELLOW}请选择 Admin 项目 (new-platform-admin)${NC}"
vercel link

if [ -d ".vercel" ]; then
    rm -rf ".vercel-admin"
    mv ".vercel" ".vercel-admin"
    echo -e "${GREEN}✓ Admin 项目配置已保存到 .vercel-admin/${NC}"
else
    echo -e "${RED}✗ Admin 项目配置失败${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  配置完成!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo "现在你可以使用以下命令部署:"
echo "  pnpm deploy:web          - 部署 Web 项目"
echo "  pnpm deploy:admin        - 部署 Admin 项目"
echo "  pnpm deploy:all          - 部署所有项目"
echo ""
