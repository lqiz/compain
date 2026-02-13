import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'
import { videos } from './schema'

// 创建数据库连接
let sqlite: Database.Database
let dbInitialized = false

const getDb = () => {
  if (!dbInitialized) {
    try {
      // 确保目录存在
      const fs = require('fs')
      const path = require('path')
      const dataDir = path.join(__dirname, '../../data')

      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
        console.log('创建数据库目录:', dataDir)
      }

      // 创建数据库文件
      const dbPath = path.join(dataDir, 'videos.db')
      console.log('数据库路径:', dbPath)

      sqlite = new Database(dbPath)
      console.log('数据库连接成功')

      // 启用外键约束
      sqlite.pragma('foreign_keys = ON')

      // 创建表（如果不存在）
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS videos (
          id TEXT PRIMARY KEY,
          nickname TEXT NOT NULL,
          age INTEGER NOT NULL,
          content TEXT NOT NULL,
          video_url TEXT NOT NULL,
          video_key TEXT NOT NULL,
          like_count INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL
        )
      `)
      console.log('数据库表创建成功')

      dbInitialized = true
    } catch (error) {
      console.error('数据库初始化失败:', error)
      throw error
    }
  }

  return sqlite
}

// 创建 drizzle 实例
export const db = drizzle(getDb(), { schema })

// 导出数据库实例和 schema
export default db
export { schema }
export { videos }
export type { Video, NewVideo } from './schema'
