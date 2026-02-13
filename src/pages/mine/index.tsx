import { View, Text, Video } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { Network } from '@/network'
import { getUserNickname, getUserAge, getUserPoints, getUserLevel, logout, dailyCheckin, hasCheckedInToday, getCheckinDays } from '@/utils/auth'
import { getLevelDisplayText, getLevelBadgeClass, getAllCharacters } from '@/utils/level'

interface UserVideo {
  id: string
  title: string
  videoUrl: string
  createdAt: string
  isComposed: boolean
  composedWith?: string[]
}

interface CharacterItem {
  level: string
  name: string
  emoji: string
  description: string
  unlockPoints: number
}

const MinePage = () => {
  const [userNickname, setUserNickname] = useState<string>('')
  const [userAge, setUserAge] = useState<number>(0)
  const [userPoints, setUserPoints] = useState<number>(0)
  const [levelInfo, setLevelInfo] = useState<any>(null)
  const [myVideos, setMyVideos] = useState<UserVideo[]>([])
  const [composedVideos, setComposedVideos] = useState<UserVideo[]>([])
  const [characters, setCharacters] = useState<CharacterItem[]>([])
  const [hasCheckedIn, setHasCheckedIn] = useState<boolean>(false)
  const [checkinDays, setCheckinDays] = useState<number>(0)
  const [checkinLoading, setCheckinLoading] = useState<boolean>(false)

  // 页面加载时获取用户信息
  useEffect(() => {
    const nickname = getUserNickname()
    const age = getUserAge()
    const points = getUserPoints()
    const level = getUserLevel()

    if (!nickname || !age) {
      // 未登录，跳转到登录页
      Taro.redirectTo({
        url: '/pages/login/index'
      })
      return
    }

    setUserNickname(nickname)
    setUserAge(age)
    setUserPoints(points)
    setLevelInfo(level)

    // 加载卡通形象
    setCharacters(getAllCharacters())

    // 加载签到状态
    loadCheckinStatus()

    // 加载用户视频数据
    loadUserVideos()
  }, [])

  // 每次页面显示时刷新用户视频数据（解决从发布页返回后不显示的问题）
  useDidShow(() => {
    loadUserVideos()
  })

  // 加载签到状态
  const loadCheckinStatus = () => {
    setHasCheckedIn(hasCheckedInToday())
    setCheckinDays(getCheckinDays())
  }

  // 加载用户视频数据
  const loadUserVideos = async () => {
    try {
      const nickname = getUserNickname()

      console.log('正在加载用户视频, nickname:', nickname)

      // 从后端API获取用户发布的视频
      const response = await Network.request({
        url: '/api/video/my',
        method: 'GET',
        data: {
          nickname
        }
      })

      console.log('用户视频接口响应:', response)

      if (response.data.code === 200) {
        const videos = response.data.data.map((video: any) => ({
          id: video.id,
          title: video.content,
          videoUrl: video.videoUrl,
          createdAt: new Date(video.createdAt).toLocaleDateString('zh-CN'),
          isComposed: false
        }))

        console.log('用户视频列表:', videos)
        setMyVideos(videos)
      } else {
        // 接口失败，使用空列表
        console.log('用户视频接口失败，使用空列表')
        setMyVideos([])
      }

      // 合成的视频暂时保留模拟数据
      const mockComposedVideos: UserVideo[] = [
        {
          id: '2',
          title: '第1场合成视频',
          videoUrl: '',
          createdAt: '2024-01-14',
          isComposed: true,
          composedWith: ['小明', '小红', '小刚']
        }
      ]

      setComposedVideos(mockComposedVideos)
    } catch (error) {
      console.error('加载用户视频失败:', error)
      // 出错时使用空列表
      setMyVideos([])
      setComposedVideos([])
    }
  }

  // 处理签到
  const handleCheckin = () => {
    if (checkinLoading) return

    setCheckinLoading(true)

    try {
      const result = dailyCheckin()

      if (result.success) {
        // 签到成功
        Taro.showToast({
          title: `${result.message}`,
          icon: 'success',
          duration: 2000
        })

        // 更新状态
        loadCheckinStatus()
        setUserPoints(result.totalPoints)
        setLevelInfo(getUserLevel())
      } else {
        // 今日已签到
        Taro.showToast({
          title: result.message,
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('签到失败:', error)
      Taro.showToast({
        title: '签到失败，请重试',
        icon: 'none'
      })
    } finally {
      setCheckinLoading(false)
    }
  }

  // 退出登录
  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          logout()
        }
      }
    })
  }

  return (
    <View className="min-h-screen bg-orange-50 p-5 pb-20">
      {/* 用户信息头部 */}
      <View className="flex items-center justify-between mb-6">
        <View className="flex items-center">
          <View className="w-16 h-16 bg-orange-200 rounded-full mr-4 flex items-center justify-center">
            <Text className="block text-orange-500 font-bold text-2xl">{userAge}</Text>
          </View>
          <View>
            <Text className="block text-gray-800 font-bold text-xl mb-1">{userNickname}</Text>
            <Text className="block text-gray-500 text-sm">{userAge}岁 · 诉苦大会</Text>
          </View>
        </View>

        <View
          className="bg-white border border-orange-200 rounded-full px-4 py-2"
          onClick={handleLogout}
        >
          <Text className="block text-orange-500 text-sm">退出</Text>
        </View>
      </View>

      {/* 每日签到卡片 */}
      <View className="bg-gradient-to-br from-orange-400 to-yellow-400 rounded-2xl p-5 mb-6 shadow-lg border-2 border-orange-300">
        <View className="flex items-center justify-between mb-4">
          <View>
            <Text className="block text-white font-bold text-lg">每日签到</Text>
            <Text className="block text-white/80 text-sm mt-1">
              {hasCheckedIn ? '今日已签到' : '点击签到获取积分'}
            </Text>
          </View>
          <View className="bg-white/20 rounded-full px-4 py-2">
            <Text className="block text-white font-bold text-base">
              连续 {checkinDays} 天
            </Text>
          </View>
        </View>

        {hasCheckedIn ? (
          <View className="bg-white/20 rounded-2xl p-4 flex items-center justify-center">
            <Text className="block text-3xl mr-2">✅</Text>
            <Text className="block text-white font-bold text-base">今日已完成签到</Text>
          </View>
        ) : (
          <View
            className="bg-white rounded-2xl py-4 flex items-center justify-center shadow-md active:scale-95 transition-transform"
            onClick={handleCheckin}
          >
            <Text className="block text-2xl mr-2">🎁</Text>
            <Text className="block text-orange-500 font-bold text-lg">
              {checkinLoading ? '签到中...' : '立即签到 +2 积分'}
            </Text>
          </View>
        )}

        {/* 签到提示 */}
        <View className="mt-3 flex items-center justify-center">
          <Text className="block text-white/90 text-xs">
            每日签到可获得 2 积分，连续签到更有惊喜！
          </Text>
        </View>
      </View>

      {/* 等级信息卡片 */}
      {levelInfo && (
        <View className="bg-white border-2 border-orange-200 rounded-2xl p-5 mb-6 shadow-sm">
          <View className="flex justify-between items-center mb-3">
            <Text className="block text-gray-800 font-semibold text-base">我的等级</Text>
            <View className={`${getLevelBadgeClass(levelInfo.level)} rounded-full px-3 py-1`}>
              <Text className="block text-xs font-semibold">
                {getLevelDisplayText(levelInfo.level)}
              </Text>
            </View>
          </View>

          {/* 卡通形象展示 */}
          <View className="flex items-center justify-center mb-4">
            <View className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl p-6 text-center">
              <Text className="block text-6xl mb-2">{levelInfo.character.emoji}</Text>
              <Text className="block text-gray-800 font-bold text-lg mb-1">
                {levelInfo.character.name}
              </Text>
              <Text className="block text-gray-600 text-xs">
                {levelInfo.character.description}
              </Text>
            </View>
          </View>

          <View className="flex justify-between items-center mb-3">
            <View>
              <Text className="block text-gray-500 text-xs">当前积分</Text>
              <Text className="block text-orange-500 font-bold text-2xl">{userPoints}</Text>
            </View>
            {levelInfo.pointsToNextLevel > 0 && (
              <View className="text-right">
                <Text className="block text-gray-500 text-xs">升级还需</Text>
                <Text className="block text-gray-600 font-semibold">{levelInfo.pointsToNextLevel} 积分</Text>
              </View>
            )}
          </View>

          {levelInfo.pointsToNextLevel > 0 && (
            <View className="w-full h-3 bg-orange-100 rounded-full overflow-hidden">
              <View
                className="h-full bg-orange-500 transition-all"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </View>
          )}

          {levelInfo.pointsToNextLevel === 0 && (
            <View className="bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl p-3 mt-3">
              <Text className="block text-white text-center font-semibold text-sm">
                🎉 恭喜你已达到最高等级！
              </Text>
            </View>
          )}
        </View>
      )}

      {/* 卡通形象收藏馆 */}
      <View className="mb-6">
        <Text className="block text-gray-800 font-bold text-xl mb-4">卡通形象收藏馆</Text>

        <View className="grid grid-cols-2 gap-3">
          {characters.map((char) => {
            const isUnlocked = userPoints >= char.unlockPoints
            const isCurrent = levelInfo?.level === char.level

            return (
              <View
                key={char.level}
                className={`rounded-2xl p-4 text-center ${
                  isCurrent
                    ? 'bg-gradient-to-br from-orange-400 to-yellow-400 border-2 border-orange-500'
                    : isUnlocked
                    ? 'bg-white border-2 border-orange-200'
                    : 'bg-gray-100 border-2 border-gray-200'
                }`}
              >
                <Text className={`block text-4xl mb-2 ${isUnlocked ? '' : 'opacity-50'}`}>
                  {isUnlocked ? char.emoji : '🔒'}
                </Text>
                <Text className={`block font-bold text-sm mb-1 ${isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                  {isUnlocked ? char.name : '???'}
                </Text>
                <Text className={`block text-xs ${isUnlocked ? 'text-gray-500' : 'text-gray-400'}`}>
                  {isUnlocked ? `${char.unlockPoints}积分` : `${char.unlockPoints}积分解锁`}
                </Text>
                {isCurrent && (
                  <View className="mt-2 bg-white rounded-full px-2 py-1">
                    <Text className="block text-orange-600 text-xs font-semibold">当前</Text>
                  </View>
                )}
              </View>
            )
          })}
        </View>
      </View>

      {/* 我发布的视频 */}
      <View className="mb-6">
        <View className="flex items-center justify-between mb-4">
          <Text className="block text-gray-800 font-bold text-xl">我发布的视频</Text>
          <View className="bg-orange-100 rounded-full px-3 py-1">
            <Text className="block text-orange-600 text-xs">{myVideos.length} 个</Text>
          </View>
        </View>

        {myVideos.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <Text className="block text-5xl mb-3">📹</Text>
            <Text className="block text-gray-600 text-base mb-2">还没有发布视频</Text>
            <Text className="block text-gray-500 text-sm">
              去&ldquo;全部&rdquo;页面发布你的第一个心里话吧
            </Text>
          </View>
        ) : (
          <View className="space-y-4">
            {myVideos.map((video) => (
              <View key={video.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <View className="aspect-[9/16] bg-gray-100 rounded-xl overflow-hidden mb-3">
                  {video.videoUrl ? (
                    <Video
                      src={video.videoUrl}
                      className="w-full h-full"
                      controls
                      showFullscreenBtn
                      showPlayBtn
                      showCenterPlayBtn
                      enableProgressGesture
                      onError={(e) => {
                        console.error('视频播放错误:', e)
                        console.error('视频URL:', video.videoUrl)
                      }}
                      onPlay={() => {
                        console.log('视频开始播放:', video.id)
                      }}
                    />
                  ) : (
                    <View className="w-full h-full flex items-center justify-center">
                      <Text className="block text-gray-400 text-base">视频预览</Text>
                    </View>
                  )}
                </View>
                <Text className="block text-gray-800 font-semibold text-base mb-1">{video.title}</Text>
                <Text className="block text-gray-500 text-xs">{video.createdAt}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 合成的视频 */}
      <View className="mb-6">
        <View className="flex items-center justify-between mb-4">
          <Text className="block text-gray-800 font-bold text-xl">合成的视频</Text>
          <View className="bg-purple-100 rounded-full px-3 py-1">
            <Text className="block text-purple-600 text-xs">{composedVideos.length} 个</Text>
          </View>
        </View>

        {composedVideos.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <Text className="block text-5xl mb-3">🎬</Text>
            <Text className="block text-gray-600 text-base mb-2">还没有合成视频</Text>
            <Text className="block text-gray-500 text-sm">
              每小时结束后系统会自动合成视频
            </Text>
          </View>
        ) : (
          <View className="space-y-4">
            {composedVideos.map((video) => (
              <View
                key={video.id}
                className="bg-white rounded-2xl p-4 shadow-sm border-2 border-purple-200"
              >
                <View className="flex items-center justify-between mb-3">
                  <View className="flex items-center">
                    <Text className="block text-2xl mr-2">🎬</Text>
                    <Text className="block text-purple-600 font-semibold text-sm">合成视频</Text>
                  </View>
                  <View className="bg-purple-100 rounded-full px-2 py-1">
                    <Text className="block text-purple-700 text-xs">
                      包含 {video.composedWith?.length || 0} 个小朋友
                    </Text>
                  </View>
                </View>

                <View className="aspect-[9/16] bg-gray-100 rounded-xl overflow-hidden mb-3">
                  {video.videoUrl ? (
                    <Video src={video.videoUrl} className="w-full h-full" controls />
                  ) : (
                    <View className="w-full h-full flex items-center justify-center">
                      <Text className="block text-gray-400 text-base">视频预览</Text>
                    </View>
                  )}
                </View>

                <View className="flex items-center justify-between">
                  <Text className="block text-gray-500 text-xs">
                    {video.createdAt}
                  </Text>
                  <View className="flex items-center">
                    <Text className="block text-green-500 text-xs mr-1">✓</Text>
                    <Text className="block text-gray-500 text-xs">已分享到抖音</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  )
}

export default MinePage
