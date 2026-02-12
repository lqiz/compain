/**
 * 等级类型
 */
export type Level = 'bronze' | 'silver' | 'gold' | 'platinum'

/**
 * 等级信息
 */
export interface LevelInfo {
  level: Level
  levelName: string
  levelEmoji: string
  minPoints: number
  colorClass: string
}

/**
 * 用户等级信息
 */
export interface UserLevelInfo extends LevelInfo {
  currentPoints: number
  nextLevelPoints: number
  progressPercent: number
  pointsToNextLevel: number
}

/**
 * 等级配置
 */
const LEVEL_CONFIG: Record<Level, LevelInfo> = {
  bronze: {
    level: 'bronze',
    levelName: '青铜',
    levelEmoji: '🥉',
    minPoints: 0,
    colorClass: 'bg-amber-700 text-white'
  },
  silver: {
    level: 'silver',
    levelName: '白银',
    levelEmoji: '🥈',
    minPoints: 150,
    colorClass: 'bg-gray-300 text-gray-700'
  },
  gold: {
    level: 'gold',
    levelName: '黄金',
    levelEmoji: '🥇',
    minPoints: 250,
    colorClass: 'bg-yellow-400 text-yellow-900'
  },
  platinum: {
    level: 'platinum',
    levelName: '铂金',
    levelEmoji: '💎',
    minPoints: 400,
    colorClass: 'bg-cyan-400 text-cyan-900'
  }
}

/**
 * 获取用户等级信息
 * @param points 用户积分
 * @returns 用户等级信息
 */
export const getUserLevelInfo = (points: number): UserLevelInfo => {
  let currentLevel: Level = 'bronze'
  let nextLevel: Level = 'silver'

  // 确定当前等级
  if (points >= 400) {
    currentLevel = 'platinum'
    nextLevel = 'platinum'
  } else if (points >= 250) {
    currentLevel = 'gold'
    nextLevel = 'platinum'
  } else if (points >= 150) {
    currentLevel = 'silver'
    nextLevel = 'gold'
  } else {
    currentLevel = 'bronze'
    nextLevel = 'silver'
  }

  const currentLevelConfig = LEVEL_CONFIG[currentLevel]
  const nextLevelConfig = LEVEL_CONFIG[nextLevel]

  // 计算进度百分比
  const progressPercent = nextLevel === currentLevel
    ? 100
    : ((points - currentLevelConfig.minPoints) / (nextLevelConfig.minPoints - currentLevelConfig.minPoints)) * 100

  return {
    ...currentLevelConfig,
    currentPoints: points,
    nextLevelPoints: nextLevelConfig.minPoints,
    progressPercent: Math.round(progressPercent),
    pointsToNextLevel: nextLevel === currentLevel ? 0 : nextLevelConfig.minPoints - points
  }
}

/**
 * 获取等级徽章样式
 * @param level 等级
 * @returns 徽章样式类名
 */
export const getLevelBadgeClass = (level: Level): string => {
  const config = LEVEL_CONFIG[level]
  return config.colorClass
}

/**
 * 获取等级显示文本
 * @param level 等级
 * @returns 显示文本
 */
export const getLevelDisplayText = (level: Level): string => {
  const config = LEVEL_CONFIG[level]
  return `${config.levelEmoji} ${config.levelName}`
}

/**
 * 增加积分
 * @param currentPoints 当前积分
 * @param pointsToAdd 增加的积分
 * @returns 新的积分和等级信息
 */
export const addPoints = (currentPoints: number, pointsToAdd: number): UserLevelInfo => {
  const newPoints = currentPoints + pointsToAdd
  return getUserLevelInfo(newPoints)
}

/**
 * 积分规则
 */
export const POINTS_RULES = {
  PUBLISH_VIDEO: 5, // 发布视频 +5 积分
  VIDEO_COMPOSED: 20, // 视频被合成 +20 积分
  DAILY_CHECKIN: 5, // 每日签到 +5 积分
  SHARE_VIDEO: 3, // 分享视频 +3 积分
  RECEIVE_LIKE: 2 // 收到点赞 +2 积分
} as const

/**
 * 获取用户积分存储key
 */
export const USER_POINTS_KEY = 'userPoints'
