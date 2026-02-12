# 抖音小程序设计指南

## 品牌定位

- **应用定位**：短视频社交平台
- **设计风格**：沉浸式、简洁、年轻化
- **目标用户**：年轻用户群体（Z世代）

## 配色方案

### 主色板
- **背景色（深色主题）**：`bg-black` / `bg-gray-900`
- **背景色（浅色区域）**：`bg-gray-800` / `bg-gray-700`
- **主色调（品牌色）**：`text-pink-500` / `bg-pink-500`（抖音粉红）
- **辅助色**：`text-cyan-400` / `bg-cyan-400`（抖音青色渐变）

### 中性色
- **主文字**：`text-white`
- **次要文字**：`text-gray-300` / `text-gray-400`
- **边框/分隔线**：`border-gray-700` / `border-gray-600`
- **卡片背景**：`bg-gray-800`

### 语义色
- **成功**：`text-green-400` / `bg-green-500`
- **警告**：`text-yellow-400` / `bg-yellow-500`
- **错误**：`text-red-400` / `bg-red-500`
- **信息**：`text-blue-400` / `bg-blue-500`

## 字体规范

### 字号层级
- **H1（标题）**：`text-2xl` / `font-bold` (24px)
- **H2（副标题）**：`text-xl` / `font-semibold` (20px)
- **H3（卡片标题）**：`text-lg` / `font-semibold` (18px)
- **Body（正文）**：`text-base` / `font-normal` (16px)
- **Small（辅助文字）**：`text-sm` / `font-normal` (14px)
- **Caption（标签）**：`text-xs` / `font-medium` (12px)

### 字体颜色
- **标题**：`text-white`
- **正文**：`text-gray-200`
- **辅助文字**：`text-gray-400`
- **禁用文字**：`text-gray-500`

## 间距系统

### 页面边距
- **页面水平边距**：`px-4` (16px)
- **页面垂直边距**：`py-4` (16px)

### 组件间距
- **组件间距（小）**：`gap-2` (8px)
- **组件间距（中）**：`gap-3` (12px)
- **组件间距（大）**：`gap-4` (16px)

### 卡片内边距
- **卡片内边距**：`p-4` (16px)
- **卡片圆角**：`rounded-xl` (12px)
- **卡片阴影**：`shadow-lg`

## 组件规范

### 按钮
```tsx
{/* 主按钮 - 渐变抖音风格 */}
<View className="bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full px-6 py-3">
  <Text className="block text-white font-semibold text-center">发布视频</Text>
</View>

{/* 次按钮 - 浅色背景 */}
<View className="bg-gray-700 rounded-xl px-6 py-3">
  <Text className="block text-white text-center">选择视频</Text>
</View>

{/* 禁用态 */}
<View className="bg-gray-800 rounded-xl px-6 py-3 opacity-50">
  <Text className="block text-gray-500 text-center">上传中...</Text>
</View>
```

### 卡片
```tsx
{/* 视频卡片 */}
<View className="bg-gray-800 rounded-xl overflow-hidden shadow-lg mb-4">
  {/* 视频预览区 */}
  <View className="aspect-[9/16] bg-black relative">
    <Video src={videoUrl} className="w-full h-full" />
  </View>

  {/* 卡片内容 */}
  <View className="p-4">
    <Text className="block text-white font-semibold text-base mb-2">视频标题</Text>
    <Text className="block text-gray-400 text-sm">视频描述信息</Text>
  </View>
</View>
```

### 输入框
```tsx
{/* 深色风格输入框 */}
<View className="bg-gray-800 rounded-xl px-4 py-3 mb-4">
  <Input
    className="w-full bg-transparent text-white placeholder-gray-500"
    placeholder="输入视频标题"
    placeholderClass="text-gray-500"
  />
</View>

<Textarea
  className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white"
  placeholder="输入视频描述"
  placeholderClass="text-gray-500"
  maxlength={200}
/>
```

### 空状态
```tsx
<View className="flex flex-col items-center justify-center py-12">
  <View className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4">
    <Text className="block text-4xl">📹</Text>
  </View>
  <Text className="block text-gray-400 text-base mb-2">还没有上传视频</Text>
  <Text className="block text-gray-500 text-sm">点击下方按钮上传你的第一个视频</Text>
</View>
```

### 加载态
```tsx
{/* 上传进度 */}
<View className="bg-gray-800 rounded-xl p-4 mb-4">
  <View className="flex justify-between items-center mb-2">
    <Text className="block text-white text-sm">上传中...</Text>
    <Text className="block text-gray-400 text-sm">{progress}%</Text>
  </View>
  <View className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
    <View
      className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 transition-all"
      style={{ width: `${progress}%` }}
    />
  </View>
</View>
```

## 导航结构

### TabBar 配置
```typescript
// src/app.config.ts
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/upload/index',
    'pages/discover/index',
    'pages/profile/index'
  ],
  tabBar: {
    color: '#666666',
    selectedColor: '#fe2c55', // 抖音粉红色
    backgroundColor: '#000000',
    borderStyle: 'black',
    list: [
      { pagePath: 'pages/index/index', text: '首页' },
      { pagePath: 'pages/discover/index', text: '发现' },
      { pagePath: 'pages/upload/index', text: '发布' },
      { pagePath: 'pages/profile/index', text: '我的' }
    ]
  }
})
```

### 页面跳转规范
- TabBar 页面切换：`Taro.switchTab({ url: '/pages/index/index' })`
- 普通页面跳转：`Taro.navigateTo({ url: '/pages/detail/index?id=123' })`
- 返回上一页：`Taro.navigateBack()`

## 特殊组件

### 视频上传选择器
```tsx
{/* 视频选择按钮 */}
<View className="flex items-center justify-center py-8 border-2 border-dashed border-gray-700 rounded-xl bg-gray-800/50">
  <View className="flex flex-col items-center">
    <Text className="block text-4xl mb-2">➕</Text>
    <Text className="block text-white text-base">选择视频</Text>
    <Text className="block text-gray-500 text-sm mt-1">支持 MP4 格式，最大 100MB</Text>
  </View>
</View>
```

### 视频预览区
```tsx
{/* 9:16 竖屏视频预览 */}
<View className="aspect-[9/16] bg-black rounded-xl overflow-hidden relative">
  <Video
    src={videoUrl}
    className="w-full h-full"
    controls
    objectFit="cover"
  />

  {/* 播放次数标签 */}
  <View className="absolute top-2 right-2 bg-black/50 rounded-full px-2 py-1">
    <Text className="block text-white text-xs">1.2w 次播放</Text>
  </View>
</View>
```

## 小程序约束

### 包体积限制
- 主包限制：2MB
- 单个分包限制：2MB
- 整体分包限制：20MB

### 图片策略
- 优先使用 CDN 托管
- 使用 WebP 格式压缩
- 视频封面图压缩至 200KB 以内

### 性能优化
- 视频使用懒加载
- 图片使用懒加载
- 避免长列表渲染，使用虚拟滚动
- 减少 setData 调用频率

### 文件上传限制
- 视频大小限制：100MB
- 视频格式限制：MP4、MOV
- 视频时长限制：最长 5 分钟
