import { View, Text, Video, Input, Textarea, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { Network } from '@/network'

const IndexPage = () => {
  const [videoPath, setVideoPath] = useState<string>('')
  const [videoDuration, setVideoDuration] = useState<number>(0)
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [uploading, setUploading] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>('')

  // 选择视频
  const chooseVideo = async () => {
    try {
      const res = await Taro.chooseVideo({
        sourceType: ['album', 'camera'],
        maxDuration: 300, // 最大5分钟
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

    if (!title.trim()) {
      Taro.showToast({
        title: '请输入视频标题',
        icon: 'none'
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // 使用 Network.uploadFile 上传视频到后端
      const uploadRes = await Network.uploadFile({
        url: '/api/video/upload',
        filePath: videoPath,
        name: 'video',
        formData: {
          title: title,
          description: description
        }
      })

      console.log('上传响应:', uploadRes)

      // 解析响应数据
      const responseText = uploadRes.data
      const response = JSON.parse(responseText)

      if (response.code === 200) {
        setUploadedVideoUrl(response.data.videoUrl)
        setVideoPath('')
        setTitle('')
        setDescription('')
        setUploadProgress(100)

        Taro.showToast({
          title: '上传成功',
          icon: 'success'
        })
      } else {
        throw new Error(response.msg || '上传失败')
      }
    } catch (error) {
      console.error('上传失败:', error)
      Taro.showToast({
        title: '上传失败，请重试',
        icon: 'none'
      })
    } finally {
      setUploading(false)
    }
  }

  // 格式化视频时长
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <View className="min-h-screen bg-black p-4">
      {/* 页面标题 */}
      <View className="mb-6">
        <Text className="block text-2xl font-bold text-white">发布视频</Text>
      </View>

      {/* 视频选择区域 */}
      {!videoPath ? (
        <View className="mb-4">
          <View
            className="flex items-center justify-center py-12 border-2 border-dashed border-gray-700 rounded-xl bg-gray-800/50"
            onClick={chooseVideo}
          >
            <View className="flex flex-col items-center">
              <Text className="block text-4xl mb-2">➕</Text>
              <Text className="block text-white text-base font-semibold">选择视频</Text>
              <Text className="block text-gray-500 text-sm mt-1">支持 MP4 格式，最大 100MB</Text>
            </View>
          </View>
        </View>
      ) : (
        <View className="mb-4">
          {/* 视频预览区 - 9:16 竖屏 */}
          <View className="aspect-[9/16] bg-gray-800 rounded-xl overflow-hidden relative mb-4">
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

          {/* 重新选择按钮 */}
          <View className="mb-4">
            <Button
              className="bg-gray-700 text-white text-sm"
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

      {/* 视频标题输入 */}
      <View className="mb-4">
        <Text className="block text-white text-base font-semibold mb-2">视频标题</Text>
        <View className="bg-gray-800 rounded-xl px-4 py-3">
          <Input
            className="w-full bg-transparent text-white placeholder-gray-500 text-base"
            placeholder="给你的视频起个标题吧"
            placeholderClass="text-gray-500"
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
            maxlength={50}
          />
        </View>
      </View>

      {/* 视频描述输入 */}
      <View className="mb-6">
        <Text className="block text-white text-base font-semibold mb-2">视频描述</Text>
        <View className="bg-gray-800 rounded-xl px-4 py-3">
          <Textarea
            className="w-full bg-transparent text-white placeholder-gray-500 text-base"
            placeholder="分享你的故事..."
            placeholderClass="text-gray-500"
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            maxlength={200}
            autoHeight
          />
        </View>
      </View>

      {/* 上传按钮 */}
      <View className="mb-6">
        {uploading ? (
          <View className="bg-gray-800 rounded-xl p-4">
            <View className="flex justify-between items-center mb-2">
              <Text className="block text-white text-sm">上传中...</Text>
              <Text className="block text-gray-400 text-sm">{uploadProgress}%</Text>
            </View>
            <View className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <View
                className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </View>
          </View>
        ) : (
          <View
            className="bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full py-3"
            onClick={uploadVideo}
          >
            <Text className="block text-white font-semibold text-center text-base">
              发布视频
            </Text>
          </View>
        )}
      </View>

      {/* 已上传视频预览 */}
      {uploadedVideoUrl && (
        <View className="bg-gray-800 rounded-xl p-4 mb-4">
          <Text className="block text-white text-base font-semibold mb-3">上传成功</Text>
          <View className="aspect-[9/16] bg-black rounded-lg overflow-hidden mb-3">
            <Video
              src={uploadedVideoUrl}
              className="w-full h-full"
              controls
              objectFit="cover"
            />
          </View>
          <Text className="block text-gray-400 text-sm text-center">
            视频已成功发布，可以在我的视频中查看
          </Text>
        </View>
      )}
    </View>
  )
}

export default IndexPage
