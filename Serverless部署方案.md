# 🚀 Serverless 部署方案

## ❌ Coze 没有 Serverless 部署能力

经过检查，**Coze 平台不支持 Serverless 部署**。

### Coze 的能力范围

| Coze 能做的 | Coze 不能做的 |
|------------|-------------|
| ✅ 项目初始化 | ❌ 提供公网域名 |
| ✅ 本地开发 | ❌ Serverless 部署 |
| ✅ 项目构建 | ❌ 持续部署 |
| ✅ 微信开发者工具预览 | ❌ 生产环境托管 |

---

## ✅ 第三方 Serverless 平台方案

### 方案一：Vercel（最流行，推荐）

#### 优点
- ✅ 免费额度足够小程序使用
- ✅ 自动 HTTPS
- ✅ 全球 CDN 加速
- ✅ 支持自定义域名
- ✅ Git 集成，自动部署

#### 缺点
- ❌ 主要支持前端，后端需要特殊配置
- ❌ 国内访问速度可能较慢

#### 部署步骤

**步骤 1：注册 Vercel**
```
访问 https://vercel.com 注册账号
```

**步骤 2：安装 Vercel CLI**
```bash
npm install -g vercel
```

**步骤 3：登录**
```bash
vercel login
```

**步骤 4：部署后端服务**

创建 `vercel.json` 配置文件：
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/dist/main.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/dist/main.js"
    }
  ]
}
```

**步骤 5：配置环境变量**
在 Vercel 控制台添加环境变量：
```
COZE_BUCKET_ENDPOINT_URL=你的对象存储端点
COZE_BUCKET_NAME=你的存储桶名称
```

**步骤 6：部署**
```bash
# 构建后端
pnpm build:server

# 部署
vercel --prod
```

**步骤 7：获取域名**
部署完成后，Vercel 会提供一个域名，例如：
```
https://your-app.vercel.app
```

**步骤 8：更新小程序配置**
```bash
# 编辑 .env.local
PROJECT_DOMAIN=https://your-app.vercel.app
```

**步骤 9：配置微信后台**
```
微信公众平台 → 开发 → 开发设置 → 服务器域名
添加：https://your-app.vercel.app
```

---

### 方案二：Railway（适合 Node.js 后端）

#### 优点
- ✅ 完美支持 Node.js
- ✅ 免费额度：$5/月
- ✅ 自动 HTTPS
- ✅ 支持数据库
- ✅ 配置简单

#### 缺点
- ❌ 主要是国外平台
- ❌ 国内访问可能较慢

#### 部署步骤

**步骤 1：注册 Railway**
```
访问 https://railway.app 注册账号
```

**步骤 2：安装 Railway CLI**
```bash
npm install -g @railway/cli
```

**步骤 3：登录**
```bash
railway login
```

**步骤 4：初始化项目**
```bash
cd /workspace/projects
railway init
```

**步骤 5：配置环境变量**
```bash
railway variables set COZE_BUCKET_ENDPOINT_URL=你的对象存储端点
railway variables set COZE_BUCKET_NAME=你的存储桶名称
```

**步骤 6：构建**
```bash
pnpm build:server
```

**步骤 7：部署**
```bash
railway up
```

**步骤 8：获取域名**
在 Railway 控制台查看生成的域名，例如：
```
https://your-app-production.up.railway.app
```

**步骤 9：更新小程序配置**
```bash
# 编辑 .env.local
PROJECT_DOMAIN=https://your-app-production.up.railway.app
```

**步骤 10：配置微信后台**
```
微信公众平台 → 开发 → 开发设置 → 服务器域名
添加：https://your-app-production.up.railway.app
```

---

### 方案三：Zeabur（国内 Serverless，推荐）

#### 优点
- ✅ 国内 Serverless 平台
- ✅ 速度快
- ✅ 免费：$6/月额度
- ✅ 支持 Docker
- ✅ 支持自定义域名

#### 缺点
- ❌ 需要手机号注册
- ❌ 相对较新

#### 部署步骤

**步骤 1：注册 Zeabur**
```
访问 https://zeabur.com 注册账号（需要手机号）
```

**步骤 2：创建新项目**
在 Zeabur 控制台创建新项目

**步骤 3：连接代码仓库**
- GitHub / Gitee / GitLab
- 选择你的项目

**步骤 4：创建服务**
```
创建 Prebuilt 服务
```

**步骤 5：配置构建命令**
```
构建命令：pnpm build:server
启动命令：node dist-server/main.js
```

**步骤 6：配置环境变量**
```
COZE_BUCKET_ENDPOINT_URL=你的对象存储端点
COZE_BUCKET_NAME=你的存储桶名称
```

**步骤 7：部署**
点击「部署」按钮

**步骤 8：获取域名**
部署完成后，Zeabur 会提供域名，例如：
```
https://your-app.zeabur.app
```

**步骤 9：配置自定义域名（可选）**
在 Zeabur 控制台添加你的域名

**步骤 10：配置微信后台**
```
微信公众平台 → 开发 → 开发设置 → 服务器域名
添加：https://your-app.zeabur.app
```

---

## 🎯 推荐方案对比

| 平台 | 推荐指数 | 速度 | 免费 | 配置难度 | 适用场景 |
|------|---------|------|------|----------|----------|
| **Zeabur** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $6/月 | ⭐⭐⭐ | 国内小程序（推荐） |
| **Railway** | ⭐⭐⭐⭐ | ⭐⭐⭐ | $5/月 | ⭐⭐⭐⭐⭐ | 国外用户 |
| **Vercel** | ⭐⭐⭐ | ⭐⭐ | ✅ 免费 | ⭐⭐⭐⭐ | 前端为主 |

---

## 💡 我的建议

### 国内小程序 → Zeabur（最推荐）

**原因**：
- 国内平台，速度快
- 免费 $6/月额度足够小程序使用
- 支持自定义域名
- 配置简单

### 国外用户 → Railway

**原因**：
- 完美支持 Node.js
- 免费 $5/月
- 配置最简单

---

## 📋 部署前准备清单

- [ ] 注册账号（Zeabur / Railway / Vercel）
- [ ] 准备代码（确保在 Git 仓库中）
- [ ] 配置对象存储（Coze S3Storage）
- [ ] 准备环境变量
- [ ] 配置微信后台域名白名单

---

## 🚀 快速开始（以 Zeabur 为例）

```bash
# 1. 注册 Zeabur 账号
访问 https://zeabur.com

# 2. 创建项目，连接 Git 仓库

# 3. 创建服务，配置：
构建命令：pnpm build:server
启动命令：node dist-server/main.js

# 4. 添加环境变量：
COZE_BUCKET_ENDPOINT_URL=你的对象存储端点
COZE_BUCKET_NAME=你的存储桶名称

# 5. 点击部署

# 6. 等待部署完成，获取域名

# 7. 更新 .env.local
PROJECT_DOMAIN=https://your-app.zeabur.app

# 8. 配置微信后台
添加域名到白名单
```

---

## 🤔 下一步

**你想用哪个平台？**

1. **Zeabur**（国内，推荐，速度快）
2. **Railway**（国外，配置简单）
3. **Vercel**（前端为主）

**告诉我你的选择，我可以提供详细的部署指导！**
