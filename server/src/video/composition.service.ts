import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { LLMClient, Config } from 'coze-coding-dev-sdk'
import { desc, and, gte, lt, eq } from 'drizzle-orm'
import { getDb, videos, composedVideos, NewComposedVideo } from '../db'

/**
 * LLM 对单个视频的评分结果
 */
interface VideoEvaluation {
  videoId: string
  nickname: string
  score: number        // 0-100 分
  reason: string       // 评分理由
  selected: boolean    // 是否被选中
}

/**
 * 一次合成的评估结果
 */
interface CompositionEvaluation {
  sessionDate: string
  sessionHour: number
  evaluations: VideoEvaluation[]
  summary: string      // LLM 的整体评价
}

/**
 * 合成视频服务
 *
 * 核心机制：
 * 1. 每小时一场诉苦大会
 * 2. 用豆包大模型评估该小时内上传的所有视频
 * 3. 选出最适合的视频（每 10 个一组合成一个）
 * 4. 被选中的视频作者获得 +20 积分
 * 5. 一场大会可合成多个视频（视频数量 > 10 时分组）
 */
@Injectable()
export class CompositionService implements OnModuleInit, OnModuleDestroy {
  private db: Awaited<ReturnType<typeof getDb>>
  private llmClient: LLMClient | null = null
  private schedulerTimer: NodeJS.Timeout | null = null
  private isProcessing = false

  async onModuleInit() {
    console.log('初始化 CompositionService...')

    // 初始化数据库
    this.db = await getDb()

    // 初始化 LLM 客户端
    try {
      const config = new Config()
      this.llmClient = new LLMClient(config)
      console.log('✅ CompositionService LLM 客户端初始化成功')
    } catch (error: any) {
      console.error('⚠️ LLM 客户端初始化失败，合成功能将不可用:', error.message)
    }

    // 启动每小时调度器
    this.startScheduler()

    console.log('✅ CompositionService 初始化完成')
  }

  onModuleDestroy() {
    if (this.schedulerTimer) {
      clearTimeout(this.schedulerTimer)
      this.schedulerTimer = null
    }
    console.log('CompositionService 已销毁')
  }

  /**
   * 启动每小时调度器
   * 在每个整点后 1 分钟触发，处理上一个小时的视频
   */
  private startScheduler() {
    const scheduleNext = () => {
      const now = new Date()
      // 计算到下一个整点后 1 分钟的延迟
      const nextHour = new Date(now)
      nextHour.setHours(now.getHours() + 1, 1, 0, 0) // 整点后 1 分钟
      const delay = nextHour.getTime() - now.getTime()

      console.log(`[合成调度] 下次合成时间: ${nextHour.toLocaleString()}, 等待 ${Math.round(delay / 60000)} 分钟`)

      this.schedulerTimer = setTimeout(async () => {
        await this.runHourlyComposition()
        scheduleNext() // 继续调度下一次
      }, delay)
    }

    scheduleNext()
    console.log('[合成调度] 每小时调度器已启动')
  }

  /**
   * 执行每小时合成任务
   * 处理上一个小时内上传的视频
   */
  async runHourlyComposition(): Promise<{ success: boolean; message: string; compositions?: any[] }> {
    if (this.isProcessing) {
      console.log('[合成] 上一次合成任务尚未完成，跳过')
      return { success: false, message: '上一次合成任务尚未完成' }
    }

    this.isProcessing = true
    console.log('========== 开始每小时合成任务 ==========')

    try {
      // 计算上一个小时的时间范围
      const now = new Date()
      const lastHourStart = new Date(now)
      lastHourStart.setHours(now.getHours() - 1, 0, 0, 0)
      const lastHourEnd = new Date(now)
      lastHourEnd.setHours(now.getHours(), 0, 0, 0)

      const sessionDate = lastHourStart.toISOString().split('T')[0]
      const sessionHour = lastHourStart.getHours()

      console.log(`[合成] 处理时段: ${sessionDate} ${sessionHour}:00 ~ ${sessionHour + 1}:00`)

      // 获取该时段内上传的视频
      const hourlyVideos = await this.db
        .select()
        .from(videos)
        .where(
          and(
            gte(videos.createdAt, lastHourStart.getTime()),
            lt(videos.createdAt, lastHourEnd.getTime())
          )
        )
        .orderBy(desc(videos.createdAt))

      console.log(`[合成] 该时段共有 ${hourlyVideos.length} 个视频`)

      // 至少需要 3 个视频才进行合成
      if (hourlyVideos.length < 3) {
        console.log('[合成] 视频数量不足 3 个，跳过合成')
        return { success: true, message: `视频数量不足（${hourlyVideos.length}个），需要至少3个` }
      }

      // 检查该时段是否已经合成过
      const existingCompositions = await this.db
        .select()
        .from(composedVideos)
        .where(
          and(
            eq(composedVideos.sessionDate, sessionDate),
            eq(composedVideos.sessionHour, sessionHour)
          )
        )

      if (existingCompositions.length > 0) {
        console.log(`[合成] 该时段已有 ${existingCompositions.length} 个合成，跳过`)
        return { success: true, message: '该时段已完成合成' }
      }

      // 使用 LLM 评估视频
      const evaluation = await this.evaluateVideosWithLLM(hourlyVideos, sessionDate, sessionHour)

      if (!evaluation) {
        console.error('[合成] LLM 评估失败')
        return { success: false, message: 'LLM 评估失败' }
      }

      // 筛选被选中的视频
      const selectedEvals = evaluation.evaluations
        .filter(e => e.selected)
        .sort((a, b) => b.score - a.score)

      console.log(`[合成] LLM 选中了 ${selectedEvals.length} 个视频`)

      if (selectedEvals.length === 0) {
        console.log('[合成] 没有视频被选中')
        return { success: true, message: 'LLM 评估后没有视频被选中' }
      }

      // 按每 10 个一组进行合成
      const compositions: any[] = []
      const GROUP_SIZE = 10

      for (let i = 0; i < selectedEvals.length; i += GROUP_SIZE) {
        const group = selectedEvals.slice(i, i + GROUP_SIZE)
        const roundNumber = Math.floor(i / GROUP_SIZE) + 1

        // 获取选中视频的完整信息
        const selectedVideoIds = group.map(e => e.videoId)
        const selectedVideos = hourlyVideos.filter(v => selectedVideoIds.includes(v.id))

        // 创建合成记录
        const compositionRecord: NewComposedVideo = {
          id: `comp-${sessionDate}-${sessionHour}-${roundNumber}-${Date.now()}`,
          sessionDate,
          sessionHour,
          roundNumber,
          videoIds: JSON.stringify(selectedVideos.map(v => v.id)),
          videoNicknames: JSON.stringify(selectedVideos.map(v => v.nickname)),
          videoUrls: JSON.stringify(selectedVideos.map(v => v.videoUrl)),
          videoContents: JSON.stringify(selectedVideos.map(v => v.content)),
          llmEvaluation: JSON.stringify({
            evaluations: group,
            summary: evaluation.summary
          }),
          totalVideos: selectedVideos.length,
          status: 'completed',
          createdAt: Date.now()
        }

        await this.db.insert(composedVideos).values(compositionRecord)
        compositions.push(compositionRecord)

        console.log(`[合成] 第 ${roundNumber} 组合成完成，包含 ${selectedVideos.length} 个视频`)
        console.log(`[合成] 被选中的作者: ${selectedVideos.map(v => v.nickname).join(', ')}`)
      }

      console.log(`========== 合成任务完成，共 ${compositions.length} 个合成 ==========`)
      return {
        success: true,
        message: `合成完成，共 ${compositions.length} 个合成视频`,
        compositions
      }
    } catch (error: any) {
      console.error('[合成] 合成任务失败:', error)
      return { success: false, message: `合成失败: ${error.message}` }
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 手动触发合成（用于测试，处理最近一小时的视频）
   */
  async triggerManualComposition(): Promise<{ success: boolean; message: string; compositions?: any[] }> {
    console.log('[合成] 手动触发合成...')

    // 获取最近 1 小时内的视频
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    const recentVideos = await this.db
      .select()
      .from(videos)
      .where(gte(videos.createdAt, oneHourAgo.getTime()))
      .orderBy(desc(videos.createdAt))

    const sessionDate = now.toISOString().split('T')[0]
    const sessionHour = now.getHours()

    console.log(`[手动合成] 最近1小时共有 ${recentVideos.length} 个视频`)

    if (recentVideos.length < 1) {
      // 如果最近1小时没有视频，取所有视频
      const allVideos = await this.db
        .select()
        .from(videos)
        .orderBy(desc(videos.createdAt))
        .limit(20)

      if (allVideos.length < 3) {
        return { success: false, message: `视频数量不足（${allVideos.length}个），至少需要3个` }
      }

      return this.createCompositionFromVideos(allVideos, sessionDate, sessionHour)
    }

    if (recentVideos.length < 3) {
      return { success: false, message: `视频数量不足（${recentVideos.length}个），至少需要3个` }
    }

    return this.createCompositionFromVideos(recentVideos, sessionDate, sessionHour)
  }

  /**
   * 从给定的视频列表创建合成
   */
  private async createCompositionFromVideos(
    videoList: any[],
    sessionDate: string,
    sessionHour: number
  ): Promise<{ success: boolean; message: string; compositions?: any[] }> {
    try {
      // 使用 LLM 评估视频
      const evaluation = await this.evaluateVideosWithLLM(videoList, sessionDate, sessionHour)

      if (!evaluation) {
        return { success: false, message: 'LLM 评估失败' }
      }

      const selectedEvals = evaluation.evaluations
        .filter(e => e.selected)
        .sort((a, b) => b.score - a.score)

      if (selectedEvals.length === 0) {
        return { success: true, message: 'LLM 评估后没有视频被选中' }
      }

      // 查询当前时段已有的合成数量来确定 roundNumber
      const existingCount = await this.db
        .select()
        .from(composedVideos)
        .where(
          and(
            eq(composedVideos.sessionDate, sessionDate),
            eq(composedVideos.sessionHour, sessionHour)
          )
        )

      const compositions: any[] = []
      const GROUP_SIZE = 10
      let baseRound = existingCount.length

      for (let i = 0; i < selectedEvals.length; i += GROUP_SIZE) {
        const group = selectedEvals.slice(i, i + GROUP_SIZE)
        const roundNumber = baseRound + Math.floor(i / GROUP_SIZE) + 1

        const selectedVideoIds = group.map(e => e.videoId)
        const selectedVideos = videoList.filter(v => selectedVideoIds.includes(v.id))

        const compositionRecord: NewComposedVideo = {
          id: `comp-${sessionDate}-${sessionHour}-${roundNumber}-${Date.now()}`,
          sessionDate,
          sessionHour,
          roundNumber,
          videoIds: JSON.stringify(selectedVideos.map(v => v.id)),
          videoNicknames: JSON.stringify(selectedVideos.map(v => v.nickname)),
          videoUrls: JSON.stringify(selectedVideos.map(v => v.videoUrl)),
          videoContents: JSON.stringify(selectedVideos.map(v => v.content)),
          llmEvaluation: JSON.stringify({
            evaluations: group,
            summary: evaluation.summary
          }),
          totalVideos: selectedVideos.length,
          status: 'completed',
          createdAt: Date.now()
        }

        await this.db.insert(composedVideos).values(compositionRecord)
        compositions.push(compositionRecord)

        console.log(`[手动合成] 第 ${roundNumber} 组合成完成，包含 ${selectedVideos.length} 个视频`)
      }

      return {
        success: true,
        message: `合成完成，共 ${compositions.length} 个合成视频`,
        compositions
      }
    } catch (error: any) {
      console.error('[手动合成] 失败:', error)
      return { success: false, message: `合成失败: ${error.message}` }
    }
  }

  /**
   * 使用豆包大模型评估视频
   * 根据视频描述内容评分，选出最适合的视频
   */
  private async evaluateVideosWithLLM(
    videoList: any[],
    sessionDate: string,
    sessionHour: number
  ): Promise<CompositionEvaluation | null> {
    try {
      if (!this.llmClient) {
        console.error('[LLM] LLM 客户端未初始化')
        // 降级：不使用LLM，按点赞数排序选择
        return this.fallbackEvaluation(videoList, sessionDate, sessionHour)
      }

      console.log(`[LLM] 开始评估 ${videoList.length} 个视频...`)

      // 构建视频列表描述
      const videoDescriptions = videoList.map((v, i) => {
        return `视频${i + 1} (ID: ${v.id}, 作者: ${v.nickname}, ${v.age}岁):
内容: ${v.content}
点赞数: ${v.likeCount}`
      }).join('\n\n')

      const prompt = `你是"诉苦大会"儿童短视频平台的内容编辑。现在需要从以下 ${videoList.length} 个视频中挑选适合合成的视频。

评选标准：
1. 内容真实感人、能引起共鸣（权重最高）
2. 内容积极正向或表达真实情感
3. 适合5-15岁儿童观看
4. 不含不良内容

请评估每个视频并给出 0-100 分的评分。选出最适合合成的视频（至少选3个，最多选10个）。
得分 60 分以上的视频才会被选中。

视频列表：
${videoDescriptions}

请严格按照以下 JSON 格式返回（不要添加任何其他文字）：
{
  "evaluations": [
    {
      "videoId": "视频ID",
      "nickname": "作者昵称",
      "score": 85,
      "reason": "评分理由",
      "selected": true
    }
  ],
  "summary": "本场诉苦大会的整体评价"
}`

      const messages = [
        {
          role: 'user' as const,
          content: prompt
        }
      ]

      const response = await this.llmClient.invoke(messages, {
        model: 'doubao-seed-1-6-vision-250815',
        temperature: 0.3
      })

      console.log('[LLM] 评估完成，解析结果...')

      // 解析 LLM 返回的 JSON
      let result: any
      try {
        // 尝试提取 JSON（LLM 可能返回带有 markdown 代码块的 JSON）
        let jsonStr = response.content
        const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
        if (jsonMatch) {
          jsonStr = jsonMatch[1].trim()
        }
        result = JSON.parse(jsonStr)
      } catch (parseError) {
        console.error('[LLM] JSON 解析失败:', parseError.message)
        console.log('[LLM] 原始返回:', response.content)
        // 降级处理
        return this.fallbackEvaluation(videoList, sessionDate, sessionHour)
      }

      console.log(`[LLM] 评估结果: ${result.evaluations?.length || 0} 个视频被评分`)
      console.log(`[LLM] 整体评价: ${result.summary}`)

      return {
        sessionDate,
        sessionHour,
        evaluations: result.evaluations || [],
        summary: result.summary || '本场诉苦大会精彩纷呈'
      }
    } catch (error: any) {
      console.error('[LLM] 评估失败:', error.message)
      // 降级：不使用 LLM，按点赞数排序选择
      return this.fallbackEvaluation(videoList, sessionDate, sessionHour)
    }
  }

  /**
   * 降级评估：当 LLM 不可用时，按点赞数排序选择
   */
  private fallbackEvaluation(
    videoList: any[],
    sessionDate: string,
    sessionHour: number
  ): CompositionEvaluation {
    console.log('[合成] 使用降级评估（按点赞数排序）')

    const sorted = [...videoList].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
    const selected = sorted.slice(0, 10)

    const evaluations: VideoEvaluation[] = videoList.map(v => {
      const isSelected = selected.some(s => s.id === v.id)
      return {
        videoId: v.id,
        nickname: v.nickname,
        score: isSelected ? 70 + (v.likeCount || 0) : 40,
        reason: isSelected ? '点赞数较高，内容受欢迎' : '点赞数较低',
        selected: isSelected
      }
    })

    return {
      sessionDate,
      sessionHour,
      evaluations,
      summary: '本场诉苦大会由系统自动选择（降级模式）'
    }
  }

  /**
   * 获取所有合成视频列表
   */
  async getAllComposedVideos(): Promise<any[]> {
    const list = await this.db
      .select()
      .from(composedVideos)
      .orderBy(desc(composedVideos.createdAt))
      .limit(50)

    return list.map(this.formatComposedVideo)
  }

  /**
   * 获取包含指定用户视频的合成列表
   */
  async getUserComposedVideos(nickname: string): Promise<any[]> {
    // 获取所有合成视频，然后过滤包含该用户的
    const allComposed = await this.db
      .select()
      .from(composedVideos)
      .orderBy(desc(composedVideos.createdAt))

    const userComposed = allComposed.filter(comp => {
      try {
        const nicknames: string[] = JSON.parse(comp.videoNicknames)
        return nicknames.includes(nickname)
      } catch {
        return false
      }
    })

    return userComposed.map(this.formatComposedVideo)
  }

  /**
   * 格式化合成视频记录用于前端显示
   */
  private formatComposedVideo(comp: any): any {
    let videoNicknames: string[] = []
    let videoUrls: string[] = []
    let videoContents: string[] = []
    let videoIds: string[] = []
    let llmEvaluation: any = {}

    try { videoNicknames = JSON.parse(comp.videoNicknames) } catch {}
    try { videoUrls = JSON.parse(comp.videoUrls) } catch {}
    try { videoContents = JSON.parse(comp.videoContents) } catch {}
    try { videoIds = JSON.parse(comp.videoIds) } catch {}
    try { llmEvaluation = JSON.parse(comp.llmEvaluation) } catch {}

    return {
      id: comp.id,
      sessionDate: comp.sessionDate,
      sessionHour: comp.sessionHour,
      roundNumber: comp.roundNumber,
      totalVideos: comp.totalVideos,
      videoNicknames,
      videoUrls,
      videoContents,
      videoIds,
      llmSummary: llmEvaluation.summary || '',
      status: comp.status,
      createdAt: comp.createdAt
    }
  }
}
