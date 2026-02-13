import { View, Text, Video, ScrollView } from '@tarojs/components'
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

export default function IndexPage() {
  const [videoList, setVideoList] = useState<VideoCard[]>([])
  const [loading, setLoading] = useState(true)

  // 页面加载时获取数据
  Taro.useLoad(() => {
    loadVideos()
  })

  // 加载视频列表
  const loadVideos = async () => {
    try {
      setLoading(true)

      const res = await Network.request({
        url: '/api/video/list',
        method: 'GET'
      })

      if (res.data.code === 200) {
        const videos = res.data.data.map((v: any) => ({
          id: v.id,
          nickname: v.nickname,
          age: v.age,
          content: v.content,
          videoUrl: v.videoUrl,
          likeCount: v.likeCount || 0,
          isLiked: false
        }))
        setVideoList(videos)
      }
    } catch (error) {
      console.error('加载视频失败:', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  // 点赞
  const handleLike = async (videoId: string) => {
    try {
      const res = await Network.request({
        url: '/api/video/like',
        method: 'POST',
        data: { videoId }
      })

      if (res.data.code === 200) {
        setVideoList(prev =>
          prev.map(v =>
            v.id === videoId
              ? { ...v, likeCount: res.data.data.likeCount, isLiked: res.data.data.isLiked }
              : v
          )
        )
      }
    } catch (error) {
      console.error('点赞失败:', error)
    }
  }

  // 跳转发布页
  const handlePublish = () => {
    Taro.navigateTo({ url: '/pages/publish/index' })
  }

  // 加载中
  if (loading) {
    return (
      <View className="flex items-center justify-center h-screen bg-gray-50">
        <Text className="text-sky-400 text-lg">加载中...</Text>
      </View>
    )
  }

  // 空状态
  if (videoList.length === 0) {
    return (
      <View className="flex items-center justify-center h-screen bg-gray-50">
        <View className="text-center">
          <Text className="text-5xl mb-4">🎬</Text>
          <Text className="text-gray-400 text-base">还没有视频哦</Text>
          <Text className="text-gray-300 text-sm mt-2">快去发布第一个视频吧！</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-gray-50 pb-24">
      {/* 视频Feed流 */}
      <ScrollView scrollY className="h-screen">
        <View className="p-4 space-y-4">
          {videoList.map(video => (
            <View key={video.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {/* 用户信息 */}
              <View className="p-4 border-b border-gray-100">
                <View className="flex items-center">
                  <View className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center mr-3">
                    <Text className="text-sky-500 font-bold">{video.age}</Text>
                  </View>
                  <View>
                    <Text className="text-gray-700 font-bold">{video.nickname}</Text>
                    <Text className="text-sky-400 text-xs">{video.age}岁</Text>
                  </View>
                </View>
              </View>

              {/* 内容 */}
              <View className="p-4 bg-gray-50">
                <Text className="text-gray-700 text-sm leading-relaxed">{video.content}</Text>
              </View>

              {/* 视频预览 */}
              <View className="aspect-video bg-black relative overflow-hidden">
                <Video
                  src={video.videoUrl}
                  className="w-full h-full"
                  style={{ display: 'block' }}
                  controls
                  objectFit="contain"
                />
              </View>

              {/* 点赞 */}
              <View className="p-4">
                <View
                  className="flex items-center justify-center bg-sky-50 rounded-full py-2"
                  onClick={() => handleLike(video.id)}
                >
                  <Text className="mr-2">{video.isLiked ? '❤️' : '🤍'}</Text>
                  <Text className="text-sky-500 font-bold text-sm">{video.likeCount}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 发布按钮 */}
      <View
        style={{
          position: 'fixed',
          bottom: '70px',
          right: '16px',
          zIndex: 100
        }}
      >
        <View
          className="w-14 h-14 bg-sky-500 rounded-full flex items-center justify-center shadow-lg"
          onClick={handlePublish}
        >
          <Text className="text-white text-2xl font-bold">+</Text>
        </View>
      </View>
    </View>
  )
}
