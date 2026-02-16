import { View, Text, Video, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useCallback, useMemo } from 'react'
import { Network } from '@/network'
import { getUserNickname, getUserAge, addUserPoints, POINTS_RULES } from '@/utils/auth'

const PublishPage = () => {
  const [videoPath, setVideoPath] = useState<string>('')
  const [videoDuration, setVideoDuration] = useState<number>(0)
  const [videoSize, setVideoSize] = useState<number>(0) // 新增：存储视频文件大小
  const [content, setContent] = useState<string>('')
  const [textInput, setTextInput] = useState<string>('')
  const [uploading, setUploading] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  // 稳定的 Textarea value
  const textareaValue = useMemo(() => textInput || '', [textInput])

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
      // 注意：微信小程序的 maxDuration 参数最大值为 60 秒
      const res = await Taro.chooseVideo({
        sourceType: ['album', 'camera'],
        maxDuration: 60, // 微信小程序限制，最大值为 60 秒
        camera: 'back',
        compressed: true
      })

      console.log('选择视频:', res)
      console.log('视频时长:', res.duration, '秒')

      // 检查视频时长（虽然 maxDuration=60，但为了保险起见再检查一次）
      const MAX_ALLOWED_DURATION = 600 // 10分钟
      if (res.duration > MAX_ALLOWED_DURATION) {
        Taro.showToast({
          title: `视频时长过长（${Math.round(res.duration / 60)}分钟），请选择10分钟以内的视频`,
          icon: 'none',
          duration: 3000
        })
        return
      }

      // 检查文件大小
      let fileSize = 0
      const env = Taro.getEnv()
      const isWeapp = env === Taro.ENV_TYPE.WEAPP

      if (isWeapp) {
        // 小程序环境：使用 getFileInfo 获取文件大小
        const fileInfo = await Taro.getFileInfo({ filePath: res.tempFilePath })
        const successResult = fileInfo as { size: number }
        fileSize = successResult.size
        console.log('小程序视频文件大小:', fileSize, 'bytes')
      } else {
        // H5环境：使用 fetch 获取文件大小
        try {
          const response = await fetch(res.tempFilePath)
          const blob = await response.blob()
          fileSize = blob.size
          console.log('H5视频文件大小:', fileSize, 'bytes')
        } catch (error) {
          console.error('H5获取文件大小失败:', error)
          // 如果获取失败，使用时长估算（不推荐）
          fileSize = Math.floor(res.duration * 1024 * 1024)
          console.log('H5环境估算视频文件大小:', fileSize, 'bytes')
        }
      }

      // 检查文件大小限制（100MB）- 暂时禁用以排查问题
      // const MAX_FILE_SIZE = 100 * 1024 * 1024
      // if (fileSize > MAX_FILE_SIZE) {
      //   const sizeInMB = Math.round(fileSize / 1024 / 1024)
      //   Taro.showModal({
      //     title: '视频文件过大',
      //     content: `您选择的视频大小为 ${sizeInMB}MB，超过了 100MB 的限制。\n\n建议：\n• 选择时长更短的视频（建议 30 秒以内）\n• 使用手机自带的视频编辑功能压缩后再上传`,
      //     showCancel: false,
      //     confirmText: '我知道了'
      //   })
      //   return
      // }

      console.log('文件大小检查通过（暂时禁用）:', fileSize / 1024 / 1024, 'MB')

      // 直接设置视频路径，不再跳转到编辑器
      setVideoPath(res.tempFilePath)
      setVideoDuration(res.duration)
      setVideoSize(fileSize) // 保存文件大小

      Taro.showToast({
        title: '视频已选择',
        icon: 'success'
      })
    } catch (error: any) {
      console.error('选择视频失败:', error)

      // 根据错误类型给出更友好的提示
      let errorMessage = '选择视频失败，请重试'

      if (error?.errMsg) {
        if (error.errMsg.includes('cancel')) {
          // 用户取消选择，不需要提示
          return
        } else if (error.errMsg.includes('no video')) {
          errorMessage = '未选择视频，请重新选择'
        } else if (error.errMsg.includes('maxDuration')) {
          errorMessage = '视频时长不能超过60秒，请选择更短的视频'
        }
      }

      Taro.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
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

    // 心里话可以不填，如果未填写则使用默认文案
    const finalContent = content.trim() || '分享我的心里话'

    setUploading(true)
    setUploadProgress(0)

    // 声明进度定时器，确保在 finally 中可以清除
    let progressInterval: NodeJS.Timeout | null = null

    try {
      console.log('开始上传视频:', { videoPath, finalContent })
      console.log('当前环境:', Taro.getEnv())

      // 检查视频文件大小
      let fileSize = 0
      const env = Taro.getEnv()
      const isWeapp = env === Taro.ENV_TYPE.WEAPP

      if (isWeapp) {
        // 小程序环境：使用 getFileInfo 获取文件大小
        const fileInfo = await Taro.getFileInfo({ filePath: videoPath })
        // 类型断言，确保是成功结果
        const successResult = fileInfo as { size: number }
        fileSize = successResult.size
        console.log('小程序视频文件大小:', successResult.size, 'bytes')
      } else {
        // H5环境：使用 fetch 获取文件大小
        try {
          const response = await fetch(videoPath)
          const blob = await response.blob()
          fileSize = blob.size
          console.log('H5视频文件大小:', fileSize, 'bytes')
        } catch (error) {
          console.error('H5获取文件大小失败:', error)
          // 如果获取失败，使用时长估算
          fileSize = Math.floor(videoDuration * 1024 * 1024)
          console.log('H5环境估算视频文件大小:', fileSize, 'bytes')
        }
      }

      // 检查文件大小限制（100MB）- 暂时禁用以排查问题
      // const MAX_FILE_SIZE = 100 * 1024 * 1024
      // if (fileSize > MAX_FILE_SIZE) {
      //   throw new Error(`视频文件过大（${Math.round(fileSize / 1024 / 1024)}MB），请选择100MB以内的视频`)
      // }

      console.log('文件大小检查通过（暂时禁用）:', fileSize / 1024 / 1024, 'MB')

      // 根据文件大小动态计算超时时间（最少300秒 = 5分钟，每MB增加5秒）
      const fileSizeInMB = fileSize / 1024 / 1024
      const timeoutDuration = Math.max(300000, fileSizeInMB * 5000 + 300000) // 5分钟起步
      console.log('动态超时时间:', Math.round(timeoutDuration / 1000), '秒')

      // 模拟上传进度 - 改进版本，更慢一些避免超时
      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval!)
            return 95
          }
          return prev + 2 // 改为2，更慢
        })
      }, 500) // 改为500ms，更慢

      // H5 环境下使用完整 URL，小程序使用相对路径
      // 将 ENV_TYPE 转换为字符串进行比较
      const envStr = env.toString()
      const isH5 = envStr === 'h5' || envStr === 'web'
      const uploadUrl = isH5 ? 'http://localhost:3000/api/video/upload' : '/api/video/upload'

      console.log('上传URL:', uploadUrl)

      // 添加超时处理 - 使用动态超时时间
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.error('上传超时，等待时间:', timeoutDuration, 'ms')
          reject(new Error('上传超时'))
        }, timeoutDuration)
      })

      const uploadPromise = Network.uploadFile({
        url: uploadUrl,
        filePath: videoPath,
        name: 'video',
        formData: {
          title: finalContent,
          description: '',
          nickname: getUserNickname(), // 传递用户昵称
          age: getUserAge().toString() // 传递用户年龄
        }
      })

      console.log('开始上传文件，文件大小:', fileSize, 'bytes, URL:', uploadUrl)

      // 使用 Promise.race 处理超时
      const uploadRes = await Promise.race([uploadPromise, timeoutPromise]) as any

      // 清除进度定时器
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }
      setUploadProgress(100)

      console.log('上传响应:', uploadRes)
      console.log('上传响应数据:', uploadRes.data)
      console.log('上传响应状态码:', uploadRes.statusCode)

      if (uploadRes.statusCode === 200) {
        let response
        try {
          response = JSON.parse(uploadRes.data)
        } catch (e) {
          console.error('解析响应失败:', e, uploadRes.data)
          throw new Error('服务器返回数据格式错误')
        }

        console.log('解析后的响应:', response)

        if (response.code === 200) {
          setVideoPath('')
          setContent('')

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
      } else {
        throw new Error(`上传失败，状态码: ${uploadRes.statusCode}`)
      }
    } catch (error: any) {
      console.error('上传失败:', error)
      console.error('错误详情:', {
        message: error?.message,
        stack: error?.stack
      })

      let errorMessage = '发布失败，请重试'
      if (error?.message) {
        if (error.message.includes('超时')) {
          errorMessage = '上传超时，请检查网络后重试'
        } else if (error.message.includes('状态码')) {
          errorMessage = error.message
        }
      }

      Taro.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      })
    } finally {
      // 清除进度定时器（确保一定会清除）
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }
      setUploading(false)
    }
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    const mb = bytes / 1024 / 1024
    if (mb >= 1) {
      return `${mb.toFixed(2)}MB`
    }
    const kb = bytes / 1024
    return `${kb.toFixed(2)}KB`
  }

  // 格式化时长
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <View className="h-screen bg-gradient-to-br from-sky-50 via-yellow-50 to-pink-50 flex flex-col overflow-hidden">
      {/* 顶部彩虹装饰条 */}
      <View className="h-2 bg-gradient-to-r from-sky-400 via-yellow-400 via-pink-400 via-purple-400 to-green-400 flex-shrink-0" />

      {/* 内容区域 */}
      <View className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部操作栏 */}
        <View className="flex items-center px-4 py-3 flex-shrink-0">
          {/* 返回按钮 */}
          <View
            className="bg-white border-2 border-sky-400 rounded-full px-5 py-2 shadow-md"
            style={{ minWidth: '80px' }}
            onClick={handleBack}
          >
            <Text className="block text-sky-500 text-sm font-bold">← 返回</Text>
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
                className="flex-1 flex items-center justify-center border-2 border-dashed border-sky-300 rounded-2xl bg-gradient-to-br from-sky-50 to-white min-h-0"
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
                      {formatDuration(videoDuration)} · {formatFileSize(videoSize)}
                    </Text>
                  </View>
                </View>

                {/* 重新选择按钮 - 增加宽度和图标 */}
                <View
                  className="flex-shrink-0"
                  onClick={() => {
                    setVideoPath('')
                    setVideoDuration(0)
                    setVideoSize(0)
                  }}
                >
                  <View
                    className="bg-white border-2 border-pink-300 rounded-2xl px-5 py-3 shadow-md active:scale-95 transition-transform"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '140px' }}
                  >
                    <Text className="text-lg mr-2">🔄</Text>
                    <Text className="text-pink-500 font-bold text-sm">重新选择</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* 心里话输入区域 - 占据约25%高度 */}
          <View className="h-[25%] flex flex-col mb-3 flex-shrink-0">
            <Text className="block text-gray-800 font-semibold text-sm mb-2 flex-shrink-0">你的心里话</Text>
            <View className="bg-white border-2 border-sky-200 rounded-2xl px-3 py-2 flex-1 flex flex-col min-h-0">
              <Textarea
                className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-sm flex-1 min-h-0"
                placeholder="分享你的心里话，想说什么就说什么..."
                placeholderClass="text-gray-400"
                value={textareaValue}
                onInput={useCallback((e: any) => {
                  let value = ''
                  try {
                    value = e?.detail?.value || ''
                  } catch (err) {
                    console.error('获取输入值失败:', err)
                    value = textInput
                  }
                  setTextInput(value)
                  setContent(value)
                }, [textInput])}
                maxlength={500}
              />
              <View className="flex justify-end flex-shrink-0">
                <Text className="block text-gray-400 text-xs">{content.length}/500</Text>
              </View>
            </View>
          </View>

          {/* 发布按钮 */}
          <View className="flex-shrink-0">
            {uploading ? (
              <View className="bg-white border-2 border-pink-200 rounded-2xl p-3">
                <View className="flex justify-between items-center mb-2">
                  <Text className="block text-gray-800 text-xs">发布中...</Text>
                  <Text className="block text-pink-500 text-xs">{uploadProgress}%</Text>
                </View>
                <View className="w-full h-2 bg-pink-100 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-gradient-to-r from-sky-400 via-pink-400 to-purple-400 transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </View>
              </View>
            ) : (
              <View
                className="bg-gradient-to-r from-sky-400 via-pink-400 to-purple-400 rounded-2xl px-6 py-3 shadow-md border-2 border-white"
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
