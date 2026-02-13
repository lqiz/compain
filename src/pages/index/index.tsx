import { View, Text, Video } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { Network } from '@/network'
import { getUserNickname, getUserAge } from '@/utils/auth'

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
  useEffect(() => {
    const nickname = getUserNickname()
    const age = getUserAge()

    console.log('用户信息:', { nickname, age })

    if (!nickname || !age) {
      console.log('跳转到登录页')
      Taro.redirectTo({
        url: '/pages/login/index'
      })
      return
    }

    // 加载视频列表和排名
    loadData()
  }, [])

  // 倒计时逻辑
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date()
      const currentHour = now.getHours()

      const nextHour = new Date(now)

      if (currentHour >= 23) {
        nextHour.setDate(now.getDate() + 1)
        nextHour.setHours(0, 0, 0, 0)
        setCurrentRound(1)
      } else {
        nextHour.setHours(now.getHours() + 1, 0, 0, 0)
        setCurrentRound(currentHour + 1)
      }

      const diff = nextHour.getTime() - now.getTime()
      setCountdown(Math.floor(diff / 1000))
    }

    calculateCountdown()
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

  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true)

      console.log('开始加载数据')

      // 获取排名
      const rankingsRes = await Network.request({
        url: '/api/video/rankings',
        method: 'GET'
      })

      console.log('排名接口响应:', rankingsRes)

      if (rankingsRes.data.code === 200) {
        setRankings(rankingsRes.data.data)
      }

      // 获取视频列表
      const videosRes = await Network.request({
        url: '/api/video/list',
        method: 'GET'
      })

      console.log('视频列表接口响应:', videosRes)

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
        // 如果接口失败，使用模拟数据
        console.log('视频列表接口失败，使用模拟数据')
        setVideoList([
          {
            id: '1',
            nickname: '小明同学',
            age: 10,
            content: '今天作业太多了，写了好久都没写完，感觉好累😢',
            videoUrl: '',
            likeCount: 128,
            isLiked: false
          },
          {
            id: '2',
            nickname: '小红妹妹',
            age: 9,
            content: '妈妈今天给我买了新的画画本，好开心！🎨',
            videoUrl: '',
            likeCount: 256,
            isLiked: false
          },
          {
            id: '3',
            nickname: '小刚哥哥',
            age: 11,
            content: '今天在操场上踢足球，我们队赢了！⚽️',
            videoUrl: '',
            likeCount: 89,
            isLiked: false
          }
        ])
      }

      console.log('数据加载完成')
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

      console.log('点赞接口响应:', likeRes)

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

  // 跳转到发布页面
  const goToPublish = () => {
    Taro.navigateTo({
      url: '/pages/publish/index'
    })
  }

  return (
    <View className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {loading ? (
        <View className="flex items-center justify-center flex-1">
          <Text className="block text-sky-400 text-lg">🌈 加载中...</Text>
        </View>
      ) : (
        <>
          {/* 视频展示区域 - 占据约65%高度 */}
          <View className="flex-1 p-4 overflow-hidden">
            {videoList.length > 0 && (
              <View className="bg-white rounded-3xl p-4 shadow-lg border-2 border-sky-100 h-full flex flex-col">
                {/* 用户信息 */}
                <View className="flex items-center mb-3 flex-shrink-0">
                  <View className="w-10 h-10 bg-gradient-to-br from-sky-100 to-pink-100 rounded-full mr-3 flex items-center justify-center border-2 border-sky-200">
                    <Text className="block text-sky-500 font-bold">{videoList[0].age}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="block text-gray-700 font-bold text-sm">{videoList[0].nickname}</Text>
                    <View className="bg-sky-100 rounded-full px-2 py-0.5 w-fit mt-0.5">
                      <Text className="block text-sky-500 text-xs font-semibold">{videoList[0].age}岁小朋友</Text>
                    </View>
                  </View>
                </View>

                {/* 内容 */}
                <View className="mb-3 bg-gradient-to-br from-sky-50 to-pink-50 rounded-2xl p-3 flex-shrink-0">
                  <Text className="block text-gray-700 text-sm leading-relaxed">
                    {videoList[0].content}
                  </Text>
                </View>

                {/* 视频预览 */}
                <View className="flex-1 bg-gray-100 rounded-3xl overflow-hidden mb-3 shadow-md min-h-0">
                  {videoList[0].videoUrl ? (
                    <Video
                      src={videoList[0].videoUrl}
                      className="w-full h-full"
                      controls
                      showFullscreenBtn
                      showPlayBtn
                      showCenterPlayBtn
                      enableProgressGesture
                      onError={(e) => {
                        console.error('首页视频播放错误:', e)
                        console.error('视频URL:', videoList[0].videoUrl)
                      }}
                      onPlay={() => {
                        console.log('首页视频开始播放:', videoList[0].id)
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
                  className="flex items-center justify-center rounded-full py-2 px-4 shadow-md flex-shrink-0 bg-gradient-to-r from-sky-100 to-blue-100 border-2 border-sky-200"
                  onClick={() => handleLike(videoList[0].id)}
                >
                  <Text className="text-xl mr-2">🤍</Text>
                  <Text className="text-sm font-bold text-sky-500">
                    {videoList[0].likeCount} 个喜欢
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* 排行榜区域 - 占据约30%高度 */}
          <View className="h-[30%] px-4 pb-4 flex-shrink-0">
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

      {/* 浮动发布按钮 - 右下角固定 */}
      <View
        style={{
          position: 'fixed',
          right: '12px',
          bottom: '60px',
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

          <View
            style={{
              flex: 1
            }}
          >
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
    </View>
  )
}

export default IndexPage
