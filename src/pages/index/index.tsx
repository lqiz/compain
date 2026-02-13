import { View, Text, Video } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { Network } from '@/network'

interface VideoCard {
  id: string
  nickname: string
  age: number
  content: string
  videoUrl: string
  likeCount: number
  isLiked: boolean
}

interface RankingItem {
  rank: number
  nickname: string
  points: number
}

const IndexPage = () => {
  const [videoList, setVideoList] = useState<VideoCard[]>([])
  const [rankings, setRankings] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [countdown, setCountdown] = useState<number>(0)
  const [currentRound, setCurrentRound] = useState<number>(1)

  // 页面加载时获取用户信息和数据
  Taro.useLoad(() => {
    loadData()

    // 启动倒计时（每60分钟一场）
    const timer = setInterval(() => {
      const now = new Date()
      const minutes = now.getHours() * 60 + now.getMinutes()
      const countdownValue = 60 - (minutes % 60)
      setCountdown(countdownValue)
      setCurrentRound(Math.ceil((minutes + 1) / 60))
    }, 1000)

    // 清理定时器
    return () => {
      clearInterval(timer)
    }
  })

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

  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true)

      // 获取排名
      const rankingsRes = await Network.request({
        url: '/api/video/rankings',
        method: 'GET'
      })

      if (rankingsRes.data.code === 200) {
        setRankings(rankingsRes.data.data)
      }

      // 获取视频列表
      const videosRes = await Network.request({
        url: '/api/video/list',
        method: 'GET'
      })

      if (videosRes.data.code === 200) {
        const videoListData = videosRes.data.data.map((video: any) => ({
          id: video.id,
          nickname: video.nickname,
          age: video.age,
          content: video.content,
          videoUrl: video.videoUrl,
          likeCount: video.likeCount,
          isLiked: false
        }))
        setVideoList(videoListData)
      } else {
        setVideoList([])
      }
    } catch (error) {
      console.error('加载数据失败:', error)
      Taro.showToast({
        title: '加载数据失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  // 处理点赞
  const handleLike = async (videoId: string) => {
    try {
      const likeRes = await Network.request({
        url: '/api/video/like',
        method: 'POST',
        data: { videoId }
      })

      if (likeRes.data.code === 200) {
        setVideoList(prevList =>
          prevList.map(video => {
            if (video.id === videoId) {
              return {
                ...video,
                likeCount: likeRes.data.data.likeCount,
                isLiked: likeRes.data.data.isLiked
              }
            }
            return video
          })
        )

        loadData()
      } else {
        throw new Error(likeRes.data.msg || '点赞失败')
      }
    } catch (error) {
      console.error('点赞失败:', error)
      Taro.showToast({
        title: '点赞失败，请重试',
        icon: 'none'
      })
    }
  }

  // 跳转到发布页
  const goToPublish = () => {
    Taro.navigateTo({
      url: '/pages/publish/index'
    })
  }

  return (
    <>
      {/* 主容器 */}
      <View className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        {loading ? (
          <View className="flex items-center justify-center flex-1">
            <Text className="block text-sky-400 text-lg">🌈 加载中...</Text>
          </View>
        ) : (
          <>
            {/* 视频Feed区域 - 可滚动 */}
            <View className="flex-1 overflow-y-auto pb-4">
              {videoList.length === 0 ? (
                <View className="flex items-center justify-center h-full">
                  <Text className="block text-gray-400 text-base">暂无视频，快去发布吧！</Text>
                </View>
              ) : (
                <View className="p-4 space-y-4">
                  {videoList.map((video, index) => (
                    <View key={video.id} className="bg-white rounded-3xl p-4 shadow-lg border-2 border-sky-100">
                      {/* 用户信息 */}
                      <View className="flex items-center mb-3">
                        <View className="w-10 h-10 bg-gradient-to-br from-sky-100 to-pink-100 rounded-full mr-3 flex items-center justify-center border-2 border-sky-200">
                          <Text className="block text-sky-500 font-bold">{video.age}</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="block text-gray-700 font-bold text-sm">{video.nickname}</Text>
                          <View className="bg-sky-100 rounded-full px-2 py-0.5 w-fit mt-0.5">
                            <Text className="block text-sky-500 text-xs font-semibold">{video.age}岁小朋友</Text>
                          </View>
                        </View>
                      </View>

                      {/* 内容 */}
                      <View className="mb-3 bg-gradient-to-br from-sky-50 to-pink-50 rounded-2xl p-3">
                        <Text className="block text-gray-700 text-sm leading-relaxed">
                          {video.content}
                        </Text>
                      </View>

                      {/* 视频预览 */}
                      <View className="aspect-video bg-gray-100 rounded-3xl overflow-hidden mb-3 shadow-md">
                        {video.videoUrl ? (
                          <Video
                            src={video.videoUrl}
                            className="w-full h-full"
                            controls
                            onError={(e) => {
                              console.error(`视频${index + 1}播放错误:`, e.detail)
                              console.error('视频URL:', video.videoUrl)
                            }}
                          />
                        ) : (
                          <View className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 to-pink-50">
                            <Text className="block text-4xl mb-2">🎬</Text>
                            <Text className="block text-gray-500 text-xs">视频加载中...</Text>
                          </View>
                        )}
                      </View>

                      {/* 点赞按钮 */}
                      <View
                        className="flex items-center justify-center rounded-full py-2 px-4 shadow-md bg-gradient-to-r from-sky-100 to-blue-100 border-2 border-sky-200"
                        onClick={() => handleLike(video.id)}
                      >
                        <Text className="text-xl mr-2">🤍</Text>
                        <Text className="text-sm font-bold text-sky-500">
                          {video.likeCount} 个喜欢
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* 排行榜区域 - 固定在底部 */}
            <View className="h-[30%] px-4 pb-4 flex-shrink-0 border-t-2 border-gray-100">
              <View className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-4 shadow-lg border-2 border-purple-200 h-full flex flex-col">
                <Text className="block text-gray-700 font-bold text-base mb-3 flex-shrink-0">
                  🏆 小朋友排行榜
                </Text>

                <View className="space-y-2 overflow-y-auto flex-1">
                  {rankings.slice(0, 5).map(item => (
                    <View
                      key={item.rank}
                      className="flex items-center justify-between bg-white rounded-2xl p-2 shadow-sm border border-purple-100 flex-shrink-0"
                    >
                      <View className="flex items-center">
                        <View
                          className={`w-8 h-8 rounded-full mr-2 flex items-center justify-center flex-shrink-0 ${
                            item.rank === 1
                              ? 'bg-gradient-to-br from-yellow-300 to-yellow-400 border-2 border-yellow-300'
                              : item.rank === 2
                              ? 'bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-gray-300'
                              : item.rank === 3
                              ? 'bg-gradient-to-br from-orange-300 to-orange-400 border-2 border-orange-300'
                              : 'bg-gradient-to-br from-purple-200 to-purple-300 border-2 border-purple-200'
                          }`}
                        >
                          <Text className="block text-white font-bold text-xs">{item.rank}</Text>
                        </View>
                        <Text className="block text-gray-700 text-sm font-bold truncate">{item.nickname}</Text>
                      </View>
                      <View className="flex items-center bg-sky-100 rounded-full px-2 py-0.5 flex-shrink-0">
                        <Text className="block text-sky-500 font-bold text-xs">{item.points}</Text>
                        <Text className="block text-sky-400 text-xs ml-0.5">分</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </>
        )}
      </View>

      {/* 浮动发布按钮 - 右下角固定，在主容器外面 */}
      <View
        style={{
          position: 'fixed',
          right: '12px',
          bottom: '70px',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <View
          className="bg-gradient-to-r from-orange-400 via-orange-500 to-pink-500 rounded-full px-5 py-3 shadow-xl border-2 border-orange-300"
          style={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            backdropFilter: 'blur(10px)',
            background: 'linear-gradient(135deg, #FFB74D 0%, #FF8A65 50%, #FF8A80 100%)'
          }}
          onClick={goToPublish}
        >
          <View
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}
          >
            <Text className="text-2xl">📹</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text className="block text-white font-bold text-lg">开始诉苦</Text>
            <Text className="block text-white/90 text-xs mt-0.5">发布你的心里话</Text>
          </View>

          {/* 倒计时显示 */}
          <View
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              borderRadius: '16px',
              padding: '6px 12px',
              backdropFilter: 'blur(5px)'
            }}
          >
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Text className="block text-white font-bold text-xl">
                {formatTime(countdown)}
              </Text>
              <Text className="block text-white/80 text-xs mt-0.5">
                第 {currentRound} 场
              </Text>
            </View>
          </View>
        </View>
      </View>
    </>
  )
}

export default IndexPage
