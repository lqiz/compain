import { Injectable, BadRequestException } from '@nestjs/common'
import { S3Storage } from 'coze-coding-dev-sdk'

@Injectable()
export class VideoService {
  private storage: S3Storage

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
}
