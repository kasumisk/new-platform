#!/bin/bash

# 快速 Git 推送部署脚本
# 用于绕过 Vercel CLI 的 "Missing files" 问题

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  快速 Git 推送部署${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查是否有未提交的更改
if [[ -z $(git status -s) ]]; then
    echo -e "${YELLOW}没有检测到更改，无需部署${NC}"
    exit 0
fi

# 显示更改
echo -e "${GREEN}检测到以下更改:${NC}"
git status -s
echo ""

# 询问是否继续
read -p "是否继续部署? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "取消部署"
    exit 0
fi

# 提交更改
COMMIT_MSG="Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "${GREEN}提交更改...${NC}"
git add .
git commit -m "$COMMIT_MSG" || echo "可能已经提交过了"

# 推送到远程
echo -e "${GREEN}推送到远程仓库...${NC}"
BRANCH=$(git branch --show-current)
git push origin "$BRANCH"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ 推送成功！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Vercel 会自动开始部署${NC}"
echo -e "${BLUE}查看部署进度:${NC} https://vercel.com/dashboard"
echo ""
