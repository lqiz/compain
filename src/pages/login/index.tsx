import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { saveUserInfo } from '@/utils/auth'

interface LoginFormData {
  nickname: string
  age: number
}

const LoginPage = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    nickname: '',
    age: 10
  })

  // 生成随机昵称
  const generateNickname = () => {
    const adjectives = ['快乐的', '可爱的', '聪明的', '勇敢的', '活泼的']
    const animals = ['小猫', '小狗', '小兔子', '小松鼠', '小鸭子']

    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)]

    return randomAdj + randomAnimal
  }

  // 初始化时生成昵称
  useEffect(() => {
    const generated = generateNickname()
    setFormData(prev => ({
      ...prev,
      nickname: generated
    }))
  }, [])

  // 处理昵称输入
  const handleNicknameInput = (e: any) => {
    setFormData(prev => ({
      ...prev,
      nickname: e.detail.value
    }))
  }

  // 处理年龄选择
  const handleAgeChange = (age: number) => {
    setFormData(prev => ({
      ...prev,
      age
    }))
  }

  // 处理登录
  const handleLogin = () => {
    // 验证输入
    if (!formData.nickname.trim()) {
      Taro.showToast({
        title: '请输入昵称',
        icon: 'none'
      })
      return
    }

    if (formData.age < 5 || formData.age > 15) {
      Taro.showToast({
        title: '年龄必须在5-15岁之间',
        icon: 'none'
      })
      return
    }

    // 保存用户信息
    saveUserInfo(formData.nickname, formData.age)

    Taro.showToast({
      title: '登录成功',
      icon: 'success'
    })

    // 跳转到首页
    setTimeout(() => {
      Taro.redirectTo({
        url: '/pages/index/index'
      })
    }, 1000)
  }

  // 重新生成昵称
  const handleRegenerateNickname = () => {
    const generated = generateNickname()
    setFormData(prev => ({
      ...prev,
      nickname: generated
    }))
  }

  return (
    <View className="h-screen bg-gradient-to-br from-sky-50 via-pink-50 to-orange-50 flex flex-col">
      {/* 顶部装饰 */}
      <View className="flex-1 flex flex-col items-center justify-center px-6">
        <View className="mb-8">
          <Text className="block text-6xl">🌈</Text>
        </View>

        <Text className="block text-3xl font-bold text-gray-800 mb-2">诉苦大会</Text>
        <Text className="block text-gray-500 text-base mb-8">分享你的心里话</Text>

        {/* 昵称输入 */}
        <View className="w-full mb-6">
          <Text className="block text-gray-700 font-semibold mb-2 text-sm">你的昵称</Text>
          <View style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
            <View style={{ flex: 1 }} className="bg-white rounded-2xl px-4 py-3 shadow-md border-2 border-sky-100">
              <Input
                className="w-full bg-transparent text-base"
                placeholder="请输入昵称"
                value={formData.nickname}
                onInput={handleNicknameInput}
              />
            </View>
            <View
              className="bg-sky-100 rounded-2xl px-4 flex items-center justify-center shadow-md border-2 border-sky-200"
              style={{ flexShrink: 0 }}
              onClick={handleRegenerateNickname}
            >
              <Text className="block text-sky-600 font-bold text-sm">🎲 换一个</Text>
            </View>
          </View>
        </View>

        {/* 年龄选择 */}
        <View className="w-full mb-8">
          <Text className="block text-gray-700 font-semibold mb-2 text-sm">你的年龄（5-15岁）</Text>
          <View className="bg-white rounded-2xl p-4 shadow-md border-2 border-pink-100">
            <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }}>
              {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(age => (
                <View
                  key={age}
                  className={`rounded-xl px-4 py-2 ${
                    formData.age === age
                      ? 'bg-gradient-to-br from-pink-300 to-orange-300 border-2 border-pink-300'
                      : 'bg-gray-50 border-2 border-gray-100'
                  }`}
                  style={{ flexShrink: 0 }}
                  onClick={() => handleAgeChange(age)}
                >
                  <Text
                    className={`text-sm font-bold ${
                      formData.age === age ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    {age}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 温馨提示 */}
        <View className="bg-gradient-to-r from-sky-50 to-pink-50 rounded-2xl p-4 border-2 border-sky-100 w-full mb-6">
          <Text className="block text-gray-600 text-sm leading-relaxed">
            <Text className="font-bold text-sky-500">💡 温馨提示：</Text>
            {'\n'}诉苦大会仅面向 5-15 岁的小朋友开放，请如实填写你的年龄哦！
          </Text>
        </View>

        {/* 登录按钮 */}
        <View
          className="w-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-2xl py-4 shadow-xl border-2 border-orange-300"
          onClick={handleLogin}
        >
          <Text className="block text-white font-bold text-lg text-center">
            开始探索 🚀
          </Text>
        </View>
      </View>

      {/* 底部装饰 */}
      <View className="px-6 pb-8">
        <View className="text-center">
          <Text className="block text-gray-400 text-xs">
            点击登录即表示同意《诉苦大会使用规则》
          </Text>
        </View>
      </View>
    </View>
  )
}

export default LoginPage
