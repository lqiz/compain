#!/bin/bash

echo "☁️ 微信云托管部署脚本"
echo "====================="
echo ""

# 检查配置文件
if [ -f "cloudbaserc.json" ]; then
    echo "✅ cloudbaserc.json 已存在"
else
    echo "❌ cloudbaserc.json 不存在"
    exit 1
fi

if [ -f "tcb.json" ]; then
    echo "✅ tcb.json 已存在"
else
    echo "❌ tcb.json 不存在"
    exit 1
fi

if [ -f "Dockerfile.tcb" ]; then
    echo "✅ Dockerfile.tcb 已存在"
else
    echo "❌ Dockerfile.tcb 不存在"
    exit 1
fi

# 检查 .env.local
if [ -f ".env.local" ]; then
    echo "✅ .env.local 已存在"
    
    echo ""
    echo "📋 环境变量配置："
    grep -E "COZE_BUCKET_" .env.local | sed 's/^/  /'
else
    echo "❌ .env.local 不存在"
    exit 1
fi

# 检查构建产物
echo ""
echo "🔨 检查构建产物："
if [ -f "server/dist/main.js" ]; then
    echo "✅ server/dist/main.js 已存在"
else
    echo "⚠️  server/dist/main.js 不存在，正在构建..."
    pnpm build:server
    if [ $? -eq 0 ]; then
        echo "✅ 构建成功"
    else
        echo "❌ 构建失败"
        exit 1
    fi
fi

echo ""
echo "====================="
echo "✅ 检查完成，可以部署到微信云托管了！"
echo ""
echo "📋 下一步操作："
echo ""
echo "1. 登录微信公众平台"
echo "2. 开发 → 开发管理 → 云开发 → 开通"
echo "3. 云开发 → 云托管 → 新建"
echo "4. 选择「基础版」，创建环境"
echo "5. 复制环境ID，更新 cloudbaserc.json 和 tcb.json 中的 envId"
echo "6. 配置环境变量（从 .env.local 复制）"
echo "7. 上传代码（使用微信开发者工具或云开发 CLI）"
echo ""
echo "详细步骤请查看: 微信云托管部署指南.md"
echo ""
