import { View, Text, Video, Textarea, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { Network } from '@/network'
import { getUserNickname, getUserAge, logout, addUserPoints, POINTS_RULES } from '@/utils/auth'

const PublishPage = () => {
  const [videoPath, setVideoPath] = useState<string>('')
  const [videoDuration, setVideoDuration] = useState<number>(0)
  const [content, setContent] = useState<string>('')
  const [uploading, setUploading] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>('')
  const [userNickname, setUserNickname] = useState<string>('')
  const [userAge, setUserAge] = useState<number>(0)

  // 页面加载时获取用户信息
  Taro.useLoad(() => {
    const nickname = getUserNickname()
    const age = getUserAge()

    if (!nickname || !age) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        Taro.redirectTo({
          url: '/pages/login/index'
        })
      }, 1500)
      return
    }

    setUserNickname(nickname)
    setUserAge(age)
  })

  // 返回首页
  const handleBack = () => {
    Taro.switchTab({
      url: '/pages/index/index'
    })
  }

  // 选择视频
  const chooseVideo = async () => {
    try {
      const res = await Taro.chooseVideo({
        sourceType: ['album', 'camera'],
        maxDuration: 300,
        camera: 'back',
        compressed: true
      })

      console.log('选择视频:', res)

      setVideoPath(res.tempFilePath)
      setVideoDuration(res.duration)
      setUploadedVideoUrl('')
    } catch (error) {
      console.error('选择视频失败:', error)
      Taro.showToast({
        title: '选择视频失败',
        icon: 'none'
      })
    }
  }

  // 上传视频
  const uploadVideo = async () => {
    if (!videoPath) {
      Taro.showToast({
        title: '请先选择视频',
        icon: 'none'
      })
      return
    }

    if (!content.trim()) {
      Taro.showToast({
        title: '请输入心里话',
        icon: 'none'
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const uploadRes = await Network.uploadFile({
        url: '/api/video/upload',
        filePath: videoPath,
        name: 'video',
        formData: {
          title: content,
          description: ''
        }
      })

      clearInterval(progressInterval)

      console.log('上传响应:', uploadRes)

      const responseText = uploadRes.data
      const response = JSON.parse(responseText)

      if (response.code === 200) {
        setUploadedVideoUrl(response.data.videoUrl)
        setVideoPath('')
        setContent('')
        setUploadProgress(100)

        const newLevelInfo = addUserPoints(POINTS_RULES.PUBLISH_VIDEO)
        console.log('发布视频获得积分，新等级:', newLevelInfo)

        Taro.showToast({
          title: `发布成功！+${POINTS_RULES.PUBLISH_VIDEO} 积分`,
          icon: 'success'
        })

        setTimeout(() => {
          Taro.switchTab({
            url: '/pages/index/index'
          })
        }, 2000)
      } else {
        throw new Error(response.msg || '发布失败')
      }
    } catch (error) {
      console.error('上传失败:', error)
      Taro.showToast({
        title: '发布失败，请重试',
        icon: 'none'
      })
    } finally {
      setUploading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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
    <View className="min-h-screen bg-orange-50 flex flex-col">
      {/* 内容区域 */}
      <View className="p-5 flex-1 pb-20">
        {/* 顶部操作栏 */}
        <View className="flex items-center mb-6">
          {/* 返回按钮 - 增大可点击区域 */}
          <View
            className="bg-white border-2 border-orange-500 rounded-full px-6 py-3 shadow-md"
            style={{ minWidth: '100px' }}
            onClick={handleBack}
          >
            <Text className="block text-orange-500 text-base font-bold">← 返回</Text>
          </View>

          {/* 页面标题 */}
          <View className="flex-1 ml-4">
            <Text className="block text-xl font-bold text-gray-800">发布心里话</Text>
            <Text className="block text-gray-500 text-xs">孩子的心里话，我们来发布</Text>
          </View>

          {/* 退出按钮 */}
          <View
            className="bg-white border border-orange-200 rounded-full px-4 py-2 shadow-sm"
            onClick={handleLogout}
          >
            <Text className="block text-orange-500 text-sm font-semibold">退出</Text>
          </View>
        </View>

        {/* 用户信息 */}
        <View className="flex items-center mb-6">
          <View className="w-12 h-12 bg-orange-200 rounded-full mr-3 flex items-center justify-center">
            <Text className="block text-orange-500 font-bold text-xl">{userAge}</Text>
          </View>
          <View>
            <Text className="block text-gray-800 font-semibold text-base">{userNickname}</Text>
            <Text className="block text-gray-500 text-xs">诉苦大会 · {userAge}岁</Text>
          </View>
        </View>

        {/* 温馨提示 */}
        <View className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
          <Text className="block text-yellow-700 font-semibold text-sm mb-1">💡 温馨提示</Text>
          <Text className="block text-yellow-600 text-xs leading-relaxed">
            请文明诉苦，不使用不当语言，让这里成为孩子们温暖的港湾
          </Text>
        </View>

        {/* 视频选择区域 */}
        {!videoPath ? (
          <View className="mb-6">
            <View
              className="flex items-center justify-center py-12 border-2 border-dashed border-orange-200 rounded-2xl bg-white"
              onClick={chooseVideo}
            >
              <View className="flex flex-col items-center">
                <Text className="block text-5xl mb-3">📹</Text>
                <Text className="block text-gray-800 font-semibold text-base mb-1">选择视频</Text>
                <Text className="block text-gray-500 text-sm">支持 MP4 格式，最大 100MB</Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="mb-6">
            <View className="aspect-[9/16] bg-white rounded-2xl overflow-hidden relative mb-4 shadow-sm">
              <Video
                src={videoPath}
                className="w-full h-full"
                controls
                objectFit="cover"
              />
              <View className="absolute top-2 right-2 bg-black/70 rounded-full px-3 py-1">
                <Text className="block text-white text-xs font-medium">
                  {formatDuration(videoDuration)}
                </Text>
              </View>
            </View>

            <View className="mb-4">
              <Button
                className="bg-white border-2 border-orange-300 text-orange-500 text-sm"
                onClick={() => {
                  setVideoPath('')
                  setVideoDuration(0)
                }}
              >
                重新选择
              </Button>
            </View>
          </View>
        )}

        {/* 心里话输入 */}
        <View className="mb-6 flex-1">
          <Text className="block text-gray-800 font-semibold text-base mb-2">你的心里话</Text>
          <View className="bg-white border-2 border-orange-200 rounded-2xl px-4 py-3 flex-1">
            <Textarea
              className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-base min-h-[150px]"
              placeholder="分享你的心里话，想说什么就说什么..."
              placeholderClass="text-gray-400"
              value={content}
              onInput={(e) => setContent(e.detail.value)}
              maxlength={500}
              autoHeight
            />
            <View className="flex justify-end">
              <Text className="block text-gray-400 text-xs">{content.length}/500</Text>
            </View>
          </View>
        </View>

        {/* 发布按钮 */}
        <View className="mb-6">
          {uploading ? (
            <View className="bg-white border-2 border-orange-200 rounded-2xl p-4">
              <View className="flex justify-between items-center mb-2">
                <Text className="block text-gray-800 text-sm">发布中...</Text>
                <Text className="block text-orange-500 text-sm">{uploadProgress}%</Text>
              </View>
              <View className="w-full h-2 bg-orange-100 rounded-full overflow-hidden">
                <View
                  className="h-full bg-orange-500 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </View>
            </View>
          ) : (
            <View
              className="bg-orange-500 rounded-2xl px-6 py-4 shadow-sm"
              onClick={uploadVideo}
            >
              <Text className="block text-white font-semibold text-center text-base">
                发布心里话
              </Text>
            </View>
          )}
        </View>

        {/* 已发布视频预览 */}
        {uploadedVideoUrl && (
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
            <View className="flex items-center mb-3">
              <Text className="block text-2xl mr-2">🎉</Text>
              <Text className="block text-gray-800 font-semibold text-base">发布成功</Text>
            </View>
            <View className="aspect-[9/16] bg-gray-100 rounded-xl overflow-hidden mb-3">
              <Video
                src={uploadedVideoUrl}
                className="w-full h-full"
                controls
                objectFit="cover"
              />
            </View>
            <Text className="block text-gray-500 text-sm text-center">
              你的心里话已成功发布
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default PublishPage
