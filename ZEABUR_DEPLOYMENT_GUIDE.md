# 🚀 Zeabur 后端部署指南

## 📋 前提条件

✅ 前端代码已部署到微信小程序（Coze 已完成）
✅ 后端代码在 `server/` 目录下
✅ 已有 GitHub 账号
✅ 已有 Zeabur 账号

---

## 📂 后端代码结构

```
server/
├── src/                    # 源代码
│   ├── main.ts            # 入口文件
│   ├── app.module.ts      # 应用模块
│   ├── video/             # 视频上传接口
│   │   ├── video.controller.ts
│   │   ├── video.service.ts
│   │   └── video.module.ts
│   ├── db/                # 数据库
│   │   ├── index.ts
│   │   └── schema.ts
│   └── interceptors/      # 拦截器
└── package.json           # 后端依赖
```

---

## 🚀 部署步骤

### 步骤 1：提交代码到 GitHub

```bash
# 进入项目目录
cd /path/to/complain-party

# 确认所有文件已添加
git add .

# 提交代码
git commit -m "feat: 后端代码准备部署到 Zeabur"

# 推送到 GitHub
git push -u origin main
```

---

### 步骤 2：在 Zeabur 导入项目

1. 访问：https://zeabur.com
2. 使用 GitHub 登录
3. 点击 **「New Project」**
4. 选择你的 GitHub 仓库：`lqiz/compain`
5. 点击 **「Import」**

---

### 步骤 3：创建后端服务

1. 在项目页面，点击 **「Create Service」**
2. 选择 **「Dockerfile」**
3. Zeabur 会自动检测到你的 `Dockerfile`
4. 点击 **「Create」**

---

### 步骤 4：配置服务

**服务名称**：`backend`（默认）

**环境变量**：

点击 **「Add Environment Variable」**，添加以下变量：

```bash
# 变量 1：对象存储端点
变量名: COZE_BUCKET_ENDPOINT_URL
变量值: https://s3.coze.cn

# 变量 2：对象存储 Bucket 名称
变量名: COZE_BUCKET_NAME
变量值: your-bucket-name  ← 替换为你的实际 bucket 名称
```

**⚠️ 重要**：
- `COZE_BUCKET_NAME` 必须替换为你的实际 bucket 名称
- 不要配置 `PROJECT_DOMAIN` 环境变量（前端需要，后端不需要）

---

### 步骤 5：部署服务

1. 点击页面底部的 **「Deploy」** 按钮
2. 等待 2-3 分钟
3. **看到绿色的「Running」状态表示部署成功！**

---

## 🔗 获取访问地址

### 步骤 6：获取服务 URL

1. 在 Zeabur 项目页面，找到 `backend` 服务
2. 点击服务进入详情页
3. 找到 **「Domains」** 部分
4. 复制生成的 URL（格式：`https://backend.abc123.zeabur.app`）
5. **保存好这个地址！**

---

## ⚙️ 配置前端环境变量

### 步骤 7：更新前端环境变量

在微信开发者工具中：

1. 打开你的小程序项目
2. 找到 `.env` 文件（或者创建一个）
3. 添加以下内容：

```bash
# Zeabur 后端地址
PROJECT_DOMAIN=https://compain.preview.aliyun-zeabur.cn
```

4. 保存文件
5. 重新编译小程序（点击「编译」按钮）

---

## 🔗 配置服务器域名

### 步骤 8：在微信公众平台配置域名

1. 访问：https://mp.weixin.qq.com
2. 登录你的小程序账号
3. 左侧菜单：**「开发」** → **「开发管理」** → **「开发设置」**
4. 找到 **「服务器域名」** 部分
5. 点击 **「修改」**
6. 添加以下域名：

```
request合法域名: https://compain.preview.aliyun-zeabur.cn
uploadFile合法域名: https://compain.preview.aliyun-zeabur.cn
downloadFile合法域名: https://compain.preview.aliyun-zeabur.cn
```

7. 点击 **「保存并提交」**
8. 等待配置生效（5-10 分钟）

---

## 🧪 测试后端接口

### 步骤 9：测试接口

在浏览器中访问：

```
https://compain.preview.aliyun-zeabur.cn/api/health
```

**预期返回**：

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

如果看到这个响应，说明后端部署成功！🎉

**⚠️ 如果无法访问**：
1. 检查域名是否正确：`compain.preview.aliyun-zeabur.cn`
2. 检查是否需要加上 `https://`
3. 确认后端服务是否在运行中

---

## 📱 真机测试

### 步骤 10：真机测试

1. 在微信开发者工具中，点击 **「预览」**
2. 扫码在手机微信中打开
3. 测试视频上传功能
4. 查看上传是否成功

---

## 📊 监控和日志

### 查看服务日志

1. 在 Zeabur 项目页面，找到 `backend` 服务
2. 点击服务进入详情页
3. 点击 **「Logs」** 标签
4. 查看实时日志

### 查看服务状态

1. 在 Zeabur 项目页面，找到 `backend` 服务
2. 点击服务进入详情页
3. 查看 CPU、内存使用情况

---

## 🔄 自动部署

### 配置自动部署

Zeabur 会自动监控你的 GitHub 仓库：

1. **当你推送代码到 GitHub 时**：
   - Zeabur 自动检测到更新
   - 自动重新构建和部署
   - 无需手动操作

2. **查看部署状态**：
   - 在 Zeabur 项目页面查看部署日志
   - 实时监控部署进度

---

## ⚠️ 常见问题

### 问题 1：部署失败

**原因**：Dockerfile 配置错误

**解决**：
1. 检查 Zeabur 部署日志
2. 确认 Dockerfile 语法正确
3. 确认 package.json 中的 scripts 正确

### 问题 2：服务无法访问

**原因**：端口配置错误

**解决**：
1. 在 Zeabur 服务详情页，点击 **「Networking」**
2. 确认 **「Exposed Port」** 设置为 `3000`
3. 重新部署

### 问题 3：环境变量不生效

**原因**：变量名或值错误

**解决**：
1. 检查环境变量名称和值
2. 确认变量格式正确（没有多余空格）
3. 重新部署

### 问题 4：视频上传失败

**原因**：
1. 服务器域名未配置
2. HTTPS 证书问题
3. 文件太大

**解决**：
1. 在微信公众平台配置服务器域名
2. 确认域名格式正确（https://...）
3. 确认视频文件不超过 50MB

---

## 💡 费用说明

### Zeabur 免费额度

每月 $5 免费额度，通常包括：
- ✅ 744 小时运行时间
- ✅ 10GB 存储空间
- ✅ 500GB 带宽
- ✅ 无限次部署

### 估算你的使用成本

**一个小程序后端通常消耗**：
- 运行时间：约 200-300 小时/月（$1.5-$2.25）
- 存储：约 1-2GB（免费）
- 带宽：约 10-50GB（免费）

**结论：免费额度完全够用！** 🎉

---

## 🎯 快速总结

| 步骤 | 操作 | 时间 |
|------|------|------|
| 1 | 推送代码到 GitHub | 2分钟 |
| 2 | 在 Zeabur 导入项目 | 1分钟 |
| 3 | 创建后端服务 | 1分钟 |
| 4 | 配置环境变量 | 2分钟 |
| 5 | 部署服务 | 3分钟 |
| 6 | 获取服务 URL | 1分钟 |
| 7 | 更新前端环境变量 | 2分钟 |
| 8 | 配置服务器域名 | 3分钟 |
| 9 | 测试接口 | 1分钟 |
| 10 | 真机测试 | 3分钟 |
| **总计** | **全部完成** | **约20分钟** |

---

## 📞 需要帮助？

如果在部署过程中遇到问题：
1. 查看 Zeabur 部署日志
2. 查看本文的「常见问题」部分
3. 告诉我具体的错误信息

**祝你部署顺利！有问题随时问我！** 🚀
