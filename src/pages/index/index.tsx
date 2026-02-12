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
          videoUrl: 'https://via.placeholder.com/360x640/4FC3F7/ffffff?text=Video+1',
          likeCount: 128,
          isLiked: false
        },
        {
          id: '2',
          nickname: '小红妹妹',
          age: 9,
          content: '妈妈今天给我买了新的画画本，好开心！🎨',
          videoUrl: 'https://via.placeholder.com/360x640/81C784/ffffff?text=Video+2',
          likeCount: 256,
          isLiked: false
        },
        {
          id: '3',
          nickname: '小刚哥哥',
          age: 11,
          content: '今天在操场上踢足球，我们队赢了！⚽️',
          videoUrl: 'https://via.placeholder.com/360x640/FFB74D/ffffff?text=Video+3',
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
    <View className="min-h-screen bg-gray-50 flex flex-col">
      <CountdownBar />

      <View className="flex-1 pb-32">
        {/* 顶部 */}
        <View className="px-5 py-5 bg-white shadow-md border-b-3 border-sky-200">
          <View className="flex justify-between items-center">
            <View>
              <Text className="block text-2xl font-bold text-gray-700">📺 全部视频</Text>
              <Text className="block text-sky-400 text-sm">小朋友们的心里话</Text>
            </View>
            <Button
              className="bg-gradient-to-r from-sky-400 to-blue-400 text-white text-sm px-6 py-3 rounded-3xl shadow-md"
              onClick={goToPublish}
            >
              ✨ 发布
            </Button>
          </View>
        </View>

        {loading ? (
          <View className="flex items-center justify-center py-20">
            <Text className="block text-sky-400 text-lg">🌈 加载中...</Text>
          </View>
        ) : (
          <>
            {/* 视频列表 */}
            <View className="p-5 space-y-5">
              {videoList.map(video => (
                <View
                  key={video.id}
                  className="bg-white rounded-3xl p-5 shadow-lg border-2 border-sky-100"
                >
                  {/* 用户信息 */}
                  <View className="flex items-center mb-4">
                    <View className="w-12 h-12 bg-gradient-to-br from-sky-100 to-pink-100 rounded-full mr-4 flex items-center justify-center border-2 border-sky-200">
                      <Text className="block text-sky-500 font-bold text-lg">{video.age}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="block text-gray-700 font-bold text-base">{video.nickname}</Text>
                      <View className="bg-sky-100 rounded-full px-3 py-1 w-fit mt-1">
                        <Text className="block text-sky-500 text-xs font-semibold">{video.age}岁小朋友</Text>
                      </View>
                    </View>
                  </View>

                  {/* 内容 */}
                  <View className="mb-4 bg-gradient-to-br from-sky-50 to-pink-50 rounded-2xl p-4">
                    <Text className="block text-gray-700 text-base leading-relaxed">
                      {video.content}
                    </Text>
                  </View>

                  {/* 视频预览 */}
                  <View className="aspect-[9/16] bg-gray-100 rounded-3xl overflow-hidden mb-4 shadow-md">
                    <Video
                      src={video.videoUrl}
                      className="w-full h-full"
                      controls
                      objectFit="cover"
                    />
                  </View>

                  {/* 点赞按钮 */}
                  <View
                    className={`flex items-center justify-center rounded-full py-3 px-6 shadow-md ${
                      video.isLiked ? 'bg-gradient-to-r from-pink-300 to-red-300 border-2 border-pink-300' : 'bg-gradient-to-r from-sky-100 to-blue-100 border-2 border-sky-200'
                    }`}
                    onClick={() => handleLike(video.id)}
                  >
                    <Text className="text-2xl mr-3">{video.isLiked ? '❤️' : '🤍'}</Text>
                    <Text className={`text-base font-bold ${video.isLiked ? 'text-red-500' : 'text-sky-500'}`}>
                      {video.likeCount} 个喜欢
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* 用户排名 */}
            <View className="px-5 pb-5">
              <View className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-5 shadow-lg border-2 border-purple-200">
                <Text className="block text-gray-700 font-bold text-lg mb-4">
                  🏆 小朋友排行榜
                </Text>

                <View className="space-y-3">
                  {rankings.map(item => (
                    <View
                      key={item.rank}
                      className="flex items-center justify-between bg-white rounded-2xl p-3 shadow-sm border border-purple-100"
                    >
                      <View className="flex items-center">
                        <View
                          className={`w-10 h-10 rounded-full mr-3 flex items-center justify-center ${
                            item.rank === 1
                              ? 'bg-gradient-to-br from-yellow-300 to-yellow-400 border-2 border-yellow-300'
                              : item.rank === 2
                              ? 'bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-gray-300'
                              : item.rank === 3
                              ? 'bg-gradient-to-br from-orange-300 to-orange-400 border-2 border-orange-300'
                              : 'bg-gradient-to-br from-purple-200 to-purple-300 border-2 border-purple-200'
                          }`}
                        >
                          <Text className="block text-white font-bold text-sm">{item.rank}</Text>
                        </View>
                        <Text className="block text-gray-700 text-base font-bold">{item.nickname}</Text>
                      </View>
                      <View className="flex items-center bg-sky-100 rounded-full px-3 py-1">
                        <Text className="block text-sky-500 font-bold text-sm">{item.points}</Text>
                        <Text className="block text-sky-400 text-xs ml-1">分</Text>
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
          className="bg-gradient-to-r from-orange-300 to-orange-400 rounded-full px-8 py-4 shadow-xl border-2 border-orange-200"
          style={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row'
          }}
          onClick={goToPublish}
        >
          <Text className="text-3xl mr-3">📹</Text>
          <Text className="block text-white font-bold text-lg">开始诉苦</Text>
        </View>
      </View>
    </View>
  )
}

export default IndexPage
