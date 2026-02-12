import { View, Text, Video, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useRef } from 'react'

const VideoEditPage = () => {
  // 视频信息
  const [videoPath, setVideoPath] = useState<string>('')
  const [videoDuration, setVideoDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  // 编辑器状态 - 使用滑动窗口方式
  const [startTime, setStartTime] = useState<number>(0)
  const [endTime, setEndTime] = useState<number>(0)
  const [selectedDuration, setSelectedDuration] = useState<number>(0)

  // 手柄拖拽状态
  const [isDraggingLeft, setIsDraggingLeft] = useState<boolean>(false)
  const [isDraggingRight, setIsDraggingRight] = useState<boolean>(false)

  const videoRef = useRef<any>(null)
  const MAX_DURATION = 30 // 最大选择时长30秒

  Taro.useLoad(() => {
    // 从参数获取视频路径和时长
    const instance = Taro.getCurrentInstance()
    const params = instance?.router?.params

    if (params?.videoPath) {
      setVideoPath(decodeURIComponent(params.videoPath))
    }
    if (params?.duration) {
      const duration = parseFloat(params.duration)
      setVideoDuration(duration)
      // 初始化选择范围：从0开始，最多选择30秒
      const initialEndTime = Math.min(duration, MAX_DURATION)
      setStartTime(0)
      setEndTime(initialEndTime)
      setSelectedDuration(initialEndTime)
    }
  })

  // 播放/暂停控制
  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  // 视频播放结束
  const handleEnded = () => {
    setIsPlaying(false)
    // 安全检查：确保 videoRef 存在且有 seek 方法
    if (videoRef.current && typeof videoRef.current.seek === 'function') {
      try {
        videoRef.current.seek(startTime)
      } catch (error) {
        console.error('seek 方法调用失败:', error)
      }
    }
  }

  // 监听播放时间更新
  const handleTimeUpdate = (e: any) => {
    const time = e.detail.currentTime
    setCurrentTime(time)

    // 如果播放到选择区域的结束时间，自动循环
    if (time >= endTime) {
      // 安全检查：确保 videoRef 存在且方法可用
      if (videoRef.current && typeof videoRef.current.seek === 'function') {
        try {
          videoRef.current.seek(startTime)
        } catch (error) {
          console.error('seek 方法调用失败:', error)
        }
      }
      if (videoRef.current && typeof videoRef.current.play === 'function') {
        try {
          videoRef.current.play()
        } catch (error) {
          console.error('play 方法调用失败:', error)
        }
      }
    }
  }

  // 播放预览：播放选择的片段
  const playPreview = () => {
    // 安全检查：确保 videoRef 存在且方法可用
    if (videoRef.current && typeof videoRef.current.seek === 'function') {
      try {
        videoRef.current.seek(startTime)
      } catch (error) {
        console.error('seek 方法调用失败:', error)
      }
    }
    if (videoRef.current && typeof videoRef.current.play === 'function') {
      try {
        videoRef.current.play()
        setIsPlaying(true)
      } catch (error) {
        console.error('play 方法调用失败:', error)
      }
    }
  }

  // 停止视频播放
  const stopVideo = () => {
    if (videoRef.current && typeof videoRef.current.stop === 'function') {
      try {
        videoRef.current.stop()
      } catch (error) {
        console.error('stop 方法调用失败:', error)
      }
    }
    setIsPlaying(false)
  }

  // 页面卸载时清理
  Taro.useUnload(() => {
    console.log('video-edit 页面卸载')
    // 停止视频播放
    stopVideo()
    // 清理手柄拖拽状态
    setIsDraggingLeft(false)
    setIsDraggingRight(false)
  })

  // 左手柄开始拖拽
  const handleLeftHandleStart = () => {
    setIsDraggingLeft(true)
  }

  // 右手柄开始拖拽
  const handleRightHandleStart = () => {
    setIsDraggingRight(true)
  }

  // 处理手柄拖拽移动
  const handleHandleMove = (e: any) => {
    if (!isDraggingLeft && !isDraggingRight) return

    const touch = e.touches[0]
    const systemInfo = Taro.getSystemInfoSync()
    const screenWidth = systemInfo.windowWidth

    // 计算触摸位置对应的视频时间
    const touchX = touch.clientX
    const time = (touchX / screenWidth) * videoDuration

    if (isDraggingLeft) {
      // 更新开始时间
      let newStart = Math.max(0, time)
      // 确保不超过结束时间
      if (newStart >= endTime - 1) {
        newStart = endTime - 1
      }
      // 确保选择时长不超过30秒
      if (endTime - newStart > MAX_DURATION) {
        newStart = endTime - MAX_DURATION
      }
      setStartTime(newStart)
      setSelectedDuration(endTime - newStart)
    } else if (isDraggingRight) {
      // 更新结束时间
      let newEnd = Math.min(videoDuration, time)
      // 确保不小于开始时间
      if (newEnd <= startTime + 1) {
        newEnd = startTime + 1
      }
      // 确保选择时长不超过30秒
      if (newEnd - startTime > MAX_DURATION) {
        newEnd = startTime + MAX_DURATION
      }
      setEndTime(newEnd)
      setSelectedDuration(newEnd - startTime)
    }
  }

  // 结束手柄拖拽
  const handleHandleEnd = () => {
    setIsDraggingLeft(false)
    setIsDraggingRight(false)
  }

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 计算手柄位置（百分比）
  const leftHandlePosition = (startTime / videoDuration) * 100
  const rightHandlePosition = (endTime / videoDuration) * 100

  // 确认选择
  const handleConfirm = () => {
    Taro.eventCenter.trigger('videoSegment', {
      startTime,
      endTime,
      duration: selectedDuration
    })
    Taro.navigateBack()
  }

  // 取消编辑
  const handleCancel = () => {
    Taro.navigateBack()
  }

  return (
    <View className="h-screen bg-gray-900 flex flex-col" style={{ minHeight: '100vh' }}>
      {/* 视频播放器区域 */}
      <View className="flex-shrink-0 bg-black relative" style={{ height: '45vh' }}>
        <Video
          ref={videoRef}
          src={videoPath}
          className="w-full h-full"
          controls={false}
          autoplay={false}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          onTimeUpdate={handleTimeUpdate}
          id="video-player"
        />

        {/* 播放控制覆盖层 */}
        <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <View className="flex items-center justify-between text-white">
            <Text className="block text-sm">{formatTime(currentTime)}</Text>
            <Text className="block text-sm">{formatTime(videoDuration)}</Text>
          </View>
        </View>

        {/* 播放/暂停按钮覆盖层 */}
        {!isPlaying && (
          <View
            className="absolute inset-0 flex items-center justify-center"
            onClick={playPreview}
          >
            <View className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Text className="text-white text-3xl">▶</Text>
            </View>
          </View>
        )}
      </View>

      {/* 时间轴和滑动窗口区域 */}
      <View className="flex-1 bg-gray-800 flex flex-col justify-center px-4 py-6">
        {/* 选择时长提示 */}
        <View className="mb-6 flex items-center justify-between">
          <Text className="block text-white text-lg font-semibold">选择视频片段</Text>
          <View className="flex items-center">
            <Text className="block text-orange-400 text-2xl font-bold">
              {formatTime(selectedDuration)}
            </Text>
            <Text className="block text-gray-400 text-sm ml-2">/ 最多30秒</Text>
          </View>
        </View>

        {/* 滑动窗口时间轴 */}
        <View className="mb-8">
          {/* 时间轴背景 */}
          <View
            className="relative h-16 bg-gray-700 rounded-lg overflow-hidden"
            style={{ width: '100%' }}
            onTouchMove={handleHandleMove}
            onTouchEnd={handleHandleEnd}
          >
            {/* 整个视频的时间轴 */}
            <View className="absolute inset-0 flex items-center">
              {/* 时间刻度 */}
              {videoDuration > 0 && Array.from({ length: 10 }, (_, i) => (
                <View
                  key={i}
                  className="flex-1 h-full border-r border-gray-600/50"
                  style={{ width: `${100 / 10}%` }}
                >
                  <Text className="block text-gray-400 text-xs mt-1 text-center">
                    {formatTime((i / 10) * videoDuration)}
                  </Text>
                </View>
              ))}
            </View>

            {/* 选择的区域高亮 */}
            <View
              className="absolute top-0 bottom-0 bg-orange-500/30 border-2 border-orange-500 rounded"
              style={{
                left: `${leftHandlePosition}%`,
                width: `${rightHandlePosition - leftHandlePosition}%`
              }}
            />

            {/* 左手柄 */}
            <View
              className="absolute top-0 bottom-0 w-6 flex items-center justify-center cursor-pointer"
              style={{ left: `${leftHandlePosition}%`, transform: 'translateX(-50%)' }}
              onTouchStart={handleLeftHandleStart}
              catchMove
            >
              <View className="w-2 h-12 bg-orange-500 rounded-full shadow-lg" />
            </View>

            {/* 右手柄 */}
            <View
              className="absolute top-0 bottom-0 w-6 flex items-center justify-center cursor-pointer"
              style={{ left: `${rightHandlePosition}%`, transform: 'translateX(-50%)' }}
              onTouchStart={handleRightHandleStart}
              catchMove
            >
              <View className="w-2 h-12 bg-orange-500 rounded-full shadow-lg" />
            </View>
          </View>

          {/* 时间提示 */}
          <View className="flex items-center justify-between mt-2">
            <Text className="block text-gray-300 text-sm">
              开始: {formatTime(startTime)}
            </Text>
            <Text className="block text-gray-300 text-sm">
              结束: {formatTime(endTime)}
            </Text>
          </View>
        </View>

        {/* 预览按钮 */}
        <Button
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full py-3 shadow-lg mb-4"
          onClick={playPreview}
        >
          ▶ 预览片段
        </Button>
      </View>

      {/* 底部按钮区域 */}
      <View className="flex-shrink-0 bg-gray-900 px-4 py-4 flex gap-4">
        <View style={{ flex: 1 }}>
          <Button
            className="w-full bg-gray-700 text-white rounded-full py-3"
            onClick={handleCancel}
          >
            取消
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full py-3 shadow-lg"
            onClick={handleConfirm}
          >
            确认
          </Button>
        </View>
      </View>
    </View>
  )
}

export default VideoEditPage
