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

// 合成视频表 - 每场诉苦大会合成的视频
export const composedVideos = sqliteTable('composed_videos', {
  id: text('id').primaryKey(),
  sessionDate: text('session_date').notNull(),       // 场次日期 YYYY-MM-DD
  sessionHour: integer('session_hour').notNull(),     // 场次小时 0-23
  roundNumber: integer('round_number').notNull(),     // 本场第几次合成（一场可合成多个）
  videoIds: text('video_ids').notNull(),              // JSON: 选中的视频ID列表
  videoNicknames: text('video_nicknames').notNull(),  // JSON: 选中的作者昵称列表
  videoUrls: text('video_urls').notNull(),            // JSON: 选中的视频URL列表
  videoContents: text('video_contents').notNull(),    // JSON: 选中的视频描述列表
  llmEvaluation: text('llm_evaluation').notNull(),    // JSON: LLM 评估结果
  totalVideos: integer('total_videos').notNull(),     // 选中的视频总数
  status: text('status').notNull().default('completed'), // completed / failed
  createdAt: integer('created_at').notNull(),         // 时间戳
})

// 导出类型
export type Video = typeof videos.$inferSelect
export type NewVideo = typeof videos.$inferInsert
export type ComposedVideo = typeof composedVideos.$inferSelect
export type NewComposedVideo = typeof composedVideos.$inferInsert
