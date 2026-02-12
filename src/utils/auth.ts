import Taro from '@tarojs/taro'
import { getUserLevelInfo, USER_POINTS_KEY, POINTS_RULES, type UserLevelInfo } from './level'

/**
 * 用户登录信息
 */
export interface UserInfo {
  isLoggedIn: boolean
  age: number
  nickname: string
  points: number
  levelInfo: UserLevelInfo
}

const STORAGE_KEY_LOGGED_IN = 'isLoggedIn'
const STORAGE_KEY_AGE = 'userAge'
const STORAGE_KEY_NICKNAME = 'userNickname'

/**
 * 获取登录状态
 */
export const getLoginStatus = (): UserInfo => {
  const isLoggedIn = Taro.getStorageSync(STORAGE_KEY_LOGGED_IN) || false
  const age = Taro.getStorageSync(STORAGE_KEY_AGE) || 0
  const nickname = Taro.getStorageSync(STORAGE_KEY_NICKNAME) || ''
  const points = Taro.getStorageSync(USER_POINTS_KEY) || 0
  const levelInfo = getUserLevelInfo(points)

  return {
    isLoggedIn,
    age,
    nickname,
    points,
    levelInfo
  }
}

/**
 * 检查是否已登录
 */
export const checkLogin = (): boolean => {
  const { isLoggedIn } = getLoginStatus()
  return isLoggedIn === true
}

/**
 * 获取用户年龄
 */
export const getUserAge = (): number => {
  return Taro.getStorageSync(STORAGE_KEY_AGE) || 0
}

/**
 * 获取用户昵称
 */
export const getUserNickname = (): string => {
  return Taro.getStorageSync(STORAGE_KEY_NICKNAME) || ''
}

/**
 * 获取用户积分
 */
export const getUserPoints = (): number => {
  return Taro.getStorageSync(USER_POINTS_KEY) || 0
}

/**
 * 获取用户等级信息
 */
export const getUserLevel = (): UserLevelInfo => {
  const points = getUserPoints()
  return getUserLevelInfo(points)
}

/**
 * 增加用户积分
 * @param pointsToAdd 增加的积分
 * @returns 更新后的等级信息
 */
export const addUserPoints = (pointsToAdd: number): UserLevelInfo => {
  const currentPoints = getUserPoints()
  const newPoints = currentPoints + pointsToAdd
  Taro.setStorageSync(USER_POINTS_KEY, newPoints)
  return getUserLevelInfo(newPoints)
}

/**
 * 退出登录
 */
export const logout = () => {
  Taro.removeStorageSync(STORAGE_KEY_LOGGED_IN)
  Taro.removeStorageSync(STORAGE_KEY_AGE)
  Taro.removeStorageSync(STORAGE_KEY_NICKNAME)
  Taro.removeStorageSync(USER_POINTS_KEY)

  // 跳转到登录页
  Taro.redirectTo({
    url: '/pages/login/index'
  })
}

/**
 * 检查登录状态，未登录则跳转到登录页
 */
export const requireLogin = () => {
  if (!checkLogin()) {
    Taro.showToast({
      title: '请先登录',
      icon: 'none'
    })

    setTimeout(() => {
      Taro.redirectTo({
        url: '/pages/login/index'
      })
    }, 1500)

    return false
  }

  return true
}

// 导出积分规则
export { POINTS_RULES }
