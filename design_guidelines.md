# 诉苦大会设计指南

## 品牌定位

- **应用名称**：诉苦大会
- **应用定位**：孩子吐槽家长小程序
- **设计风格**：温馨、轻松、可爱、包容
- **目标用户**：15岁以下的小朋友
- **品牌标语**：孩子的心里话，我们来发布

## 配色方案

### 主色板
- **背景色**：`bg-orange-50` / `bg-amber-50`（温暖橙色系）
- **卡片背景**：`bg-white`
- **主色调（品牌色）**：`text-orange-500` / `bg-orange-500`（温暖橙色）
- **辅助色**：`text-pink-400` / `bg-pink-400`（可爱粉色）
- **强调色**：`text-yellow-400` / `bg-yellow-400`（活力黄色）

### 中性色
- **主文字**：`text-gray-800`
- **次要文字**：`text-gray-600`
- **提示文字**：`text-gray-500`
- **禁用文字**：`text-gray-400`
- **边框**：`border-orange-200`
- **分割线**：`border-gray-200`

### 等级色
- **青铜**：`bg-amber-700` / `text-amber-700`
- **白银**：`bg-gray-300` / `text-gray-600`
- **黄金**：`bg-yellow-400` / `text-yellow-500`
- **铂金**：`bg-cyan-400` / `text-cyan-500`

### 语义色
- **成功**：`text-green-500` / `bg-green-500`
- **警告**：`text-yellow-500` / `bg-yellow-500`
- **错误**：`text-red-400` / `bg-red-400`
- **信息**：`text-blue-500` / `bg-blue-500`

## 字体规范

### 字号层级
- **H1（应用标题）**：`text-3xl` / `font-bold` (30px)
- **H2（页面标题）**：`text-2xl` / `font-bold` (24px)
- **H3（卡片标题）**：`text-xl` / `font-semibold` (20px)
- **Body（正文）**：`text-base` / `font-normal` (16px)
- **Small（辅助文字）**：`text-sm` / `font-normal` (14px)
- **Caption（标签）**：`text-xs` / `font-medium` (12px)

### 字体颜色
- **标题**：`text-gray-800`
- **正文**：`text-gray-700`
- **辅助文字**：`text-gray-500`
- **禁用文字**：`text-gray-400`
- **链接/强调**：`text-orange-500`

## 间距系统

### 页面边距
- **页面水平边距**：`px-5` (20px)
- **页面垂直边距**：`py-5` (20px)
- **安全区域**：`safe-area-inset`（适配刘海屏）
- **底部导航预留**：`pb-20` (80px) - 避开 TabBar

### 组件间距
- **组件间距（小）**：`gap-3` (12px)
- **组件间距（中）**：`gap-4` (16px)
- **组件间距（大）**：`gap-5` (20px)

### 卡片间距
- **卡片内边距**：`p-5` (20px)
- **卡片外边距**：`mb-4` (16px)
- **卡片圆角**：`rounded-2xl` (16px)
- **卡片阴影**：`shadow-sm`

## 组件规范

### 倒计时组件（左上角）
```tsx
<View className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 px-5 py-3">
  <View className="flex items-center justify-between">
    <View className="flex items-center">
      <Text className="block text-2xl mr-2">⏰</Text>
      <View>
        <Text className="block text-gray-800 font-semibold text-sm">
          本场结束倒计时
        </Text>
        <Text className="block text-orange-500 font-bold text-xl">
          {formatTime(countdown)}
        </Text>
      </View>
    </View>
    <View className="bg-orange-100 rounded-full px-3 py-1">
      <Text className="block text-orange-600 text-xs">
        第 {currentRound} 场
      </Text>
    </View>
  </View>
</View>
```

### 等级徽章
```tsx
{/* 青铜等级 */}
<View className="bg-amber-700 rounded-full px-3 py-1">
  <Text className="block text-white text-xs font-semibold">🥉 青铜</Text>
</View>

{/* 白银等级 */}
<View className="bg-gray-300 rounded-full px-3 py-1">
  <Text className="block text-gray-700 text-xs font-semibold">🥈 白银</Text>
</View>

{/* 黄金等级 */}
<View className="bg-yellow-400 rounded-full px-3 py-1">
  <Text className="block text-yellow-900 text-xs font-semibold">🥇 黄金</Text>
</View>

{/* 铂金等级 */}
<View className="bg-cyan-400 rounded-full px-3 py-1">
  <Text className="block text-cyan-900 text-xs font-semibold">💎 铂金</Text>
</View>
```

### 积分进度条
```tsx
<View className="bg-white border-2 border-orange-200 rounded-2xl p-4 mb-4">
  <View className="flex justify-between items-center mb-2">
    <Text className="block text-gray-800 font-semibold text-base">我的等级</Text>
    <View className="flex items-center">
      <Text className="block text-gray-600 text-sm mr-2">{points} 积分</Text>
      <LevelBadge level={level} />
    </View>
  </View>
  <View className="w-full h-3 bg-orange-100 rounded-full overflow-hidden">
    <View
      className="h-full bg-orange-500 transition-all"
      style={{ width: `${progressPercent}%` }}
    />
  </View>
  <Text className="block text-gray-500 text-xs mt-2">
    再获得 {nextLevelPoints - points} 积分升级到 {nextLevelName}
  </Text>
</View>
```

### 按钮规范
```tsx
{/* 主按钮 - 温暖橙色 */}
<View className="bg-orange-500 rounded-2xl px-6 py-3 shadow-sm">
  <Text className="block text-white font-semibold text-center text-base">开始诉苦</Text>
</View>

{/* 次按钮 - 浅色边框 */}
<View className="bg-white border-2 border-orange-300 rounded-2xl px-6 py-3">
  <Text className="block text-orange-500 font-semibold text-center text-base">返回首页</Text>
</View>

{/* 禁用态 */}
<View className="bg-gray-200 rounded-2xl px-6 py-3 opacity-50">
  <Text className="block text-gray-400 text-center text-base">请先登录</Text>
</View>
```

### 卡片规范
```tsx
{/* 诉苦卡片 */}
<View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
  {/* 用户信息 */}
  <View className="flex items-center mb-3">
    <View className="w-10 h-10 bg-orange-200 rounded-full mr-3" />
    <View className="flex-1">
      <Text className="block text-gray-800 font-semibold text-base">小明</Text>
      <Text className="block text-gray-500 text-xs">10岁 · 今天</Text>
    </View>
  </View>

  {/* 内容 */}
  <Text className="block text-gray-700 text-base mb-3">
    妈妈总是逼我吃胡萝卜，我真的很讨厌！
  </Text>
</View>

{/* 合成视频卡片 */}
<View className="bg-white rounded-2xl p-5 shadow-sm mb-4 border-2 border-purple-200">
  <View className="flex items-center justify-between mb-3">
    <View className="flex items-center">
      <Text className="block text-2xl mr-2">🎬</Text>
      <Text className="block text-purple-600 font-semibold text-sm">合成视频</Text>
    </View>
    <View className="bg-purple-100 rounded-full px-2 py-1">
      <Text className="block text-purple-700 text-xs">
        包含 {videoCount} 个小朋友的诉苦
      </Text>
    </View>
  </View>

  <View className="aspect-[9/16] bg-gray-100 rounded-xl overflow-hidden mb-3">
    <Video src={videoUrl} className="w-full h-full" controls />
  </View>

  <View className="flex items-center justify-between">
    <Text className="block text-gray-500 text-xs">
      已分享到抖音
    </Text>
    <Text className="block text-gray-500 text-xs">
      {publishTime}
    </Text>
  </View>
</View>
```

### 输入框规范
```tsx
{/* 温暖风格输入框 */}
<View className="bg-white border-2 border-orange-200 rounded-2xl px-4 py-3 mb-4">
  <Input
    className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-base"
    placeholder="输入你的昵称"
    placeholderClass="text-gray-400"
  />
</View>

{/* 文本域 */}
<View className="bg-white border-2 border-orange-200 rounded-2xl px-4 py-3 mb-4">
  <Textarea
    className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-base min-h-[150px]"
    placeholder="分享你的心里话..."
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
```

### 空状态规范
```tsx
<View className="flex flex-col items-center justify-center py-12">
  <Text className="block text-6xl mb-4">📢</Text>
  <Text className="block text-gray-600 text-base mb-2">还没有诉苦内容</Text>
  <Text className="block text-gray-500 text-sm">来分享你的心里话吧</Text>
</View>
```

### 提示框规范
```tsx
{/* 温馨提示 */}
<View className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4">
  <Text className="block text-yellow-700 font-semibold text-sm mb-1">💡 温馨提示</Text>
  <Text className="block text-yellow-600 text-xs">
    这里只允许 15 岁以下的小朋友使用哦
  </Text>
</View>
```

## 导航结构

### TabBar 配置
```typescript
// src/app.config.ts
export default defineAppConfig({
  pages: [
    'pages/login/index',
    'pages/index/index',
    'pages/mine/index',
    'pages/activity/index'
  ],
  tabBar: {
    color: '#666666',
    selectedColor: '#f97316', // 橙色
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/index/index', text: '全部' },
      { pagePath: 'pages/mine/index', text: '我的' },
      { pagePath: 'pages/activity/index', text: '活动' }
    ]
  }
})
```

### 页面跳转规范
- 登录页 → 首页：`Taro.redirectTo({ url: '/pages/index/index' })`
- TabBar 页面切换：`Taro.switchTab({ url: '/pages/index/index' })`
- 未登录跳转：`Taro.redirectTo` 替换当前页面

## 等级系统

### 等级规则
- **青铜**：初始等级，0 积分
- **白银**：150 积分
- **黄金**：250 积分
- **铂金**：400 积分

### 积分规则
- 发布视频：+10 积分
- 视频被合成：+20 积分
- 每日签到：+5 积分

## 特殊组件

### 登录成功提示
```tsx
<View className="flex flex-col items-center justify-center py-12">
  <Text className="block text-6xl mb-4">🎉</Text>
  <Text className="block text-gray-800 font-bold text-2xl mb-2">欢迎来到诉苦大会！</Text>
  <Text className="block text-gray-600 text-base mb-6">
    孩子的心里话，我们来发布
  </Text>

  <View className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
    <Text className="block text-green-700 text-sm text-center">
      你已成功登录，快去发布你的心里话吧！
    </Text>
  </View>
</View>
```

### 年龄限制提示
```tsx
<View className="flex flex-col items-center justify-center py-12">
  <Text className="block text-6xl mb-4">😢</Text>
  <Text className="block text-gray-800 font-bold text-2xl mb-2">抱歉</Text>
  <Text className="block text-gray-600 text-base mb-6 text-center">
    诉苦大会只允许 15 岁以下的小朋友使用哦
  </Text>

  <View className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
    <Text className="block text-red-700 text-sm text-center">
      如果你是 15 岁以下的小朋友，请返回重新选择年龄
    </Text>
  </View>
</View>
```

## 图标与表情

### 常用表情
- 📢（诉苦）
- 🎉（庆祝）
- 😢（遗憾）
- 💡（提示）
- ✨（亮点）
- 💬（评论）
- ❤️（点赞）
- ⏰（倒计时）
- 🎬（合成视频）
- 🥉🥈🥇💎（等级徽章）

### 图标使用
- 使用 Text 组件展示表情符号
- 统一使用 `text-4xl` 大小
- 保持表情风格一致

## 小程序约束

### 包体积限制
- 主包限制：2MB
- 单个分包限制：2MB
- 整体分包限制：20MB

### 性能优化
- 图片使用懒加载
- 视频使用懒加载
- 减少 setData 调用频率
- 使用骨架屏优化加载体验

### 安全与隐私
- 不收集用户真实姓名
- 不收集用户联系方式
- 不存储用户地理位置
- 对用户昵称进行脱敏处理
