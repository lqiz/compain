import { drizzle } from 'drizzle-orm/sql-js'
import initSqlJs, { Database, SqlJsStatic } from 'sql.js'
import * as schema from './schema'
import { videos } from './schema'
import * as fs from 'fs'
import * as path from 'path'

// 数据库实例
let db: ReturnType<typeof drizzle> | null = null
let sqlJsDb: Database | null = null
let dbInitialized = false

// 初始化数据库
const initDb = async () => {
  if (dbInitialized) {
    return db!
  }

  try {
    console.log('初始化 SQL.js 数据库...')

    // 加载 SQL.js
    const SQL = await initSqlJs({
      // 从 node_modules 加载 wasm 文件
      locateFile: (file) => {
        return path.join(__dirname, '../../node_modules/sql.js/dist', file)
      }
    })

    console.log('SQL.js 加载成功')

    // 数据库文件路径 - 使用相对路径的绝对化
    const projectRoot = path.join(__dirname, '../..')
    const dataDir = path.join(projectRoot, 'data')
    const dbPath = path.join(dataDir, 'videos.db')

    console.log('项目根目录:', projectRoot)
    console.log('数据目录:', dataDir)
    console.log('数据库路径:', dbPath)

    // 确保数据目录存在
    try {
      if (!fs.existsSync(dataDir)) {
        console.log('数据目录不存在，开始创建...')
        fs.mkdirSync(dataDir, { recursive: true })
        console.log('✅ 数据库目录创建成功:', dataDir)
      } else {
        console.log('数据目录已存在:', dataDir)
      }
    } catch (error) {
      console.error('❌ 创建数据目录失败:', error)
      throw new Error(`无法创建数据目录 ${dataDir}: ${error.message}`)
    }

    // 检查数据库文件是否存在
    if (fs.existsSync(dbPath)) {
      // 从文件加载数据库
      console.log('从文件加载数据库:', dbPath)
      const buffer = fs.readFileSync(dbPath)
      sqlJsDb = new SQL.Database(buffer)
      console.log('数据库加载成功')
    } else {
      // 创建新数据库
      console.log('创建新数据库')
      sqlJsDb = new SQL.Database()
      console.log('数据库创建成功')
    }

    // 创建表（如果不存在）
    sqlJsDb.run(`
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
    console.log('数据库表检查完成')

    // 创建 drizzle 实例
    db = drizzle(sqlJsDb, { schema })
    dbInitialized = true

    // 定期保存数据库到文件（每 5 秒）
    setInterval(() => {
      saveDbToFile()
    }, 5000)

    console.log('数据库初始化完成')
    return db
  } catch (error) {
    console.error('数据库初始化失败:', error)
    throw error
  }
}

// 保存数据库到文件
const saveDbToFile = () => {
  if (!sqlJsDb) return

  try {
    const dataDir = path.join(__dirname, '../../data')
    const dbPath = path.join(dataDir, 'videos.db')

    // 确保目录存在
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // 导出数据库为二进制数据
    const data = sqlJsDb.export()
    const buffer = Buffer.from(data)

    // 写入文件
    fs.writeFileSync(dbPath, buffer)
    console.log('数据库已保存到文件')
  } catch (error) {
    console.error('保存数据库失败:', error)
  }
}

// 获取数据库实例
export const getDb = async () => {
  if (!dbInitialized) {
    return await initDb()
  }
  return db!
}

// 保存数据库（手动触发）
export const saveDatabase = () => {
  saveDbToFile()
}

// 导出数据库实例和 schema
export default db
export { schema }
export { videos }
export type { Video, NewVideo } from './schema'
