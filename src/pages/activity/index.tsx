import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { checkLogin, hasCheckedInToday, dailyCheckin, getUserPoints, getCheckinDays } from '@/utils/auth'

const ActivityPage = () => {
  const [hasCheckedIn, setHasCheckedIn] = useState(false)
  const [checkinDays, setCheckinDays] = useState(0)
  const [points, setPoints] = useState(0)
  const [isCheckingIn, setIsCheckingIn] = useState(false)

  // 页面加载时检查登录状态和签到状态
  Taro.useLoad(() => {
    if (!checkLogin()) {
      Taro.redirectTo({
        url: '/pages/login/index'
      })
    }

    // 加载签到状态
    loadCheckinStatus()
  })

  // 页面显示时重新加载签到状态
  Taro.useDidShow(() => {
    loadCheckinStatus()
  })

  const loadCheckinStatus = () => {
    setHasCheckedIn(hasCheckedInToday())
    setCheckinDays(getCheckinDays())
    setPoints(getUserPoints())
  }

  const handleCheckin = () => {
    if (isCheckingIn) return

    setIsCheckingIn(true)

    const result = dailyCheckin()

    if (result.success) {
      Taro.showToast({
        title: result.message,
        icon: 'success',
        duration: 2000
      })

      // 更新签到状态
      loadCheckinStatus()
    } else {
      Taro.showToast({
        title: result.message,
        icon: 'none',
        duration: 2000
      })
    }

    setIsCheckingIn(false)
  }

  return (
    <View className="min-h-screen bg-orange-50 p-5 pb-20">
      {/* 页面标题 */}
      <View className="mb-6">
        <Text className="block text-2xl font-bold text-gray-800">活动中心</Text>
        <Text className="block text-gray-500 text-sm mt-1">参与活动，获得更多积分</Text>
      </View>

      {/* 签到卡片 */}
      <View className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-6 shadow-lg mb-6">
        <View className="flex items-center justify-between">
          <View>
            <Text className="block text-white font-bold text-xl mb-1">每日签到</Text>
            <Text className="block text-white/80 text-sm">
              连续签到 {checkinDays} 天
            </Text>
          </View>
          {hasCheckedIn ? (
            <View className="bg-white/20 rounded-full px-5 py-2">
              <Text className="block text-white font-semibold text-sm">已签到</Text>
            </View>
          ) : (
            <Button
              onClick={handleCheckin}
              disabled={isCheckingIn}
              className="bg-white text-orange-500 font-semibold rounded-full px-5 py-2 text-sm"
            >
              {isCheckingIn ? '签到中...' : '立即签到'}
            </Button>
          )}
        </View>

        {/* 签到奖励提示 */}
        <View className="bg-white/10 rounded-xl p-3 mt-4">
          <Text className="block text-white text-sm">
            🔥 每日签到可获得 +5 积分，积分可升级获得更多特权
          </Text>
        </View>
      </View>

      {/* 积分统计 */}
      <View className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <Text className="block text-gray-800 font-semibold text-base mb-4">
          💎 我的积分
        </Text>
        <View className="flex items-center justify-center py-4">
          <Text className="block text-4xl font-bold text-orange-500">{points}</Text>
          <Text className="block text-gray-500 text-sm ml-2">积分</Text>
        </View>
      </View>

      {/* 积分规则说明 */}
      <View className="bg-white rounded-2xl p-5 shadow-sm">
        <Text className="block text-gray-800 font-semibold text-base mb-4">
          📊 积分规则
        </Text>

        <View className="space-y-3">
          <View className="flex justify-between items-center py-2 border-b border-gray-100">
            <View className="flex items-center">
              <Text className="block text-xl mr-3">📹</Text>
              <Text className="block text-gray-700 text-sm">发布视频</Text>
            </View>
            <Text className="block text-orange-500 font-bold text-sm">+5</Text>
          </View>

          <View className="flex justify-between items-center py-2 border-b border-gray-100">
            <View className="flex items-center">
              <Text className="block text-xl mr-3">🎬</Text>
              <Text className="block text-gray-700 text-sm">视频被合成</Text>
            </View>
            <Text className="block text-orange-500 font-bold text-sm">+20</Text>
          </View>

          <View className="flex justify-between items-center py-2 border-b border-gray-100">
            <View className="flex items-center">
              <Text className="block text-xl mr-3">✅</Text>
              <Text className="block text-gray-700 text-sm">每日签到</Text>
            </View>
            <Text className="block text-orange-500 font-bold text-sm">+5</Text>
          </View>

          <View className="flex justify-between items-center py-2">
            <View className="flex items-center">
              <Text className="block text-xl mr-3">❤️</Text>
              <Text className="block text-gray-700 text-sm">收到点赞</Text>
            </View>
            <Text className="block text-orange-500 font-bold text-sm">+2</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default ActivityPage
