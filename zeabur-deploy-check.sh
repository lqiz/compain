#!/bin/bash

echo "🚀 Zeabur 后端部署准备脚本"
echo "================================"
echo ""

# 检查 Dockerfile
if [ -f "Dockerfile" ]; then
    echo "✅ Dockerfile 已存在"
else
    echo "❌ Dockerfile 不存在"
fi

# 检查 .dockerignore
if [ -f ".dockerignore" ]; then
    echo "✅ .dockerignore 已存在"
else
    echo "❌ .dockerignore 不存在"
fi

# 检查 zeabur.toml
if [ -f "zeabur.toml" ]; then
    echo "✅ zeabur.toml 已存在"
else
    echo "❌ zeabur.toml 不存在"
fi

# 检查 .env.local
if [ -f ".env.local" ]; then
    echo "✅ .env.local 已存在"
    
    echo ""
    echo "📋 环境变量配置："
    grep -E "COZE_BUCKET_|PROJECT_DOMAIN" .env.local | sed 's/^/  /'
else
    echo "❌ .env.local 不存在"
fi

# 检查 Git 状态
echo ""
echo "📦 Git 状态："
if [ -d ".git" ]; then
    echo "✅ Git 仓库已初始化"
    
    BRANCH=$(git branch --show-current)
    echo "  当前分支: $BRANCH"
    
    if git remote get-url origin &>/dev/null; then
        echo "  远程仓库: $(git remote get-url origin)"
    else
        echo "  ⚠️  远程仓库未配置"
        echo ""
        echo "  请执行以下命令添加远程仓库："
        echo "  git remote add origin <你的仓库地址>"
    fi
else
    echo "❌ Git 仓库未初始化"
    echo "  请执行以下命令初始化："
    echo "  git init"
    echo "  git add ."
    echo "  git commit -m 'Initial commit'"
fi

# 检查构建产物
echo ""
echo "🔨 检查构建产物："
if [ -d "server/dist" ]; then
    echo "✅ server/dist 目录存在"
    if [ -f "server/dist/main.js" ]; then
        echo "✅ main.js 文件存在"
    else
        echo "⚠️  main.js 文件不存在，需要构建"
        echo "  请执行: pnpm build:server"
    fi
else
    echo "⚠️  server/dist 目录不存在，需要构建"
    echo "  请执行: pnpm build:server"
fi

echo ""
echo "================================"
echo "📋 下一步操作："
echo ""
echo "1. 注册 Zeabur 账号: https://zeabur.com"
echo "2. 在 Gitee/GitHub 创建仓库"
echo "3. 添加远程仓库并推送代码:"
echo "   git remote add origin <你的仓库地址>"
echo "   git push -u origin main"
echo "4. 在 Zeabur 创建项目并导入仓库"
echo "5. 配置环境变量（参考 .env.local）"
echo "6. 部署服务"
echo ""
echo "详细步骤请查看: Zeabur后端部署指南.md"
echo ""
