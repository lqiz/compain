import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// 视频表
export const videos = sqliteTable('videos', {
  id: text('id').primaryKey(),
  nickname: text('nickname').notNull(),
  age: integer('age').notNull(),
  content: text('content').notNull(),
  videoUrl: text('video_url').notNull(), // 对象存储的访问URL
  videoKey: text('video_key').notNull(), // 对象存储的文件key
  likeCount: integer('like_count').notNull().default(0),
  createdAt: integer('created_at').notNull(), // 时间戳
})

// 导出类型
export type Video = typeof videos.$inferSelect
export type NewVideo = typeof videos.$inferInsert
