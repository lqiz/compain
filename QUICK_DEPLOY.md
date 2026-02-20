# 🚀 快速提交和部署指南

## 📋 当前状态

✅ 后端代码已整理完成
✅ 部署指南已创建（`ZEABUR_DEPLOYMENT_GUIDE.md`）
✅ README 已更新
✅ .env.example 已创建

---

## 🚀 立即提交代码

### 步骤 1：提交代码到 GitHub

```bash
# 进入项目目录
cd /path/to/complain-party

# 查看当前状态
git status

# 添加所有文件
git add .

# 提交代码
git commit -m "feat: 后端代码准备部署到 Zeabur

- 添加 Zeabur 部署指南
- 更新 README.md
- 创建 .env.example 模板
- 优化 Dockerfile 配置"

# 推送到 GitHub
git push origin main
```

---

## 🚀 立即部署到 Zeabur

### 步骤 2：在 Zeabur 部署

**方法 1：浏览器部署（推荐）**

1. 访问：https://zeabur.com
2. 使用 GitHub 登录
3. 点击 **「New Project」**
4. 选择仓库：`lqiz/compain`
5. 点击 **「Import」**
6. 创建服务 → 选择 **「Dockerfile」**
7. 配置环境变量：
   ```bash
   COZE_BUCKET_ENDPOINT_URL=https://s3.coze.cn
   COZE_BUCKET_NAME=your-bucket-name  # 替换为实际值
   ```
8. 点击 **「Deploy」**
9. 等待 2-3 分钟，直到状态显示 **「Running」**

**方法 2：CLI 部署**

```bash
# 安装 Zeabur CLI（如果还没有）
npm install -g @zeabur/cli

# 登录
zeabur login

# 部署
cd /path/to/complain-party
zeabur deploy
```

---

## 🔗 部署后配置

### 步骤 3：获取 Zeabur 域名

1. 在 Zeabur 项目页面，找到 `backend` 服务
2. 查看服务详情中的「Domains」部分
3. 复制生成的域名（格式：`https://backend.abc123.zeabur.app`）

### 步骤 4：更新前端环境变量

在微信开发者工具中：

1. 找到或创建 `.env` 文件
2. 添加以下内容：
   ```bash
   PROJECT_DOMAIN=https://compain.preview.aliyun-zeabur.cn
   ```
3. 保存并重新编译

### 步骤 5：配置微信小程序域名

1. 访问：https://mp.weixin.qq.com
2. 左侧菜单：**「开发」** → **「开发管理」** → **「开发设置」**
3. 找到 **「服务器域名」** 部分
4. 点击 **「修改」**
5. 添加以下域名：
   ```
   request合法域名: https://compain.preview.aliyun-zeabur.cn
   uploadFile合法域名: https://compain.preview.aliyun-zeabur.cn
   downloadFile合法域名: https://compain.preview.aliyun-zeabur.cn
   ```
6. 点击 **「保存并提交」**

---

## 🧪 测试部署

### 步骤 6：测试后端接口

在浏览器中访问：

```
https://backend.abc123.zeabur.app/api/health
```

预期返回：

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 步骤 7：真机测试

1. 在微信开发者工具中，点击 **「预览」**
2. 扫码在手机微信中打开
3. 测试视频上传功能

---

## 📊 部署状态检查

### 查看 Zeabur 服务状态

1. 访问 Zeabur 项目页面
2. 查看 `backend` 服务状态
3. 确认显示 **「Running」**

### 查看部署日志

1. 在 Zeabur 中点击 `backend` 服务
2. 点击 **「Logs」** 标签
3. 查看实时日志

---

## ⚠️ 常见问题

### 问题 1：部署失败

**解决**：
- 查看 Zeabur 部署日志
- 确认 Dockerfile 配置正确
- 检查 package.json 中的 scripts

### 问题 2：服务无法访问

**解决**：
- 确认端口设置为 3000
- 检查环境变量是否配置
- 等待 HTTPS 证书生成

### 问题 3：视频上传失败

**解决**：
- 在微信公众平台配置服务器域名
- 确认域名格式正确（https://...）
- 确认视频文件不超过 50MB

---

## 🎯 快速检查清单

部署前检查：

- [ ] 代码已推送到 GitHub
- [ ] COZE_BUCKET_NAME 已填写实际值
- [ ] Dockerfile 存在且配置正确
- [ ] package.json 中有 build:server 脚本

部署后检查：

- [ ] Zeabur 服务状态为「Running」
- [ ] 已获取 Zeabur 域名
- [ ] 前端 .env 已配置 PROJECT_DOMAIN
- [ ] 微信小程序服务器域名已配置
- [ ] 后端接口测试成功（/api/health）
- [ ] 真机测试视频上传成功

---

## 📞 需要帮助？

详细部署指南：[ZEABUR_DEPLOYMENT_GUIDE.md](./ZEABUR_DEPLOYMENT_GUIDE.md)

如果遇到问题，查看：
1. Zeabur 部署日志
2. [常见问题](ZEABUR_DEPLOYMENT_GUIDE.md#常见问题)
3. GitHub Issues

---

## 🚀 开始部署吧！

**总耗时：约 10 分钟**

1. ✅ 提交代码到 GitHub（2 分钟）
2. ✅ 在 Zeabur 部署（3 分钟）
3. ✅ 配置前端和微信（3 分钟）
4. ✅ 测试（2 分钟）

**祝部署顺利！有问题随时问我！** 🚀
