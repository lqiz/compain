import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { VideoController } from './video.controller'
import { VideoService } from './video.service'

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(), // 使用内存存储
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      }
    })
  ],
  controllers: [VideoController],
  providers: [VideoService],
  exports: [VideoService]
})
export class VideoModule {}
