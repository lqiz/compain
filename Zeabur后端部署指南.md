# 🚀 Zeabur 后端部署完整指南

## 📋 部署前准备清单

- [x] 创建 Dockerfile
- [x] 创建 .dockerignore
- [x] 创建 zeabur.toml 配置文件
- [ ] 注册 Zeabur 账号
- [ ] 推送代码到 Git 仓库
- [ ] 创建 Zeabur 项目并部署

---

## 🎯 快速部署步骤（5 分钟搞定）

### 步骤 1：注册 Zeabur 账号

1. 访问 https://zeabur.com
2. 点击「注册」
3. 使用手机号注册（国内手机号即可）
4. 完成邮箱验证

### 步骤 2：推送代码到 Git 仓库

**方式 A：使用 Gitee（推荐，速度快）**

```bash
# 1. 在 Gitee 创建新仓库
# 访问 https://gitee.com，创建新仓库

# 2. 添加远程仓库（替换为你的仓库地址）
git remote add origin https://gitee.com/你的用户名/你的仓库名.git

# 3. 推送代码
git push -u origin main
```

**方式 B：使用 GitHub**

```bash
# 1. 在 GitHub 创建新仓库
# 访问 https://github.com/new，创建新仓库

# 2. 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/你的仓库名.git

# 3. 推送代码
git push -u origin main
```

### 步骤 3：在 Zeabur 创建项目

1. 登录 Zeabur 控制台
2. 点击「新建项目」
3. 选择「从 Git 仓库创建」
4. 选择你刚创建的 Gitee/GitHub 仓库
5. 点击「导入」

### 步骤 4：创建后端服务

1. 在项目页面，点击「新建服务」
2. 选择「Dockerfile」服务类型
3. Zeabur 会自动检测到你的 `Dockerfile`
4. 点击「创建」

### 步骤 5：配置环境变量

在服务页面，点击「环境变量」，添加以下变量：

```env
COZE_BUCKET_ENDPOINT_URL=你的对象存储端点
COZE_BUCKET_NAME=你的存储桶名称
NODE_ENV=production
PORT=3000
```

**如何获取对象存储配置？**

查看你的 `.env.local` 文件，复制这两个值：
- `COZE_BUCKET_ENDPOINT_URL`
- `COZE_BUCKET_NAME`

### 步骤 6：部署

1. 点击「部署」按钮
2. 等待构建完成（大约 2-3 分钟）
3. 部署成功后，你会看到一个公开的域名

### 步骤 7：获取域名

部署完成后，Zeabur 会提供一个域名，例如：
```
https://your-app-name.zeabur.app
```

**复制这个域名！**

### 步骤 8：更新小程序配置

```bash
# 编辑 .env.local 文件
PROJECT_DOMAIN=https://your-app-name.zeabur.app
```

### 步骤 9：配置微信后台

1. 登录微信公众平台
2. 开发 → 开发管理 → 开发设置 → 服务器域名
3. 在「request合法域名」中添加：`https://your-app-name.zeabur.app`
4. 在「uploadFile合法域名」中添加：`https://your-app-name.zeabur.app`
5. 在「downloadFile合法域名」中添加：`https://your-app-name.zeabur.app`

---

## 🔍 验证部署

### 测试后端 API

在浏览器中访问：
```
https://your-app-name.zeabur.app/api/video/list
```

应该返回视频列表的 JSON 数据。

### 测试小程序

1. 重新编译小程序（`coze dev` 会自动检测配置变化）
2. 在微信开发者工具中测试上传视频
3. 应该可以成功上传和播放视频！

---

## 📊 监控和日志

### 查看日志

在 Zeabur 控制台：
1. 点击你的服务
2. 点击「日志」标签
3. 实时查看应用日志

### 查看资源使用

在 Zeabur 控制台：
1. 点击你的服务
2. 查看内存、CPU 使用情况
3. 查看流量统计

---

## 💰 费用说明

### Zeabur 免费额度

- **每月 $6 免费额度**
- 包括：
  - 512MB RAM
  - 0.5vCPU
  - 2GB 流量
  - 10GB 存储空间

### 小程序使用情况估算

对于你的小程序：
- ✅ 免费额度完全够用
- ✅ 不需要额外付费
- ✅ 可以支持数万次请求/月

---

## 🔧 常见问题

### Q1: 部署失败怎么办？

**A**: 查看部署日志，检查：
1. 依赖安装是否成功
2. 构建命令是否正确
3. 环境变量是否正确配置

### Q2: 域名访问慢怎么办？

**A**: Zeabur 自动配置了 CDN，国内访问速度很快。如果还是很慢：
1. 检查你的网络连接
2. 尝试刷新页面
3. 联系 Zeabur 客服

### Q3: 如何配置自定义域名？

**A**:
1. 在 Zeabur 控制台，点击服务 → 域名
2. 添加你的域名（例如：`api.yourdomain.com`）
3. 按照提示配置 DNS 解析
4. 等待 SSL 证书自动签发（几分钟）

### Q4: 如何更新代码？

**A**:
1. 修改本地代码
2. 提交到 Git 仓库
3. Zeabur 会自动检测到变化
4. 点击「重新部署」按钮
5. 等待部署完成

---

## 📞 获取帮助

- **Zeabur 文档**: https://zeabur.com/docs
- **Zeabur 社区**: https://community.zeabur.com
- **客服支持**: 控制台右下角有在线客服

---

## ✅ 部署成功检查清单

部署完成后，请检查以下项目：

- [ ] Zeabur 服务状态为「运行中」
- [ ] 可以访问后端 API：`https://your-app-name.zeabur.app/api/video/list`
- [ ] 小程序配置已更新：`.env.local` 中的 `PROJECT_DOMAIN`
- [ ] 微信后台域名白名单已配置
- [ ] 小程序可以成功上传视频
- [ ] 小程序可以成功播放视频

---

## 🎉 完成！

恭喜你！你的小程序后端已经部署到 Zeabur 上了！

现在你的小程序可以在手机上正常使用了！

---

## 📚 下一步

1. **测试小程序功能**
   - 上传视频
   - 播放视频
   - 点赞功能
   - 发布功能

2. **监控服务状态**
   - 定期查看 Zeabur 控制台
   - 监控资源使用情况
   - 查看应用日志

3. **持续优化**
   - 根据用户反馈优化功能
   - 监控性能指标
   - 优化用户体验

---

**需要帮助？** 如果在部署过程中遇到任何问题，可以随时问我！
