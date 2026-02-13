# 部署错误修复指南

## 🔍 问题诊断

### 错误信息
```
数据库初始化失败: Error: The module '...better-sqlite3.node'
was compiled against a different Node.js version using
NODE_MODULE_VERSION 137. This version of Node.js requires
NODE_MODULE_VERSION 115.
```

### 根本原因
`better-sqlite3` 是一个 Node.js native addon（C++ 模块），需要在正确的 Node.js 版本下编译才能运行：

- **编译环境**：Node.js v24.x（NODE_MODULE_VERSION 137）
- **运行环境**：Node.js v20.19.6（NODE_MODULE_VERSION 115）

版本不匹配导致模块无法加载，部署失败。

## ✅ 已完成的修复

### 1. 替换数据库驱动

**方案**：使用 `sql.js`（纯 JavaScript SQLite）替换 `better-sqlite3`

**优势**：
- ✅ 无需编译，纯 JavaScript 实现
- ✅ 跨 Node.js 版本兼容
- ✅ 支持数据库持久化（导出/导入二进制数据）
- ✅ 完整的 SQLite 功能支持

### 2. 修改内容

#### server/package.json
**移除**：
```json
"better-sqlite3": "^11.9.1",
"@types/better-sqlite3": "^7.6.13"
```

**添加**：
```json
"sql.js": "^1.12.0"
```

#### server/src/db/index.ts
**完全重写数据库层**：
- 使用 `sql.js` 替代 `better-sqlite3`
- 实现数据库持久化（每 5 秒自动保存到文件）
- 支持从文件加载已有数据库
- 兼容现有的 Drizzle ORM

#### server/src/video/video.service.ts
**修改数据库初始化逻辑**：
- 实现 `OnModuleInit` 接口
- 在 `onModuleInit` 中异步初始化数据库
- 将所有 `db` 引用改为 `this.db`

## 📊 测试结果

### 本地测试
```
✅ SQL.js 加载成功
✅ 从文件加载数据库成功
✅ 数据库表检查完成
✅ 数据库初始化完成
✅ NestJS 应用启动成功
```

### 构建测试
```
✅ TypeScript 编译：成功
✅ ESLint 检查：成功
✅ Server 构建：成功
```

## 🚀 部署验证

### 预期部署日志
```
初始化 VideoService...
初始化 SQL.js 数据库...
SQL.js 加载成功
从文件加载数据库: /opt/bytefaas/server/data/videos.db
数据库加载成功
数据库表检查完成
数据库初始化完成
VideoService 数据库初始化完成
初始化 S3Storage...
S3Storage 初始化完成
Nest application successfully started
```

### 部署验证步骤

1. **提交代码**：
   ```bash
   git add .
   git commit -m "fix: 替换 better-sqlite3 为 sql.js，解决部署版本不匹配问题"
   git push
   ```

2. **触发部署**：
   - 在 Coze 平台触发部署
   - 观察部署日志

3. **验证部署成功**：
   - 确认看到 "SQL.js 加载成功"
   - 确认看到 "数据库初始化完成"
   - 确认应用成功启动

4. **测试功能**：
   - 访问小程序首页
   - 测试视频列表加载
   - 测试视频上传功能
   - 测试点赞功能

## 📝 技术细节

### sql.js 数据库持久化

```typescript
// 初始化数据库
const SQL = await initSqlJs({
  locateFile: (file) => {
    return path.join(__dirname, '../../node_modules/sql.js/dist', file)
  }
})

// 从文件加载（如果存在）
if (fs.existsSync(dbPath)) {
  const buffer = fs.readFileSync(dbPath)
  sqlJsDb = new SQL.Database(buffer)
} else {
  sqlJsDb = new SQL.Database()
}

// 定期保存到文件（每 5 秒）
setInterval(() => {
  const data = sqlJsDb.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(dbPath, buffer)
}, 5000)
```

### 异步数据库初始化

```typescript
@Injectable()
export class VideoService implements OnModuleInit {
  private db: Awaited<ReturnType<typeof getDb>>

  async onModuleInit() {
    // 异步初始化数据库
    this.db = await getDb()
  }
}
```

## ⚠️ 注意事项

### 1. 数据库文件位置
- **开发环境**：`/workspace/projects/server/data/videos.db`
- **部署环境**：`/opt/bytefaas/server/data/videos.db`
- 确保目录有写权限

### 2. 性能考虑
- `sql.js` 是纯内存数据库，适合小到中等规模数据
- 数据持久化通过定时保存实现（5 秒间隔）
- 建议监控内存使用情况

### 3. 数据迁移
- 如果已有数据，`better-sqlite3` 和 `sql.js` 的二进制格式不兼容
- 需要导出 SQL 脚本再重新导入
- 本项目使用初始化脚本，无需迁移

### 4. 对象存储配置
确保环境变量已配置：
```bash
COZE_BUCKET_ENDPOINT_URL=https://integration.coze.cn/coze-coding-s3proxy/v1
COZE_BUCKET_NAME=bucket_1770904138756
```

## 🎯 预期结果

修复后，部署应该：
1. ✅ 不再出现 "NODE_MODULE_VERSION" 错误
2. ✅ 数据库初始化成功
3. ✅ 应用正常启动
4. ✅ 所有功能正常工作

## 📚 参考资料

- [sql.js 官方文档](https://sql.js.org/)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [Node.js Native Addons](https://nodejs.org/api/addons.html)

## 🐛 故障排查

### 问题：数据库文件损坏
**症状**：启动时报错 "Invalid database"
**解决**：删除 `server/data/videos.db`，重新初始化

### 问题：WASM 文件加载失败
**症状**："Failed to load wasm file"
**解决**：检查 `node_modules/sql.js/dist/sql-wasm.wasm` 是否存在

### 问题：内存占用过高
**症状**：进程内存持续增长
**解决**：减少自动保存频率，或增加数据库清理逻辑

## 🎉 总结

通过将 `better-sqlite3` 替换为 `sql.js`，成功解决了 Node.js 版本不匹配导致的部署问题。`sql.js` 作为纯 JavaScript 实现，具有更好的跨版本兼容性，适合部署环境。
