import { Controller, Post, Get, UseInterceptors, UploadedFile, Body, BadRequestException, Query } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { VideoService } from './video.service'
import { CompositionService } from './composition.service'
import { LLMClient, Config } from 'coze-coding-dev-sdk'

// 定义视频数据接口，避免与 Taro 的 Video 组件冲突
interface VideoItem {
  id: string
  nickname: string
  age: number
  content: string
  videoUrl: string
  likeCount: number
  createdAt: Date
}

@Controller('video')
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    private readonly compositionService: CompositionService
  ) {}

  /**
   * 上传视频接口
   * POST /api/video/upload
   *
   * 请求方式：multipart/form-data
   * 参数：
   * - video: 视频文件（必须）
   * - title: 视频标题（可选）
   * - description: 视频描述（可选）
   * - startTime: 剪辑开始时间（秒，可选）
   * - endTime: 剪辑结束时间（秒，可选）
   * - hasEdited: 是否剪辑（可选，true/false）
   *
   * 返回：
   * {
   *   code: 200,
   *   msg: 'success',
   *   data: {
   *     videoUrl: 'https://...',
   *     title: '视频标题',
   *     description: '视频描述',
   *     startTime: 0,
   *     endTime: 30,
   *     hasEdited: true
   *   }
   * }
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: memoryStorage(), // 使用内存存储，避免写入本地磁盘
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB - 与Service层保持一致
      }
    })
  )
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      title?: string
      description?: string
      startTime?: string
      endTime?: string
      hasEdited?: string
      nickname?: string
      age?: string
    }
  ) {
    console.log('========== 收到视频上传请求 ==========')
    console.log('文件信息:', {
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
      sizeMB: file?.size ? (file.size / 1024 / 1024).toFixed(2) + 'MB' : 'N/A'
    })
    console.log('请求参数:', {
      title: body?.title,
      nickname: body?.nickname,
      age: body?.age,
      startTime: body?.startTime,
      endTime: body?.endTime,
      hasEdited: body?.hasEdited
    })

    // 验证文件是否存在
    if (!file) {
      console.error('❌ 文件不存在')
      throw new BadRequestException('请选择要上传的视频文件')
    }

    // 验证文件大小（100MB）
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2)
      console.error(`❌ 文件大小超限: ${sizeMB}MB`)
      throw new BadRequestException(`视频文件大小不能超过 100MB，当前文件大小为 ${sizeMB}MB`)
    }

    console.log('文件大小检查通过:', file?.size ? (file.size / 1024 / 1024).toFixed(2) + 'MB' : 'N/A')

    // 验证文件类型（基于文件扩展名，兼容真机上传）
    const fileName = file.originalname.toLowerCase()
    const allowedExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv']
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))

    if (!hasValidExtension && !file.mimetype.startsWith('video/')) {
      console.error('❌ 文件类型不合法:', {
        originalname: file.originalname,
        mimetype: file.mimetype
      })
      throw new BadRequestException(`只支持上传视频文件（${allowedExtensions.join(', ')}），当前文件类型：${file.mimetype || '未知'}`)
    }

    // 解析剪辑参数
    const startTime = body?.hasEdited === 'true' ? parseFloat(body?.startTime || '0') : 0
    const endTime = body?.hasEdited === 'true' ? parseFloat(body?.endTime || '30') : 0

    // 获取用户信息（从前端传递的 formData 中获取）
    const nickname = body?.nickname || '匿名用户'
    const age = parseInt(body?.age || '10')

    // 上传视频并保存到数据库
    const result = await this.videoService.uploadVideo(
      file.buffer,
      file.originalname,
      file.mimetype,
      nickname,
      age,
      body?.title || ''
    )

    // 返回结果
    return {
      code: 200,
      msg: 'success',
      data: {
        videoUrl: result.videoUrl,
        videoId: result.videoId,
        title: body?.title || '',
        description: body?.description || '',
        startTime,
        endTime,
        hasEdited: body?.hasEdited === 'true'
      }
    }
  }

  /**
   * 点赞接口
   * POST /api/video/like
   *
   * 请求方式：application/json
   * 参数：
   * - videoId: 视频ID（必须）
   *
   * 返回：
   * {
   *   code: 200,
   *   msg: 'success',
   *   data: {
   *     likeCount: 129,
   *     isLiked: true
   *   }
   * }
   */
  @Post('like')
  async likeVideo(@Body() body: { videoId: string }) {
    console.log('收到点赞请求, videoId:', body.videoId)

    // 验证参数
    if (!body.videoId) {
      throw new BadRequestException('视频ID不能为空')
    }

    // 调用服务层处理点赞
    const result = await this.videoService.likeVideo(body.videoId)

    return {
      code: 200,
      msg: 'success',
      data: result
    }
  }

  /**
   * 用户排名接口
   * GET /api/video/rankings
   *
   * 返回：
   * {
   *   code: 200,
   *   msg: 'success',
   *   data: [
   *     { rank: 1, nickname: '小红妹妹', points: 350 },
   *     { rank: 2, nickname: '小明同学', points: 280 },
   *     ...
   *   ]
   * }
   */
  @Get('rankings')
  async getRankings() {
    console.log('收到排名请求')

    // 获取排名列表
    const rankings = await this.videoService.getRankings()

    return {
      code: 200,
      msg: 'success',
      data: rankings
    }
  }

  /**
   * 获取所有视频列表接口
   * GET /api/video/list
   *
   * 返回：
   * {
   *   code: 200,
   *   msg: 'success',
   *   data: [
   *     { id: '1', nickname: '小明同学', age: 10, content: '...', videoUrl: '...', likeCount: 128, createdAt: '...' },
   *     ...
   *   ]
   * }
   */
  @Get('list')
  async getAllVideos(): Promise<{ code: number; msg: string; data: VideoItem[] }> {
    console.log('收到视频列表请求')

    // 获取视频列表
    const videos = await this.videoService.getAllVideos()

    return {
      code: 200,
      msg: 'success',
      data: videos
    }
  }

  /**
   * 获取指定用户的视频列表接口
   * GET /api/video/my?nickname=小明同学
   *
   * 参数：
   * - nickname: 用户昵称（必须）
   *
   * 返回：
   * {
   *   code: 200,
   *   msg: 'success',
   *   data: [
   *     { id: '1', nickname: '小明同学', age: 10, content: '...', videoUrl: '...', likeCount: 128, createdAt: '...' },
   *     ...
   *   ]
   * }
   */
  @Get('my')
  async getUserVideos(@Query('nickname') nickname: string): Promise<{ code: number; msg: string; data: VideoItem[] }> {
    console.log('收到用户视频请求, nickname:', nickname)

    // 验证参数
    if (!nickname) {
      throw new BadRequestException('用户昵称不能为空')
    }

    // 获取用户视频列表
    const videos = await this.videoService.getUserVideos(nickname)

    return {
      code: 200,
      msg: 'success',
      data: videos
    }
  }

  /**
   * 获取所有合成视频列表
   * GET /api/video/composed/list
   */
  @Get('composed/list')
  async getComposedVideos() {
    console.log('收到合成视频列表请求')

    const composedList = await this.compositionService.getAllComposedVideos()

    return {
      code: 200,
      msg: 'success',
      data: composedList
    }
  }

  /**
   * 获取包含指定用户视频的合成列表
   * GET /api/video/composed/my?nickname=小明同学
   */
  @Get('composed/my')
  async getUserComposedVideos(@Query('nickname') nickname: string) {
    console.log('收到用户合成视频请求, nickname:', nickname)

    if (!nickname) {
      throw new BadRequestException('用户昵称不能为空')
    }

    const composedList = await this.compositionService.getUserComposedVideos(nickname)

    return {
      code: 200,
      msg: 'success',
      data: composedList
    }
  }

  /**
   * 手动触发合成（用于测试）
   * POST /api/video/composed/trigger
   */
  @Post('composed/trigger')
  async triggerComposition() {
    console.log('收到手动触发合成请求')

    const result = await this.compositionService.triggerManualComposition()

    return {
      code: result.success ? 200 : 400,
      msg: result.message,
      data: result.compositions || []
    }
  }

  /**
   * 分析图片接口
   * POST /api/video/analyze-image
   *
   * 请求方式：application/json
   * 参数：
   * - imageUrl: 图片URL（必须）
   * - prompt: 分析提示词（可选，默认："描述这张图片的内容"）
   *
   * 返回：
   * {
   *   code: 200,
   *   msg: 'success',
   *   data: {
   *     description: "图片描述内容..."
   *   }
   * }
   */
  @Post('analyze-image')
  async analyzeImage(@Body() body: { imageUrl: string; prompt?: string }) {
    console.log('收到图片分析请求')
    console.log('图片URL:', body?.imageUrl)

    // 验证参数
    if (!body?.imageUrl) {
      throw new BadRequestException('图片URL不能为空')
    }

    try {
      // 初始化 LLM 客户端
      const config = new Config()
      const client = new LLMClient(config)

      // 构建消息
      const prompt = body?.prompt || '请详细描述这张图片的内容，包括主要元素、颜色、布局等信息。'

      const messages = [
        {
          role: 'user' as const,
          content: [
            { type: 'text' as const, text: prompt },
            {
              type: 'image_url' as const,
              image_url: {
                url: body.imageUrl,
                detail: 'high' as const
              }
            }
          ]
        }
      ]

      // 调用 LLM 分析图片
      const response = await client.invoke(messages, {
        model: 'doubao-seed-1-6-vision-250815',
        temperature: 0.7
      })

      console.log('图片分析结果:', response.content)

      return {
        code: 200,
        msg: 'success',
        data: {
          description: response.content
        }
      }
    } catch (error: any) {
      console.error('图片分析失败:', error)
      throw new BadRequestException(error.message || '图片分析失败')
    }
  }
}
