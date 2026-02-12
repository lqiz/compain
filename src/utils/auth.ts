import Taro from '@tarojs/taro'

/**
 * 用户登录信息
 */
export interface UserInfo {
  isLoggedIn: boolean
  age: number
  nickname: string
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

  return {
    isLoggedIn,
    age,
    nickname
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
 * 退出登录
 */
export const logout = () => {
  Taro.removeStorageSync(STORAGE_KEY_LOGGED_IN)
  Taro.removeStorageSync(STORAGE_KEY_AGE)
  Taro.removeStorageSync(STORAGE_KEY_NICKNAME)

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
