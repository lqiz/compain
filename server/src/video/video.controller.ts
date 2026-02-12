import { Controller, Post, UseInterceptors, UploadedFile, Body, BadRequestException } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { VideoService } from './video.service'

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
   *
   * 返回：
   * {
   *   code: 200,
   *   msg: 'success',
   *   data: {
   *     videoUrl: 'https://...',
   *     title: '视频标题',
   *     description: '视频描述'
   *   }
   * }
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: memoryStorage(), // 使用内存存储，避免写入本地磁盘
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      }
    })
  )
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { title?: string; description?: string }
  ) {
    console.log('收到视频上传请求')
    console.log('文件信息:', {
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size
    })
    console.log('视频标题:', body?.title)
    console.log('视频描述:', body?.description)

    // 验证文件是否存在
    if (!file) {
      throw new BadRequestException('请选择要上传的视频文件')
    }

    // 验证文件类型
    if (!file.mimetype.startsWith('video/')) {
      throw new BadRequestException('只支持上传视频文件')
    }

    // 验证文件大小
    if (file.size > 100 * 1024 * 1024) {
      throw new BadRequestException('视频文件大小不能超过 100MB')
    }

    // 上传视频
    const videoUrl = await this.videoService.uploadVideo(
      file.buffer,
      file.originalname,
      file.mimetype
    )

    // 返回结果
    return {
      code: 200,
      msg: 'success',
      data: {
        videoUrl,
        title: body?.title || '',
        description: body?.description || ''
      }
    }
  }
}
