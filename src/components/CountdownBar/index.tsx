import { View, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'

interface CountdownBarProps {
  // 自定义样式类名
  className?: string
}

const CountdownBar: React.FC<CountdownBarProps> = ({ className = '' }) => {
  const [countdown, setCountdown] = useState<number>(0)
  const [currentRound, setCurrentRound] = useState<number>(1)

  useEffect(() => {
    // 计算到下一个整点的倒计时
    // 每天23场：0点到22点
    const calculateCountdown = () => {
      const now = new Date()
      const currentHour = now.getHours()

      // 如果当前时间是23点，则下一场是第二天0点
      const nextHour = new Date(now)

      if (currentHour >= 23) {
        // 当前是23点，下一场是第二天0点
        nextHour.setDate(now.getDate() + 1)
        nextHour.setHours(0, 0, 0, 0)
        setCurrentRound(1) // 下一场是第1场
      } else {
        // 当前是0-22点，下一场是下一小时
        nextHour.setHours(now.getHours() + 1, 0, 0, 0)
        setCurrentRound(currentHour + 1) // 下一场的场次
      }

      const diff = nextHour.getTime() - now.getTime()
      setCountdown(Math.floor(diff / 1000))
    }

    // 初始化
    calculateCountdown()

    // 每秒更新一次
    const timer = setInterval(calculateCountdown, 1000)

    return () => clearInterval(timer)
  }, [])

  // 格式化时间显示
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <View className={`fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg border-b-3 border-sky-200 px-5 py-3 z-50 ${className}`}>
      <View className="flex items-center justify-between">
        <View className="flex items-center">
          <Text className="block text-3xl mr-3">⏰</Text>
          <View>
            <Text className="block text-gray-700 font-bold text-base mb-1">
              本场结束倒计时
            </Text>
            <View className="bg-gradient-to-r from-sky-400 to-blue-400 rounded-full px-4 py-2 shadow-md">
              <Text className="block text-white font-bold text-2xl">
                {formatTime(countdown)}
              </Text>
            </View>
          </View>
        </View>
        <View className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-full px-5 py-3 shadow-md border-2 border-pink-200">
          <Text className="block text-purple-500 font-bold text-sm">
            第 {currentRound} 场 / 23 🎉
          </Text>
        </View>
      </View>
    </View>
  )
}

export default CountdownBar
