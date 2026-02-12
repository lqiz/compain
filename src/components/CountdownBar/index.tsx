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
    const calculateCountdown = () => {
      const now = new Date()
      const nextHour = new Date(now)
      nextHour.setHours(now.getHours() + 1, 0, 0, 0)

      const diff = nextHour.getTime() - now.getTime()
      setCountdown(Math.floor(diff / 1000))
      setCurrentRound(now.getHours() + 1)
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
    <View className={`fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 px-5 py-3 ${className}`}>
      <View className="flex items-center justify-between">
        <View className="flex items-center">
          <Text className="block text-2xl mr-2">⏰</Text>
          <View>
            <Text className="block text-gray-800 font-semibold text-sm">
              本场结束倒计时
            </Text>
            <Text className="block text-orange-500 font-bold text-xl">
              {formatTime(countdown)}
            </Text>
          </View>
        </View>
        <View className="bg-orange-100 rounded-full px-3 py-1">
          <Text className="block text-orange-600 text-xs">
            第 {currentRound} 场
          </Text>
        </View>
      </View>
    </View>
  )
}

export default CountdownBar
