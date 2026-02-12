import { View, Text, Video, Textarea, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { Network } from '@/network'
import { getUserNickname, getUserAge, addUserPoints, POINTS_RULES } from '@/utils/auth'

const PublishPage = () => {
  const [videoPath, setVideoPath] = useState<string>('')
  const [videoDuration, setVideoDuration] = useState<number>(0)
  const [content, setContent] = useState<string>('')
  const [uploading, setUploading] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  // 页面加载时验证登录状态
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
    }
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

  return (
    <View className="h-screen bg-orange-50 flex flex-col overflow-hidden">
      {/* 内容区域 */}
      <View className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部操作栏 */}
        <View className="flex items-center px-4 py-3 flex-shrink-0">
          {/* 返回按钮 */}
          <View
            className="bg-white border-2 border-orange-500 rounded-full px-5 py-2 shadow-md"
            style={{ minWidth: '80px' }}
            onClick={handleBack}
          >
            <Text className="block text-orange-500 text-sm font-bold">← 返回</Text>
          </View>

          {/* 页面标题 */}
          <View className="flex-1 ml-3">
            <Text className="block text-lg font-bold text-gray-800">发布心里话</Text>
            <Text className="block text-gray-500 text-xs">孩子的心里话，我们来发布</Text>
          </View>
        </View>

        {/* 主要内容区域 */}
        <View className="flex-1 px-4 pb-4 overflow-hidden flex flex-col">
          {/* 视频选择/预览区域 - 占据约40%高度 */}
          <View className="flex-1 flex flex-col min-h-0 mb-3">
            {!videoPath ? (
              <View
                className="flex-1 flex items-center justify-center border-2 border-dashed border-orange-200 rounded-2xl bg-white min-h-0"
                onClick={chooseVideo}
              >
                <View className="flex flex-col items-center">
                  <Text className="block text-4xl mb-2">📹</Text>
                  <Text className="block text-gray-800 font-semibold text-sm mb-1">选择视频</Text>
                  <Text className="block text-gray-500 text-xs">支持 MP4 格式，最大 100MB</Text>
                </View>
              </View>
            ) : (
              <View className="flex-1 flex flex-col min-h-0">
                <View className="flex-1 bg-white rounded-2xl overflow-hidden relative mb-2 shadow-sm min-h-0">
                  <Video
                    src={videoPath}
                    className="w-full h-full"
                    controls
                    objectFit="cover"
                  />
                  <View className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-0.5">
                    <Text className="block text-white text-xs font-medium">
                      {formatDuration(videoDuration)}
                    </Text>
                  </View>
                </View>

                <View className="flex-shrink-0">
                  <Button
                    className="bg-white border-2 border-orange-300 text-orange-500 text-xs"
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
          </View>

          {/* 心里话输入区域 - 占据约25%高度 */}
          <View className="h-[25%] flex flex-col mb-3 flex-shrink-0">
            <Text className="block text-gray-800 font-semibold text-sm mb-2 flex-shrink-0">你的心里话</Text>
            <View className="bg-white border-2 border-orange-200 rounded-2xl px-3 py-2 flex-1 flex flex-col min-h-0">
              <Textarea
                className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-sm flex-1 min-h-0"
                placeholder="分享你的心里话，想说什么就说什么..."
                placeholderClass="text-gray-400"
                value={content}
                onInput={(e) => setContent(e.detail.value)}
                maxlength={500}
                autoHeight={false}
              />
              <View className="flex justify-end flex-shrink-0">
                <Text className="block text-gray-400 text-xs">{content.length}/500</Text>
              </View>
            </View>
          </View>

          {/* 发布按钮 */}
          <View className="flex-shrink-0">
            {uploading ? (
              <View className="bg-white border-2 border-orange-200 rounded-2xl p-3">
                <View className="flex justify-between items-center mb-2">
                  <Text className="block text-gray-800 text-xs">发布中...</Text>
                  <Text className="block text-orange-500 text-xs">{uploadProgress}%</Text>
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
                className="bg-orange-500 rounded-2xl px-6 py-3 shadow-sm"
                onClick={uploadVideo}
              >
                <Text className="block text-white font-semibold text-center text-sm">
                  发布心里话
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}

export default PublishPage
