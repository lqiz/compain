import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { checkLogin } from '@/utils/auth'

const ActivityPage = () => {
  // 页面加载时检查登录状态
  Taro.useLoad(() => {
    if (!checkLogin()) {
      Taro.redirectTo({
        url: '/pages/login/index'
      })
    }
  })

  return (
    <View className="min-h-screen bg-orange-50 p-5 pb-20">
      {/* 页面标题 */}
      <View className="mb-6">
        <Text className="block text-2xl font-bold text-gray-800">活动中心</Text>
        <Text className="block text-gray-500 text-sm mt-1">参与活动，获得更多积分</Text>
      </View>

      {/* 活动提示 */}
      <View className="bg-white rounded-2xl p-8 text-center shadow-sm mb-6">
        <Text className="block text-6xl mb-4">🎉</Text>
        <Text className="block text-gray-800 font-bold text-xl mb-2">敬请期待</Text>
        <Text className="block text-gray-500 text-base mb-4">
          精彩活动即将上线
        </Text>
        <View className="bg-orange-100 rounded-xl p-4">
          <Text className="block text-orange-700 text-sm">
            💡 每小时发布诉苦视频可获得积分奖励
          </Text>
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
            <Text className="block text-orange-500 font-bold text-sm">+10</Text>
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
