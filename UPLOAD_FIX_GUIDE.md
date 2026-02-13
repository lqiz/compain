# 视频上传失败修复指南

## 🔍 问题诊断

### 错误信息
```
Console:[上传失败: Error: 上传失败，状态码: 500
```

### 根本原因
后端数据库初始化失败：
```
数据库初始化失败: TypeError: better_sqlite3_2.default is not a constructor
    at getDb (/workspace/projects/server/src/db/index.ts:27:16)
```

这是 `better-sqlite3` 的 ES Module 导入问题，导致数据库无法初始化，进而导致视频上传接口返回 500 错误。

## ✅ 已完成的修复

### 1. 修复 better-sqlite3 导入问题

**文件**: `server/src/db/index.ts`

**问题**: ES Module 的 default 导入与 CommonJS 模块不兼容

**修复前**:
```typescript
import Database from 'better-sqlite3'
let sqlite: Database.Database
```

**修复后**:
```typescript
const Database = require('better-sqlite3')
let sqlite: any
```

**说明**:
- 使用 CommonJS 的 `require` 方式导入 `better-sqlite3`
- 将 `sqlite` 类型改为 `any`，避免 TypeScript 类型错误
- drizzle-orm 会处理类型，使用 `any` 不会影响功能

### 2. 添加详细的日志输出

**文件**: `server/src/video/video.service.ts`

**改进**:
- 在构造函数中输出对象存储配置信息
- 在 `uploadVideo` 方法中添加详细的分步日志
- 添加环境变量检查和警告
- 改进错误处理，输出完整的错误堆栈

**新增日志**:
```typescript
console.log('初始化 S3Storage...')
console.log('COZE_BUCKET_ENDPOINT_URL:', process.env.COZE_BUCKET_ENDPOINT_URL)
console.log('COZE_BUCKET_NAME:', process.env.COZE_BUCKET_NAME)
console.log('========== 开始上传视频 ==========')
console.log('✅ 视频上传成功，文件 key:', fileKey)
console.error('❌ 视频上传失败:', error)
```

### 3. 添加环境变量检查

**文件**: `server/src/video/video.service.ts`

**新增逻辑**:
```typescript
// 检查环境变量是否配置
if (!process.env.COZE_BUCKET_ENDPOINT_URL || !process.env.COZE_BUCKET_NAME) {
  console.warn('⚠️  对象存储环境变量未配置，将使用默认配置')
  console.warn('请在 .env.local 中配置 COZE_BUCKET_ENDPOINT_URL 和 COZE_BUCKET_NAME')
}

// 在上传视频时再次检查
if (!process.env.COZE_BUCKET_ENDPOINT_URL || !process.env.COZE_BUCKET_NAME) {
  console.error('对象存储环境变量未配置')
  throw new BadRequestException('对象存储服务未配置，请联系管理员')
}
```

## ⚠️ 剩余问题：对象存储配置

### 问题说明
项目使用 `coze-coding-dev-sdk` 的 S3Storage 进行视频文件存储，但需要配置以下环境变量：

```bash
COZE_BUCKET_ENDPOINT_URL=your-bucket-endpoint-url
COZE_BUCKET_NAME=your-bucket-name
```

### 解决方案

#### 方案 1: 配置对象存储（推荐）

1. **在 Coze 平台配置环境变量**
   - 登录 Coze 平台
   - 进入项目设置
   - 添加环境变量：
     - `COZE_BUCKET_ENDPOINT_URL`: 你的对象存储端点 URL
     - `COZE_BUCKET_NAME`: 你的存储桶名称

2. **在本地开发环境配置**
   - 编辑 `.env.local` 文件：
     ```bash
     PROJECT_DOMAIN=http://localhost:3000
     COZE_BUCKET_ENDPOINT_URL=https://your-bucket-endpoint-url
     COZE_BUCKET_NAME=your-bucket-name
     ```

#### 方案 2: 使用本地存储（临时方案）

如果暂时没有对象存储，可以使用本地文件存储作为临时方案：

1. **创建本地存储目录**:
   ```bash
   mkdir -p /workspace/projects/server/uploads/videos
   ```

2. **修改 video.service.ts**:
   ```typescript
   import * as fs from 'fs'
   import * as path from 'path'

   async uploadVideo(...): Promise<{ videoUrl: string; videoId: string }> {
     try {
       // 本地存储路径
       const uploadDir = path.join(__dirname, '../../uploads/videos')
       if (!fs.existsSync(uploadDir)) {
         fs.mkdirSync(uploadDir, { recursive: true })
       }

       const fileName = `${Date.now()}_${originalName}`
       const filePath = path.join(uploadDir, fileName)

       // 保存到本地
       fs.writeFileSync(filePath, fileBuffer)

       // 使用本地 URL
       const videoUrl = `http://localhost:3000/uploads/videos/${fileName}`
       const fileKey = `videos/${fileName}`

       // ... 其余逻辑不变
     }
   }
   ```

3. **配置静态文件服务**:
   ```typescript
   // server/src/main.ts
   import * as express from 'express'
   const app = await NestFactory.create(AppModule)

   // 配置静态文件服务
   app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

   await app.listen(3000)
   ```

#### 方案 3: 使用公共测试视频（临时方案）

在上传功能不可用时，可以临时使用公共测试视频：

```typescript
async uploadVideo(...): Promise<{ videoUrl: string; videoId: string }> {
  try {
    // 使用公共测试视频 URL
    const videoUrl = 'https://media.w3.org/2010/05/sintel/trailer.mp4'
    const fileKey = 'sample/test.mp4'

    // ... 其余逻辑不变
  }
}
```

## 📋 测试步骤

### 1. 重新构建后端服务
```bash
cd /workspace/projects
pnpm build:server
```

### 2. 重启开发服务
```bash
coze dev
```

### 3. 检查后端日志
查看控制台输出，确认：
```
✅ 数据库连接成功
✅ 数据库表创建成功
✅ S3Storage 初始化完成
```

如果看到以下警告，说明对象存储未配置：
```
⚠️  对象存储环境变量未配置，将使用默认配置
```

### 4. 测试视频上传
1. 访问 `http://localhost:5000`
2. 点击发布按钮
3. 选择视频文件
4. 点击"发布心里话"
5. 查看控制台日志，确认上传流程

### 5. 验证数据库
检查 `server/data/videos.db` 是否创建了视频记录。

## 📊 预期日志输出

### 成功场景
```
初始化 S3Storage...
COZE_BUCKET_ENDPOINT_URL: https://your-bucket-endpoint-url
COZE_BUCKET_NAME: your-bucket-name
S3Storage 初始化完成

========== 开始上传视频 ==========
用户信息: { nickname: '测试用户', age: 10 }
视频标题: '这是测试视频'
文件信息: {
  originalName: 'test.mp4',
  mimetype: 'video/mp4',
  size: 1024000
}
生成的文件名: videos/1234567890_test.mp4
开始上传视频到对象存储...
✅ 视频上传成功，文件 key: videos/1234567890_test.mp4
生成视频访问 URL...
✅ 生成视频访问 URL 成功: https://...
保存视频信息到数据库...
✅ 视频信息已保存到数据库, videoId: 1234567890
========== 视频上传完成 ==========
```

### 失败场景（对象存储未配置）
```
初始化 S3Storage...
COZE_BUCKET_ENDPOINT_URL: undefined
COZE_BUCKET_NAME: undefined
⚠️  对象存储环境变量未配置，将使用默认配置
S3Storage 初始化完成

========== 开始上传视频 ==========
...
开始上传视频到对象存储...
❌ 视频上传失败: Error: 对象存储环境变量未配置
对象存储环境变量未配置
请联系管理员
```

## 🎯 下一步建议

1. **配置对象存储**（推荐）
   - 联系 Coze 平台管理员获取对象存储配置
   - 在 `.env.local` 中添加环境变量
   - 测试对象存储连接

2. **实现本地存储降级**
   - 实现方案 2 或方案 3
   - 确保在对象存储不可用时也能正常工作

3. **优化错误提示**
   - 在前端显示更友好的错误提示
   - 引导用户联系管理员或重试

4. **添加重试机制**
   - 在上传失败时提供重试选项
   - 限制重试次数，避免无限循环

## 📝 总结

### 已修复
- ✅ 数据库初始化问题（better-sqlite3 导入）
- ✅ 添加详细日志输出
- ✅ 添加环境变量检查和警告
- ✅ 改进错误处理

### 待解决
- ⚠️ 对象存储环境变量配置
- ⚠️ 本地存储降级方案（可选）

### 构建状态
- ✅ TypeScript 编译：成功
- ✅ 后端构建：成功
- ✅ 数据库初始化：成功

修复完成后，数据库可以正常工作，但视频上传功能需要配置对象存储服务才能完全正常工作。
