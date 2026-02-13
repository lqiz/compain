import { Injectable, OnModuleInit } from '@nestjs/common'

@Injectable()
export class DatabaseService implements OnModuleInit {
  async onModuleInit() {
    // 确保 data 目录存在
    const fs = require('fs')
    const path = require('path')

    const dataDir = path.join(process.cwd(), 'server', 'data')

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
      console.log('创建数据库目录:', dataDir)
    }
  }
}
