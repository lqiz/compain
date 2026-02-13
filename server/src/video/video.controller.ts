import { Controller, Post, Get, UseInterceptors, UploadedFile, Body, BadRequestException, Query } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { VideoService } from './video.service'
import { LLMClient, Config } from 'coze-coding-dev-sdk'

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

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
        fileSize: 10 * 1024 * 1024, // 10MB
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
    }
  ) {
    console.log('收到视频上传请求')
    console.log('文件信息:', {
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size
    })
    console.log('视频标题:', body?.title)
    console.log('视频描述:', body?.description)
    console.log('剪辑信息:', {
      startTime: body?.startTime,
      endTime: body?.endTime,
      hasEdited: body?.hasEdited
    })

    // 验证文件是否存在
    if (!file) {
      throw new BadRequestException('请选择要上传的视频文件')
    }

    // 验证文件类型
    if (!file.mimetype.startsWith('video/')) {
      throw new BadRequestException('只支持上传视频文件')
    }

    // 验证文件大小
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('视频文件大小不能超过 10MB')
    }

    // 解析剪辑参数
    const startTime = body?.hasEdited === 'true' ? parseFloat(body?.startTime || '0') : 0
    const endTime = body?.hasEdited === 'true' ? parseFloat(body?.endTime || '30') : 0

    // 上传视频（暂时上传完整视频，剪辑信息保存在数据库）
    const videoUrl = await this.videoService.uploadVideo(
      file.buffer,
      file.originalname,
      file.mimetype
    )

    // 返回结果（包含剪辑信息）
    return {
      code: 200,
      msg: 'success',
      data: {
        videoUrl,
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
