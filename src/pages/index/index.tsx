import { View, Text, Video, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
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

  // 页面显示时获取数据（支持TabBar切换刷新）
  useDidShow(() => {
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

      console.log('加载视频响应:', res)
      console.log('响应数据:', res.data)

      // 防御性检查：确保 res.data 存在
      if (!res.data) {
        console.error('响应数据为空')
        Taro.showToast({ title: '服务器响应异常', icon: 'none' })
        return
      }

      // 检查响应状态码
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
      } else {
        console.error('响应状态码异常:', res.data.code, res.data.msg)
        Taro.showToast({ title: res.data.msg || '加载失败', icon: 'none' })
      }
    } catch (error) {
      console.error('加载视频失败:', error)
      Taro.showToast({ title: '加载失败，请重试', icon: 'none' })
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
      <View className="flex items-center justify-center h-screen bg-gradient-to-b from-sky-50 to-white">
        <View className="text-center">
          <Text className="text-4xl mb-3">🎬</Text>
          <Text className="text-sky-400 text-base font-medium">加载中...</Text>
        </View>
      </View>
    )
  }

  // 发布按钮（所有状态下都显示）
  const PublishButton = () => (
    <View
      style={{
        position: 'fixed',
        bottom: '70px',
        right: '16px',
        zIndex: 100
      }}
    >
      <View
        className="w-14 h-14 bg-gradient-to-br from-sky-400 to-sky-500 rounded-full flex items-center justify-center shadow-lg"
        onClick={handlePublish}
      >
        <Text className="text-white text-2xl font-bold">+</Text>
      </View>
    </View>
  )

  // 空状态
  if (videoList.length === 0) {
    return (
      <View className="min-h-screen bg-gradient-to-b from-sky-50 via-yellow-50 to-pink-50 relative">
        {/* 空状态卡片 */}
        <View className="flex flex-col items-center justify-center min-h-screen px-8 pb-32">
          <View className="bg-white rounded-3xl shadow-lg p-8 text-center max-w-sm">
            {/* 卡通图标 */}
            <View className="mb-6">
              <Text className="text-6xl">🎬</Text>
            </View>

            {/* 主标题 */}
            <Text className="block text-2xl font-bold text-gray-700 mb-3">
              还没有视频哦
            </Text>

            {/* 副标题 */}
            <Text className="block text-gray-500 text-sm mb-6 leading-relaxed">
              这里是诉苦大会{'\n'}
              快去发布你的第一个视频吧！
            </Text>

            {/* 快速发布按钮 */}
            <View
              className="bg-gradient-to-r from-sky-400 to-sky-500 rounded-2xl py-3 px-6"
              onClick={handlePublish}
            >
              <Text className="text-white font-bold text-base">立即发布</Text>
            </View>
          </View>

          {/* 装饰元素 - 彩色圆点 */}
          <View className="absolute top-20 left-8 w-8 h-8 bg-sky-300 rounded-full opacity-50" />
          <View className="absolute top-32 right-12 w-6 h-6 bg-yellow-300 rounded-full opacity-50" />
          <View className="absolute bottom-40 left-16 w-10 h-10 bg-pink-300 rounded-full opacity-50" />
          <View className="absolute bottom-52 right-20 w-7 h-7 bg-green-300 rounded-full opacity-50" />
          <View className="absolute top-60 left-24 w-5 h-5 bg-purple-300 rounded-full opacity-50" />
        </View>

        {/* 发布按钮 */}
        <PublishButton />
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-gradient-to-b from-sky-50 to-white pb-24 relative">
      {/* 视频Feed流 */}
      <ScrollView scrollY className="h-screen">
        <View className="p-4 space-y-4">
          {videoList.map(video => (
            <View key={video.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border-2 border-sky-100">
              {/* 用户信息 */}
              <View className="p-4 border-b border-sky-50">
                <View className="flex items-center">
                  <View className="w-12 h-12 bg-gradient-to-br from-sky-200 to-sky-300 rounded-full flex items-center justify-center mr-3 shadow-sm">
                    <Text className="text-sky-600 font-bold text-lg">{video.age}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-700 font-bold text-base">{video.nickname}</Text>
                    <Text className="text-sky-400 text-xs font-medium">{video.age}岁</Text>
                  </View>
                  <Text className="text-gray-300 text-xs">
                    {new Date().toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {/* 内容 */}
              <View className="p-5 bg-gradient-to-br from-sky-50 to-white">
                <Text className="text-gray-700 text-base leading-relaxed">{video.content}</Text>
              </View>

              {/* 视频预览 */}
              <View className="aspect-video bg-gray-900 relative overflow-hidden">
                <Video
                  src={video.videoUrl}
                  className="w-full h-full"
                  style={{ display: 'block', position: 'relative' }}
                  controls
                  objectFit="contain"
                />
              </View>

              {/* 点赞 */}
              <View className="p-4 bg-white">
                <View
                  className="flex items-center justify-center bg-gradient-to-r from-sky-50 to-pink-50 rounded-full py-3 px-6 shadow-sm"
                  onClick={() => handleLike(video.id)}
                >
                  <Text className="mr-2 text-xl">{video.isLiked ? '❤️' : '🤍'}</Text>
                  <Text className="text-sky-500 font-bold text-sm">
                    {video.likeCount} 次点赞
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 发布按钮 */}
      <PublishButton />
    </View>
  )
}
