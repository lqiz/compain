/**
 * 等级类型
 */
export type Level = 'bronze' | 'silver' | 'gold' | 'platinum'

/**
 * 卡通形象信息
 */
export interface CatCharacter {
  name: string // 卡通形象名称
  emoji: string // 卡通形象emoji
  description: string // 形象描述
  unlockPoints: number // 解锁所需积分
}

/**
 * 等级信息
 */
export interface LevelInfo {
  level: Level
  levelName: string
  levelEmoji: string
  minPoints: number
  colorClass: string
  character: CatCharacter // 卡通形象
}

/**
 * 用户等级信息
 */
export interface UserLevelInfo extends LevelInfo {
  currentPoints: number
  nextLevelPoints: number
  progressPercent: number
  pointsToNextLevel: number
  isCharacterUnlocked: boolean // 卡通形象是否已解锁
}

/**
 * 卡通形象配置
 */
const CHARACTERS: Record<Level, CatCharacter> = {
  bronze: {
    name: '猫宝宝',
    emoji: '🐱',
    description: '可爱的小猫咪，刚刚开始探索这个世界',
    unlockPoints: 0
  },
  silver: {
    name: '儿童猫',
    emoji: '😺',
    description: '活泼好动的小朋友猫咪，充满好奇心',
    unlockPoints: 150
  },
  gold: {
    name: '青年猫',
    emoji: '😸',
    description: '阳光帅气的青年猫咪，充满活力',
    unlockPoints: 250
  },
  platinum: {
    name: '中年猫咪',
    emoji: '😻',
    description: '成熟稳重的中年猫咪，智慧与优雅并存',
    unlockPoints: 400
  }
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
    colorClass: 'bg-amber-700 text-white',
    character: CHARACTERS.bronze
  },
  silver: {
    level: 'silver',
    levelName: '白银',
    levelEmoji: '🥈',
    minPoints: 150,
    colorClass: 'bg-gray-300 text-gray-700',
    character: CHARACTERS.silver
  },
  gold: {
    level: 'gold',
    levelName: '黄金',
    levelEmoji: '🥇',
    minPoints: 250,
    colorClass: 'bg-yellow-400 text-yellow-900',
    character: CHARACTERS.gold
  },
  platinum: {
    level: 'platinum',
    levelName: '铂金',
    levelEmoji: '💎',
    minPoints: 400,
    colorClass: 'bg-cyan-400 text-cyan-900',
    character: CHARACTERS.platinum
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

  // 判断卡通形象是否已解锁
  const isCharacterUnlocked = points >= currentLevelConfig.character.unlockPoints

  return {
    ...currentLevelConfig,
    currentPoints: points,
    nextLevelPoints: nextLevelConfig.minPoints,
    progressPercent: Math.round(progressPercent),
    pointsToNextLevel: nextLevel === currentLevel ? 0 : nextLevelConfig.minPoints - points,
    isCharacterUnlocked
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
 * 获取所有卡通形象
 * @returns 所有卡通形象列表
 */
export const getAllCharacters = (): Array<{ level: Level } & CatCharacter> => {
  return Object.entries(CHARACTERS).map(([level, character]) => ({
    level: level as Level,
    ...character
  }))
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
