# ✅ Zeabur 后端部署已准备完成！

## 📦 已创建的文件

1. **Dockerfile** - Docker 构建配置
2. **.dockerignore** - Docker 忽略文件
3. **zeabur.toml** - Zeabur 部署配置
4. **Zeabur后端部署指南.md** - 详细部署指南
5. **zeabur-deploy-check.sh** - 部署检查脚本

## 🚀 快速开始（3 步搞定）

### 步骤 1：推送代码到 Git 仓库

```bash
# 在 Gitee 创建仓库后执行
git remote add origin https://gitee.com/你的用户名/你的仓库名.git
git push -u origin main
```

### 步骤 2：在 Zeabur 部署

1. 访问 https://zeabur.com 注册账号
2. 创建新项目 → 选择 Git 仓库 → 选择你的仓库
3. 创建 Dockerfile 服务
4. 添加环境变量（从 .env.local 复制）
5. 点击部署

### 步骤 3：配置小程序

1. 获取 Zeabur 域名（例如：https://your-app.zeabur.app）
2. 更新 `.env.local`：
   ```env
   PROJECT_DOMAIN=https://your-app.zeabur.app
   ```
3. 配置微信后台域名白名单

---

## 📋 环境变量配置

在 Zeabur 控制台添加以下环境变量：

```env
COZE_BUCKET_ENDPOINT_URL=你的对象存储端点
COZE_BUCKET_NAME=你的存储桶名称
NODE_ENV=production
PORT=3000
```

**从 `.env.local` 复制这些值**

---

## 🔍 验证部署

部署完成后，在浏览器访问：
```
https://your-app.zeabur.app/api/video/list
```

应该返回视频列表 JSON 数据。

---

## 💰 费用说明

- ✅ **免费额度**: $6/月
- ✅ **小程序使用**: 免费额度完全够用
- ✅ **流量**: 2GB/月
- ✅ **存储**: 10GB

---

## 📚 详细文档

查看 **Zeabur后端部署指南.md** 获取完整的部署步骤和常见问题解答。

---

## 🎉 完成！

现在你可以：
1. 推送代码到 Git 仓库
2. 在 Zeabur 部署后端
3. 配置小程序使用新域名
4. 手机上就可以正常使用了！

**需要帮助？** 随时问我！
