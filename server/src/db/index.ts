import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'
import { videos } from './schema'

// 创建数据库连接
const sqlite = new Database('./data/videos.db')

// 启用外键约束
sqlite.pragma('foreign_keys = ON')

// 创建 drizzle 实例
export const db = drizzle(sqlite, { schema })

// 导出数据库实例和 schema
export default db
export { schema }
export { videos }
export type { Video, NewVideo } from './schema'
