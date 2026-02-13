import { Injectable, BadRequestException } from '@nestjs/common'
import { S3Storage } from 'coze-coding-dev-sdk'
import { eq, desc } from 'drizzle-orm'
import db, { videos, NewVideo } from '../db'

// 用户信息接口
interface User {
  nickname: string
  points: number
}

@Injectable()
export class VideoService {
  private storage: S3Storage

  // 内存存储：用户列表（暂时保留，后续也可以改为数据库）
  private users: User[] = [
    { nickname: '小红妹妹', points: 350 },
    { nickname: '小明同学', points: 280 },
    { nickname: '小刚哥哥', points: 220 },
    { nickname: '小丽姐姐', points: 180 },
    { nickname: '小强弟弟', points: 150 }
  ]

  constructor() {
    console.log('初始化 S3Storage...')
    console.log('COZE_BUCKET_ENDPOINT_URL:', process.env.COZE_BUCKET_ENDPOINT_URL)
    console.log('COZE_BUCKET_NAME:', process.env.COZE_BUCKET_NAME)

    // 检查环境变量是否配置
    if (!process.env.COZE_BUCKET_ENDPOINT_URL || !process.env.COZE_BUCKET_NAME) {
      console.warn('⚠️  对象存储环境变量未配置，将使用默认配置')
      console.warn('请在 .env.local 中配置 COZE_BUCKET_ENDPOINT_URL 和 COZE_BUCKET_NAME')
    }

    this.storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL || '',
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME || '',
      region: 'cn-beijing'
    })

    console.log('S3Storage 初始化完成')
  }

  /**
   * 初始化示例数据（懒加载）
   */
  private async ensureSampleData() {
    try {
      // 检查数据库中是否已有数据
      const existingVideos = await db.select().from(videos).limit(1)

      if (existingVideos.length === 0) {
        console.log('初始化示例数据...')
        // 插入示例数据
        const sampleVideos: NewVideo[] = [
          {
            id: '1',
            nickname: '小明同学',
            age: 10,
            content: '今天作业太多了，写了好久都没写完，感觉好累😢',
            videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
            videoKey: 'sample/sintel.mp4',
            likeCount: 128,
            createdAt: Date.now()
          },
          {
            id: '2',
            nickname: '小红妹妹',
            age: 9,
            content: '妈妈今天给我买了新的画画本，好开心！🎨',
            videoUrl: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
            videoKey: 'sample/bunny.mp4',
            likeCount: 256,
            createdAt: Date.now()
          },
          {
            id: '3',
            nickname: '小刚哥哥',
            age: 11,
            content: '今天在操场上踢足球，我们队赢了！⚽️',
            videoUrl: 'https://test-videos.co.uk/videos/matrix/matrix_480p.mov',
            videoKey: 'sample/matrix.mov',
            likeCount: 89,
            createdAt: Date.now()
          }
        ]

        await db.insert(videos).values(sampleVideos)
        console.log('示例数据初始化完成')
      }
    } catch (error) {
      console.error('初始化示例数据失败:', error)
    }
  }

  /**
   * 上传视频到对象存储并保存到数据库
   * @param fileBuffer 视频文件 buffer
   * @param originalName 原始文件名
   * @param mimetype 文件类型
   * @param nickname 用户昵称
   * @param age 用户年龄
   * @param title 视频标题
   * @returns 视频的访问 URL 和视频 ID
   */
  async uploadVideo(
    fileBuffer: Buffer,
    originalName: string,
    mimetype: string,
    nickname: string,
    age: number,
    title: string
  ): Promise<{ videoUrl: string; videoId: string }> {
    try {
      console.log('========== 开始上传视频 ==========')
      console.log('用户信息:', { nickname, age })
      console.log('视频标题:', title)
      console.log('文件信息:', {
        originalName,
        mimetype,
        size: fileBuffer.length
      })

      // 验证文件类型（只允许视频）
      if (!mimetype.startsWith('video/')) {
        console.error('文件类型错误:', mimetype)
        throw new BadRequestException('只支持上传视频文件')
      }

      // 验证文件大小（最大 100MB）
      const maxSize = 100 * 1024 * 1024
      if (fileBuffer.length > maxSize) {
        console.error('文件大小超限:', fileBuffer.length)
        throw new BadRequestException('视频文件大小不能超过 100MB')
      }

      // 生成文件名：videos/原始文件名
      const fileName = `videos/${Date.now()}_${originalName}`
      console.log('生成的文件名:', fileName)

      // 检查对象存储配置
      if (!process.env.COZE_BUCKET_ENDPOINT_URL || !process.env.COZE_BUCKET_NAME) {
        console.error('对象存储环境变量未配置')
        throw new BadRequestException('对象存储服务未配置，请联系管理员')
      }

      // 上传到对象存储
      console.log('开始上传视频到对象存储...')
      console.log('文件大小:', fileBuffer.length, 'bytes')
      console.log('文件类型:', mimetype)
      console.log('对象存储配置:', {
        endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
        bucketName: process.env.COZE_BUCKET_NAME
      })

      const fileKey = await this.storage.uploadFile({
        fileContent: fileBuffer,
        fileName: fileName,
        contentType: mimetype
      })

      console.log('✅ 视频上传成功，文件 key:', fileKey)

      // 生成签名 URL（有效期 7 天）
      console.log('生成视频访问 URL...')
      const videoUrl = await this.storage.generatePresignedUrl({
        key: fileKey,
        expireTime: 7 * 24 * 3600 // 7 天
      })

      console.log('✅ 生成视频访问 URL 成功:', videoUrl)

      // 创建新的视频记录
      const newVideo: NewVideo = {
        id: Date.now().toString(),
        nickname,
        age,
        content: title,
        videoUrl,
        videoKey: fileKey,
        likeCount: 0,
        createdAt: Date.now() // 使用时间戳
      }

      console.log('保存视频信息到数据库...')
      // 保存到数据库
      await db.insert(videos).values(newVideo)

      console.log('✅ 视频信息已保存到数据库, videoId:', newVideo.id)
      console.log('========== 视频上传完成 ==========')

      return {
        videoUrl,
        videoId: newVideo.id
      }
    } catch (error) {
      console.error('❌ 视频上传失败:', error)
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      throw new BadRequestException(error.message || '视频上传失败')
    }
  }

  /**
   * 获取所有视频列表（按创建时间倒序）
   * @returns 视频列表
   */
  async getAllVideos(): Promise<any[]> {
    // 确保示例数据存在
    await this.ensureSampleData()

    const videoList = await db.select().from(videos).orderBy(desc(videos.createdAt))
    console.log('获取视频列表, 视频数量:', videoList.length)
    return videoList
  }

  /**
   * 获取指定用户的视频列表
   * @param nickname 用户昵称
   * @returns 该用户的视频列表
   */
  async getUserVideos(nickname: string): Promise<any[]> {
    console.log('获取用户视频, nickname:', nickname)
    const userVideos = await db
      .select()
      .from(videos)
      .where(eq(videos.nickname, nickname))
      .orderBy(desc(videos.createdAt))
    console.log('用户视频数量:', userVideos.length)
    return userVideos
  }

  /**
   * 点赞视频
   * @param videoId 视频ID
   * @returns 点赞结果（新的点赞数）
   */
  async likeVideo(videoId: string): Promise<{ likeCount: number; isLiked: boolean }> {
    console.log('点赞视频, videoId:', videoId)

    // 查找视频
    const videoList = await db.select().from(videos).where(eq(videos.id, videoId))

    if (videoList.length === 0) {
      throw new BadRequestException('视频不存在')
    }

    const video = videoList[0]

    // 增加点赞数
    const newLikeCount = (video.likeCount || 0) + 1

    // 更新数据库
    await db
      .update(videos)
      .set({ likeCount: newLikeCount })
      .where(eq(videos.id, videoId))

    console.log('点赞成功, 新的点赞数:', newLikeCount)

    return {
      likeCount: newLikeCount,
      isLiked: true
    }
  }

  /**
   * 获取用户排名列表（按积分排序）
   * @returns 用户排名列表
   */
  async getRankings(): Promise<Array<{ rank: number; nickname: string; points: number }>> {
    console.log('获取用户排名')

    // 按积分排序
    const sortedUsers = [...this.users].sort((a, b) => b.points - a.points)

    // 添加排名
    const rankings = sortedUsers.map((user, index) => ({
      rank: index + 1,
      nickname: user.nickname,
      points: user.points
    }))

    return rankings
  }

  /**
   * 给用户增加积分
   * @param nickname 用户昵称
   * @param points 增加的积分
   */
  addUserPoints(nickname: string, points: number): void {
    const user = this.users.find(u => u.nickname === nickname)
    if (user) {
      user.points += points
      console.log(`用户 ${nickname} 积分增加 ${points}, 当前积分: ${user.points}`)
    }
  }

  /**
   * 获取用户积分
   * @param nickname 用户昵称
   * @returns 用户积分
   */
  getUserPoints(nickname: string): number {
    const user = this.users.find(u => u.nickname === nickname)
    return user?.points || 0
  }
}
