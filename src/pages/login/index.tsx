import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'

const LoginPage = () => {
  const [age, setAge] = useState<number>(8)
  const [loading, setLoading] = useState<boolean>(false)

  // 增加年龄
  const increaseAge = () => {
    if (age < 15) {
      setAge(age + 1)
    }
  }

  // 减少年龄
  const decreaseAge = () => {
    if (age > 1) {
      setAge(age - 1)
    }
  }

  // 处理登录
  const handleLogin = () => {
    // 验证年龄限制
    if (age > 15) {
      Taro.showToast({
        title: '抱歉，只允许15岁以下的小朋友使用',
        icon: 'none',
        duration: 3000
      })
      return
    }

    setLoading(true)

    // 模拟登录请求
    setTimeout(() => {
      // 保存登录状态到本地存储
      Taro.setStorageSync('isLoggedIn', true)
      Taro.setStorageSync('userAge', age)
      Taro.setStorageSync('userNickname', `小朋友${age}岁`)
      Taro.setStorageSync('userPoints', 0) // 初始化积分为 0

      setLoading(false)

      // 显示登录成功提示
      Taro.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 2000
      })

      // 跳转到首页
      setTimeout(() => {
        Taro.redirectTo({
          url: '/pages/index/index'
        })
      }, 1000)
    }, 1000)
  }

  return (
    <View className="min-h-screen bg-orange-50 p-5 flex flex-col">
      {/* 应用 Logo 和名称 */}
      <View className="flex flex-col items-center justify-center py-12">
        <Text className="block text-6xl mb-4">📢</Text>
        <Text className="block text-orange-500 font-bold text-3xl mb-2">诉苦大会</Text>
        <Text className="block text-gray-600 text-base mb-1">孩子吐槽家长小程序</Text>
        <Text className="block text-gray-500 text-sm">孩子的心里话，我们来发布</Text>
      </View>

      {/* 温馨提示 */}
      <View className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
        <Text className="block text-yellow-700 font-semibold text-sm mb-2">💡 温馨提示</Text>
        <Text className="block text-yellow-600 text-xs leading-relaxed">
          这里只允许 15 岁以下的小朋友使用哦，请选择你的真实年龄
        </Text>
      </View>

      {/* 年龄选择器 */}
      <View className="bg-white border-2 border-orange-200 rounded-2xl p-6 mb-6 shadow-sm">
        <Text className="block text-gray-800 font-semibold text-base mb-6 text-center">
          选择你的年龄
        </Text>

        <View className="flex justify-center items-center gap-6">
          {/* 减号按钮 */}
          <View
            className={`w-14 h-14 rounded-full flex items-center justify-center ${
              age <= 1 ? 'bg-gray-100' : 'bg-orange-100'
            }`}
            onClick={decreaseAge}
          >
            <Text className={`text-3xl ${age <= 1 ? 'text-gray-300' : 'text-orange-500'}`}>
              -
            </Text>
          </View>

          {/* 年龄显示 */}
          <View className="w-24 h-24 bg-orange-100 rounded-2xl flex items-center justify-center">
            <Text className="block text-orange-500 font-bold text-5xl">{age}</Text>
          </View>

          {/* 加号按钮 */}
          <View
            className={`w-14 h-14 rounded-full flex items-center justify-center ${
              age >= 15 ? 'bg-gray-100' : 'bg-orange-100'
            }`}
            onClick={increaseAge}
          >
            <Text className={`text-3xl ${age >= 15 ? 'text-gray-300' : 'text-orange-500'}`}>
              +
            </Text>
          </View>
        </View>

        <Text className="block text-gray-500 text-xs text-center mt-6">
          年龄必须是 1-15 岁之间哦
        </Text>
      </View>

      {/* 年龄验证提示 */}
      {age > 15 && (
        <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <Text className="block text-red-700 font-semibold text-sm mb-1">😢 抱歉</Text>
          <Text className="block text-red-600 text-xs">
            诉苦大会只允许 15 岁以下的小朋友使用，请返回重新选择年龄
          </Text>
        </View>
      )}

      {/* 登录按钮 */}
      <View className="mt-auto">
        {age <= 15 ? (
          <View
            className="bg-orange-500 rounded-2xl px-6 py-4 shadow-sm"
            onClick={loading ? undefined : handleLogin}
          >
            {loading ? (
              <Text className="block text-white font-semibold text-center text-base">
                登录中...
              </Text>
            ) : (
              <Text className="block text-white font-semibold text-center text-base">
                开始诉苦
              </Text>
            )}
          </View>
        ) : (
          <View className="bg-gray-200 rounded-2xl px-6 py-4">
            <Text className="block text-gray-400 font-semibold text-center text-base">
              年龄超出限制
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default LoginPage
