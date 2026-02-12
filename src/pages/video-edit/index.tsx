import { View, Text, Video, Slider, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useRef } from 'react'

const VideoEditPage = () => {
  // 视频信息
  const [videoPath, setVideoPath] = useState<string>('')
  const [videoDuration, setVideoDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  // 编辑器状态
  const [startTime, setStartTime] = useState<number>(0)
  const [endTime, setEndTime] = useState<number>(0)
  const [selectedDuration, setSelectedDuration] = useState<number>(0)

  const videoRef = useRef<any>(null)
  const MAX_DURATION = 30 // 最大选择时长30秒

  Taro.useLoad(() => {
    // 从参数获取视频路径和时长
    // 使用 Taro.getCurrentInstance 获取路由参数（兼容 H5 和小程序）
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
    // 回到选择区域的开始位置
    videoRef.current?.seek(startTime)
  }

  // 监听播放时间更新
  const handleTimeUpdate = (e: any) => {
    const time = e.detail.currentTime
    setCurrentTime(time)

    // 如果播放到选择区域的结束时间，自动暂停
    if (time >= endTime) {
      videoRef.current?.seek(startTime)
      videoRef.current?.play()
    }
  }

  // 播放预览：播放选择的片段
  const playPreview = () => {
    videoRef.current?.seek(startTime)
    videoRef.current?.play()
    setIsPlaying(true)
  }

  // 开始时间滑块变化
  const handleStartTimeChange = (value: number) => {
    let newStart = value

    // 确保开始时间小于结束时间
    if (newStart >= endTime) {
      newStart = endTime - 1
    }

    // 确保选择时长不超过30秒
    const newDuration = endTime - newStart
    if (newDuration > MAX_DURATION) {
      newStart = endTime - MAX_DURATION
    }

    setStartTime(newStart)
    setSelectedDuration(endTime - newStart)
  }

  // 结束时间滑块变化
  const handleEndTimeChange = (value: number) => {
    let newEnd = value

    // 确保结束时间大于开始时间
    if (newEnd <= startTime) {
      newEnd = startTime + 1
    }

    // 确保选择时长不超过30秒
    const newDuration = newEnd - startTime
    if (newDuration > MAX_DURATION) {
      newEnd = startTime + MAX_DURATION
    }

    setEndTime(newEnd)
    setSelectedDuration(newEnd - startTime)
  }

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 确认选择
  const handleConfirm = () => {
    // 使用 Taro.eventCenter 传递数据
    Taro.eventCenter.trigger('videoSegment', {
      startTime,
      endTime,
      duration: selectedDuration
    })

    // 返回上一页
    Taro.navigateBack()
  }

  // 取消编辑
  const handleCancel = () => {
    Taro.navigateBack()
  }

  return (
    <View className="h-screen bg-gray-900 flex flex-col">
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
            <Text className="text-sm">{formatTime(currentTime)}</Text>
            <Text className="text-sm">{formatTime(videoDuration)}</Text>
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

      {/* 时间轴和滑块区域 */}
      <View className="flex-1 bg-gray-800 flex flex-col justify-center px-4 py-6">
        {/* 选择时长提示 */}
        <View className="mb-6 flex items-center justify-between">
          <Text className="text-white text-lg font-semibold">选择视频片段</Text>
          <View className="flex items-center">
            <Text className="text-orange-400 text-2xl font-bold">
              {formatTime(selectedDuration)}
            </Text>
            <Text className="text-gray-400 text-sm ml-2">/ 最多30秒</Text>
          </View>
        </View>

        {/* 开始时间滑块 */}
        <View className="mb-8">
          <View className="flex items-center justify-between mb-2">
            <Text className="text-gray-300 text-sm">开始时间</Text>
            <Text className="text-orange-400 text-sm font-semibold">
              {formatTime(startTime)}
            </Text>
          </View>
          <Slider
            value={startTime}
            min={0}
            max={videoDuration}
            step={0.1}
            activeColor="#f97316"
            backgroundColor="#374151"
            blockColor="#f97316"
            blockSize={20}
            showValue={false}
            onChange={(e) => handleStartTimeChange(e.detail.value)}
          />
        </View>

        {/* 结束时间滑块 */}
        <View className="mb-8">
          <View className="flex items-center justify-between mb-2">
            <Text className="text-gray-300 text-sm">结束时间</Text>
            <Text className="text-orange-400 text-sm font-semibold">
              {formatTime(endTime)}
            </Text>
          </View>
          <Slider
            value={endTime}
            min={0}
            max={videoDuration}
            step={0.1}
            activeColor="#f97316"
            backgroundColor="#374151"
            blockColor="#f97316"
            blockSize={20}
            showValue={false}
            onChange={(e) => handleEndTimeChange(e.detail.value)}
          />
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
