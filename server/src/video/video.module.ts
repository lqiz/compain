import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { VideoController } from './video.controller'
import { VideoService } from './video.service'
import { CompositionService } from './composition.service'

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB - 与产品文档一致
      }
    })
  ],
  controllers: [VideoController],
  providers: [VideoService, CompositionService],
  exports: [VideoService, CompositionService]
})
export class VideoModule {}
