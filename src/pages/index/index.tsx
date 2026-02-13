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

  // 页面加载时获取数据
  Taro.useLoad(() => {
    loadData()
  })

  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true)

      // 并行获取排名和视频列表
      const [rankingsRes, videosRes] = await Promise.all([
        Network.request({
          url: '/api/video/rankings',
          method: 'GET'
        }),
        Network.request({
          url: '/api/video/list',
          method: 'GET'
        })
      ])

      if (rankingsRes.data.code === 200) {
        setRankings(rankingsRes.data.data)
      }

      if (videosRes.data.code === 200) {
        const videoListData = videosRes.data.data.map((video: any) => ({
          id: video.id,
          nickname: video.nickname,
          age: video.age,
          content: video.content,
          videoUrl: video.videoUrl,
          likeCount: video.likeCount || 0,
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
        Taro.showToast({
          title: likeRes.data.msg || '操作失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('点赞失败:', error)
      Taro.showToast({
        title: '点赞失败',
        icon: 'none'
      })
    }
  }

  // 跳转到发布页
  const handlePublish = () => {
    Taro.navigateTo({
      url: '/pages/publish/index'
    })
  }

  return (
    <View className="h-screen bg-gray-50 flex flex-col">
      {loading ? (
        <View className="flex items-center justify-center flex-1">
          <Text className="block text-sky-400 text-lg">🌈 加载中...</Text>
        </View>
      ) : (
        <>
          {/* 视频Feed流 - 可滚动区域 */}
          <View className="flex-1 overflow-y-auto" style={{ paddingBottom: '220px' }}>
            {videoList.length === 0 ? (
              <View className="flex items-center justify-center h-full">
                <Text className="block text-gray-400 text-base">暂无视频，快去发布吧！</Text>
              </View>
            ) : (
              <View className="p-3 space-y-3">
                {videoList.map((video, index) => (
                  <View key={video.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                    {/* 用户信息 - 紧凑设计 */}
                    <View className="flex items-center mb-2">
                      <View className="w-8 h-8 bg-gradient-to-br from-sky-100 to-pink-100 rounded-full mr-2 flex items-center justify-center flex-shrink-0">
                        <Text className="block text-sky-500 font-bold text-xs">{video.age}</Text>
                      </View>
                      <View className="flex-1 min-w-0">
                        <Text className="block text-gray-700 font-bold text-sm truncate">{video.nickname}</Text>
                        <Text className="block text-sky-400 text-xs">{video.age}岁</Text>
                      </View>
                    </View>

                    {/* 内容 */}
                    <View className="mb-2 bg-sky-50 rounded-xl p-2">
                      <Text className="block text-gray-700 text-xs leading-relaxed line-clamp-2">
                        {video.content}
                      </Text>
                    </View>

                    {/* 视频预览 - 小尺寸 */}
                    <View className="h-24 bg-gray-100 rounded-xl overflow-hidden mb-2">
                      {video.videoUrl ? (
                        <Video
                          src={video.videoUrl}
                          className="w-full h-full object-cover"
                          controls
                          onError={(e) => {
                            console.error(`视频${index + 1}播放错误:`, e.detail)
                          }}
                        />
                      ) : (
                        <View className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 to-pink-50">
                          <Text className="block text-2xl">🎬</Text>
                        </View>
                      )}
                    </View>

                    {/* 点赞按钮 */}
                    <View
                      className="flex items-center justify-center rounded-full py-1.5 px-3 bg-sky-50 border border-sky-200"
                      onClick={() => handleLike(video.id)}
                    >
                      <Text className="text-base mr-1">{video.isLiked ? '❤️' : '🤍'}</Text>
                      <Text className="text-xs font-bold text-sky-500">
                        {video.likeCount}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* 排行榜 - 底部固定 */}
          <View
            style={{
              position: 'fixed',
              bottom: '56px',
              left: 0,
              right: 0,
              height: '200px',
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e5e7eb'
            }}
          >
            <View className="h-full bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col">
              <View className="px-3 py-2 flex-shrink-0">
                <Text className="block text-gray-700 font-bold text-sm">🏆 积分排行榜</Text>
              </View>

              <View className="flex-1 overflow-y-auto px-3 pb-2">
                <View className="space-y-1.5">
                  {rankings.slice(0, 5).map(item => (
                    <View
                      key={item.rank}
                      className="flex items-center justify-between bg-white rounded-xl p-2 shadow-sm border border-purple-100 flex-shrink-0"
                    >
                      <View className="flex items-center flex-1 min-w-0">
                        <View
                          className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center flex-shrink-0 ${
                            item.rank === 1
                              ? 'bg-gradient-to-br from-yellow-300 to-yellow-400'
                              : item.rank === 2
                              ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                              : item.rank === 3
                              ? 'bg-gradient-to-br from-orange-300 to-orange-400'
                              : 'bg-gradient-to-br from-purple-200 to-purple-300'
                          }`}
                        >
                          <Text className="block text-white font-bold text-xs">{item.rank}</Text>
                        </View>
                        <Text className="block text-gray-700 text-sm font-semibold truncate">{item.nickname}</Text>
                      </View>
                      <Text className="block text-sky-500 font-bold text-xs flex-shrink-0">{item.points}分</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* 浮动发布按钮 - 右下角 */}
          <View
            style={{
              position: 'fixed',
              bottom: '260px',
              right: '16px',
              zIndex: 100
            }}
          >
            <View
              className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 shadow-lg flex items-center justify-center border-4 border-white"
              onClick={handlePublish}
            >
              <Text className="text-white text-2xl font-bold">+</Text>
            </View>
          </View>
        </>
      )}
    </View>
  )
}

export default IndexPage
