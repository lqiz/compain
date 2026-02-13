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

const IndexPage = () => {
  const [videoList, setVideoList] = useState<VideoCard[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // 页面加载时获取数据
  Taro.useLoad(() => {
    loadData()
  })

  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true)

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
    <View className="min-h-screen bg-gray-50 pb-20">
      {/* 加载状态 */}
      {loading ? (
        <View className="flex items-center justify-center h-screen">
          <Text className="block text-sky-400 text-lg">🌈 加载中...</Text>
        </View>
      ) : (
        <>
          {/* 空状态 */}
          {videoList.length === 0 ? (
            <View className="flex items-center justify-center h-screen">
              <View className="text-center">
                <Text className="block text-6xl mb-4">🎬</Text>
                <Text className="block text-gray-400 text-base">暂无视频</Text>
                <Text className="block text-gray-300 text-sm mt-2">快去发布你的第一个视频吧！</Text>
              </View>
            </View>
          ) : (
            /* 视频Feed流 */
            <View className="p-3 space-y-3">
              {videoList.map((video, index) => (
                <View key={video.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                  {/* 用户信息 */}
                  <View className="flex items-center mb-2">
                    <View className="w-10 h-10 bg-gradient-to-br from-sky-100 to-pink-100 rounded-full mr-3 flex items-center justify-center flex-shrink-0 border-2 border-sky-200">
                      <Text className="block text-sky-500 font-bold text-sm">{video.age}</Text>
                    </View>
                    <View className="flex-1 min-w-0">
                      <Text className="block text-gray-700 font-bold text-base truncate">{video.nickname}</Text>
                      <Text className="block text-sky-400 text-xs">{video.age}岁小朋友</Text>
                    </View>
                  </View>

                  {/* 内容 */}
                  <View className="mb-3 bg-gradient-to-br from-sky-50 to-pink-50 rounded-2xl p-3">
                    <Text className="block text-gray-700 text-sm leading-relaxed">
                      {video.content}
                    </Text>
                  </View>

                  {/* 视频预览 */}
                  <View className="aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-3 shadow-md">
                    {video.videoUrl ? (
                      <Video
                        src={video.videoUrl}
                        className="w-full h-full"
                        controls
                        onError={(e) => {
                          console.error(`视频${index + 1}播放错误:`, e.detail)
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
                    className="flex items-center justify-center rounded-full py-2 px-4 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200"
                    onClick={() => handleLike(video.id)}
                  >
                    <Text className="text-lg mr-2">{video.isLiked ? '❤️' : '🤍'}</Text>
                    <Text className="text-sm font-bold text-sky-500">
                      {video.likeCount} 个喜欢
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* 浮动发布按钮 - 右下角固定 */}
          <View
            style={{
              position: 'fixed',
              bottom: '70px',
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
