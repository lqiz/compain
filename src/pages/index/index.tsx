import { View, Text, Video, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { Network } from '@/network'
import { getUserNickname, getUserAge } from '@/utils/auth'
import CountdownBar from '@/components/CountdownBar'

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

  // 页面加载时获取用户信息和数据
  useEffect(() => {
    const nickname = getUserNickname()
    const age = getUserAge()

    if (!nickname || !age) {
      Taro.redirectTo({
        url: '/pages/login/index'
      })
      return
    }

    // 加载视频列表和排名
    loadData()
  }, [])

  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true)

      // 调用排名接口
      const rankingsRes = await Network.request({
        url: '/api/video/rankings',
        method: 'GET'
      })

      console.log('排名接口响应:', rankingsRes)

      if (rankingsRes.data.code === 200) {
        setRankings(rankingsRes.data.data)
      }

      // 使用模拟数据（因为没有获取视频列表的接口）
      setVideoList([
        {
          id: '1',
          nickname: '小明同学',
          age: 10,
          content: '今天作业太多了，写了好久都没写完，感觉好累😢',
          videoUrl: 'https://via.placeholder.com/360x640/f97316/ffffff?text=Video+1',
          likeCount: 128,
          isLiked: false
        },
        {
          id: '2',
          nickname: '小红妹妹',
          age: 9,
          content: '妈妈今天给我买了新的画画本，好开心！🎨',
          videoUrl: 'https://via.placeholder.com/360x640/f97316/ffffff?text=Video+2',
          likeCount: 256,
          isLiked: false
        },
        {
          id: '3',
          nickname: '小刚哥哥',
          age: 11,
          content: '今天在操场上踢足球，我们队赢了！⚽️',
          videoUrl: 'https://via.placeholder.com/360x640/f97316/ffffff?text=Video+3',
          likeCount: 89,
          isLiked: false
        }
      ])
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
      // 调用后端点赞接口
      const likeRes = await Network.request({
        url: '/api/video/like',
        method: 'POST',
        data: { videoId }
      })

      console.log('点赞接口响应:', likeRes)

      if (likeRes.data.code === 200) {
        // 更新前端状态
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

        // 刷新排名数据
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
    <View className="min-h-screen bg-orange-50 flex flex-col">
      <CountdownBar />

      <View className="flex-1 pb-32">
        {/* 顶部 */}
        <View className="px-5 py-4 bg-white sticky top-0 z-10 shadow-sm">
          <View className="flex justify-between items-center">
            <Text className="block text-xl font-bold text-gray-800">全部视频</Text>
            <Button
              className="bg-orange-500 text-white text-xs px-4 py-2 rounded-full"
              onClick={goToPublish}
            >
              发布
            </Button>
          </View>
        </View>

        {loading ? (
          <View className="flex items-center justify-center py-20">
            <Text className="block text-gray-400 text-sm">加载中...</Text>
          </View>
        ) : (
          <>
            {/* 视频列表 */}
            <View className="p-4 space-y-4">
              {videoList.map(video => (
                <View
                  key={video.id}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >
                  {/* 用户信息 */}
                  <View className="flex items-center mb-3">
                    <View className="w-10 h-10 bg-orange-200 rounded-full mr-3 flex items-center justify-center">
                      <Text className="block text-orange-500 font-bold text-sm">{video.age}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="block text-gray-800 font-semibold text-sm">{video.nickname}</Text>
                      <Text className="block text-gray-500 text-xs">{video.age}岁</Text>
                    </View>
                  </View>

                  {/* 内容 */}
                  <View className="mb-3">
                    <Text className="block text-gray-800 text-sm leading-relaxed">
                      {video.content}
                    </Text>
                  </View>

                  {/* 视频预览 */}
                  <View className="aspect-[9/16] bg-gray-100 rounded-xl overflow-hidden mb-3">
                    <Video
                      src={video.videoUrl}
                      className="w-full h-full"
                      controls
                      objectFit="cover"
                    />
                  </View>

                  {/* 点赞按钮 */}
                  <View
                    className={`flex items-center justify-center rounded-full py-2 px-4 ${
                      video.isLiked ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'
                    }`}
                    onClick={() => handleLike(video.id)}
                  >
                    <Text className="text-lg mr-2">{video.isLiked ? '❤️' : '🤍'}</Text>
                    <Text className={`text-sm font-medium ${video.isLiked ? 'text-red-500' : 'text-orange-500'}`}>
                      {video.likeCount}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* 用户排名 */}
            <View className="px-4 pb-4">
              <View className="bg-white rounded-2xl p-4 shadow-sm">
                <Text className="block text-gray-800 font-semibold text-base mb-4">
                  🏆 用户排行榜
                </Text>

                <View className="space-y-3">
                  {rankings.map(item => (
                    <View
                      key={item.rank}
                      className="flex items-center justify-between py-2"
                    >
                      <View className="flex items-center">
                        <View
                          className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center ${
                            item.rank === 1
                              ? 'bg-yellow-400'
                              : item.rank === 2
                              ? 'bg-gray-300'
                              : item.rank === 3
                              ? 'bg-orange-400'
                              : 'bg-gray-200'
                          }`}
                        >
                          <Text className="block text-white font-bold text-sm">{item.rank}</Text>
                        </View>
                        <Text className="block text-gray-800 text-sm font-medium">{item.nickname}</Text>
                      </View>
                      <View className="flex items-center">
                        <Text className="block text-orange-500 font-bold text-sm">{item.points}</Text>
                        <Text className="block text-gray-400 text-xs ml-1">积分</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </>
        )}
      </View>

      {/* 浮动发布按钮 - 右下角固定 */}
      <View
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '80px',
          zIndex: 100
        }}
      >
        <View
          className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full px-6 py-3 shadow-lg"
          style={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row'
          }}
          onClick={goToPublish}
        >
          <Text className="block text-2xl mr-2">📹</Text>
          <Text className="block text-white font-bold text-base">开始诉苦</Text>
        </View>
      </View>
    </View>
  )
}

export default IndexPage
