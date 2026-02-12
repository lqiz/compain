import { Injectable, BadRequestException } from '@nestjs/common'
import { S3Storage } from 'coze-coding-dev-sdk'

// 视频信息接口
interface Video {
  id: string
  nickname: string
  age: number
  content: string
  videoUrl: string
  likeCount: number
  createdAt: Date
}

// 用户信息接口
interface User {
  nickname: string
  points: number
}

@Injectable()
export class VideoService {
  private storage: S3Storage

  // 内存存储：视频列表
  private videos: Video[] = [
    {
      id: '1',
      nickname: '小明同学',
      age: 10,
      content: '今天作业太多了，写了好久都没写完，感觉好累😢',
      videoUrl: 'https://via.placeholder.com/360x640/f97316/ffffff?text=Video+1',
      likeCount: 128,
      createdAt: new Date()
    },
    {
      id: '2',
      nickname: '小红妹妹',
      age: 9,
      content: '妈妈今天给我买了新的画画本，好开心！🎨',
      videoUrl: 'https://via.placeholder.com/360x640/f97316/ffffff?text=Video+2',
      likeCount: 256,
      createdAt: new Date()
    },
    {
      id: '3',
      nickname: '小刚哥哥',
      age: 11,
      content: '今天在操场上踢足球，我们队赢了！⚽️',
      videoUrl: 'https://via.placeholder.com/360x640/f97316/ffffff?text=Video+3',
      likeCount: 89,
      createdAt: new Date()
    }
  ]

  // 内存存储：用户列表
  private users: User[] = [
    { nickname: '小红妹妹', points: 350 },
    { nickname: '小明同学', points: 280 },
    { nickname: '小刚哥哥', points: 220 },
    { nickname: '小丽姐姐', points: 180 },
    { nickname: '小强弟弟', points: 150 }
  ]

  constructor() {
    this.storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing'
    })
  }

  /**
   * 上传视频到对象存储
   * @param fileBuffer 视频文件 buffer
   * @param originalName 原始文件名
   * @param mimetype 文件类型
   * @returns 视频的访问 URL
   */
  async uploadVideo(fileBuffer: Buffer, originalName: string, mimetype: string): Promise<string> {
    try {
      // 验证文件类型（只允许视频）
      if (!mimetype.startsWith('video/')) {
        throw new BadRequestException('只支持上传视频文件')
      }

      // 验证文件大小（最大 100MB）
      const maxSize = 100 * 1024 * 1024 // 100MB
      if (fileBuffer.length > maxSize) {
        throw new BadRequestException('视频文件大小不能超过 100MB')
      }

      // 生成文件名：videos/原始文件名
      const fileName = `videos/${Date.now()}_${originalName}`

      // 上传到对象存储
      console.log('开始上传视频到对象存储...')
      console.log('文件大小:', fileBuffer.length)
      console.log('文件类型:', mimetype)

      const fileKey = await this.storage.uploadFile({
        fileContent: fileBuffer,
        fileName: fileName,
        contentType: mimetype
      })

      console.log('视频上传成功，文件 key:', fileKey)

      // 生成签名 URL（有效期 7 天）
      const videoUrl = await this.storage.generatePresignedUrl({
        key: fileKey,
        expireTime: 7 * 24 * 3600 // 7 天
      })

      console.log('生成视频访问 URL 成功')

      return videoUrl
    } catch (error) {
      console.error('视频上传失败:', error)
      throw new BadRequestException(error.message || '视频上传失败')
    }
  }

  /**
   * 点赞视频
   * @param videoId 视频ID
   * @returns 点赞结果（新的点赞数）
   */
  async likeVideo(videoId: string): Promise<{ likeCount: number; isLiked: boolean }> {
    console.log('处理点赞, videoId:', videoId)

    // 查找视频
    const video = this.videos.find(v => v.id === videoId)

    if (!video) {
      throw new BadRequestException('视频不存在')
    }

    // 增加点赞数
    video.likeCount += 1

    console.log(`视频 ${videoId} 点赞数增加到: ${video.likeCount}`)

    // 被点赞的用户获得2积分
    const user = this.users.find(u => u.nickname === video.nickname)
    if (user) {
      user.points += 2
      console.log(`用户 ${user.nickname} 获得点赞奖励，当前积分: ${user.points}`)
    }

    return {
      likeCount: video.likeCount,
      isLiked: true
    }
  }

  /**
   * 获取用户排名
   * @returns 用户排名列表
   */
  async getRankings(): Promise<{ rank: number; nickname: string; points: number }[]> {
    console.log('获取用户排名')

    // 按积分从高到低排序
    const sortedUsers = this.users
      .map((user, index) => ({
        rank: index + 1,
        nickname: user.nickname,
        points: user.points
      }))
      .sort((a, b) => b.points - a.points)

    // 重新计算排名（积分相同时按出现顺序）
    sortedUsers.forEach((user, index) => {
      user.rank = index + 1
    })

    console.log('用户排名:', sortedUsers)

    return sortedUsers.slice(0, 10) // 返回前10名
  }
}
