# 诉苦大会小程序 - 儿童友好设计指南

## 品牌定位

**应用定位**：一个专为 10 岁左右小朋友设计的社交分享平台，让他们可以自由表达心里话

**设计风格**：童趣、温暖、探索、成长、友谊

**目标用户**：10 岁左右的小朋友（小学中年级）

**品牌灵魂**：像儿童绘本一样温暖，像游乐场一样有趣

---

## 气质与意象

**关键词**：
- 🌈 彩虹糖罐 - 每颗都是惊喜
- ☀️ 阳光游乐场 - 充满快乐
- 🏠 魔法树屋 - 温暖的分享空间
- 🎨 儿童绘本 - 简单有趣的故事
- 🧸 毛绒玩具 - 温柔的陪伴

**具象场景**：
- 充满阳光的游乐场，五颜六色的滑梯和秋千
- 孩子们围坐在一起分享故事的小木屋
- 墙上贴满画作的树屋
- 彩虹糖罐子，每一颗都是不同颜色
- 云朵飘过蓝天的瞬间

---

## 配色方案

### 主色调（马卡龙彩虹色系）

**天空蓝（主色）**：`#4FC3F7` Tailwind: `text-sky-400` / `bg-sky-400`
- 意象：晴朗的天空、清澈的湖水
- 用途：主要按钮、重要操作、导航选中态

**柠檬黄（辅助）**：`#FFF59D` Tailwind: `text-yellow-200` / `bg-yellow-200`
- 意象：阳光、柠檬、向日葵
- 用途：背景装饰、高亮提示

**珊瑚粉（辅助）**：`#FF8A80` Tailwind: `text-red-300` / `bg-red-300`
- 意象：草莓、樱花、温暖的心
- 用途：点赞、爱心、重要提示

**薄荷绿（辅助）**：`#81C784` Tailwind: `text-green-300` / `bg-green-300`
- 意象：草地、新鲜蔬菜、健康
- 用途：成功状态、安全提示

**葡萄紫（辅助）**：`#BA68C8` Tailwind: `text-purple-400` / `bg-purple-400`
- 意象：葡萄、魔法、神秘
- 用途：特殊功能、积分奖励

**甜橙色（强调）**：`#FFB74D` Tailwind: `text-orange-300` / `bg-orange-300`
- 意象：橙子、日落、温暖
- 用途：发布按钮、重要操作

### 中性色

**云朵白**：`#FAFAFA` Tailwind: `bg-gray-50`
- 意象：洁白的云朵、棉花糖
- 用途：页面背景、卡片背景

**天空浅粉**：`#FCE4EC` Tailwind: `bg-pink-50`
- 意象：粉色的天空、温柔的梦境
- 用途：特殊页面背景

**深灰**：`#424242` Tailwind: `text-gray-700`
- 意象：温暖的炭笔、温暖的夜晚
- 用途：主要文字

**活力橙**：`#FF7043` Tailwind: `text-orange-500`
- 意象：充满活力的橙色、热情
- 用途：强调文字、链接

### 禁用色

**淡灰**：`#BDBDBD` Tailwind: `text-gray-400` / `bg-gray-300`
- 用途：禁用状态、占位符

---

## 字体规范

### 字体选择

- **中文字体**：使用系统默认字体，优先使用圆润的字体风格
- **字体大小**：
  - 大标题：`text-2xl` (24px)
  - 标题：`text-xl` (20px)
  - 副标题：`text-lg` (18px)
  - 正文：`text-base` (16px)
  - 辅助文字：`text-sm` (14px)
  - 小字：`text-xs` (12px)

### 排版节奏

- **行高**：正文使用 `leading-relaxed` (1.625)
- **字重**：
  - 标题：`font-bold`
  - 正文：`font-normal`
  - 强调：`font-semibold`
- **字间距**：标题使用 `tracking-wide`，正文使用默认

---

## 间距系统

### 页面边距
- 标准边距：`p-5` (20px)
- 大边距：`p-6` (24px)
- 小边距：`p-4` (16px)

### 卡片间距
- 卡片内边距：`p-5` (20px)
- 卡片外边距：`mb-4` (16px)

### 组件间距
- 大间距：`gap-4` (16px)
- 中间距：`gap-3` (12px)
- 小间距：`gap-2` (8px)

---

## 组件规范

### 按钮

#### 主按钮（天空蓝）
```tsx
<View className="bg-sky-400 rounded-3xl px-8 py-4 shadow-lg">
  <Text className="block text-white font-bold text-base">按钮文字</Text>
</View>
```

- 圆角：`rounded-3xl` (24px)
- 阴影：`shadow-lg`
- 内边距：`px-8 py-4`
- 文字：白色、加粗、16px

#### 次按钮（白色描边）
```tsx
<View className="bg-white border-3 border-sky-400 rounded-3xl px-6 py-3 shadow-md">
  <Text className="block text-sky-400 font-semibold text-sm">按钮文字</Text>
</View>
```

- 圆角：`rounded-3xl` (24px)
- 边框：`border-3` (3px)
- 阴影：`shadow-md`
- 文字：天空蓝、加粗、14px

#### 浮动按钮（甜橙色）
```tsx
<View className="bg-gradient-to-r from-orange-300 to-orange-400 rounded-full px-6 py-4 shadow-xl">
  <Text className="block text-white font-bold text-base">📹 开始诉苦</Text>
</View>
```

- 渐变：`from-orange-300 to-orange-400`
- 圆角：`rounded-full`
- 阴影：`shadow-xl`

### 卡片

#### 标准卡片
```tsx
<View className="bg-white rounded-3xl p-5 shadow-md border-2 border-sky-100">
  {/* 卡片内容 */}
</View>
```

- 圆角：`rounded-3xl` (24px)
- 阴影：`shadow-md`
- 边框：`border-2 border-sky-100`

#### 突出卡片（彩色边框）
```tsx
<View className="bg-gradient-to-br from-pink-50 to-sky-50 rounded-3xl p-5 shadow-lg border-3 border-pink-200">
  {/* 卡片内容 */}
</View>
```

- 背景：渐变色
- 边框：`border-3` (3px)
- 阴影：`shadow-lg`

### 输入框
```tsx
<View className="bg-white border-3 border-sky-200 rounded-3xl px-6 py-4 shadow-sm">
  <Input className="w-full bg-transparent text-base" placeholder="请输入..." />
</View>
```

- 圆角：`rounded-3xl` (24px)
- 边框：`border-3` (3px)
- 内边距：`px-6 py-4`

### 标签
```tsx
<View className="bg-sky-100 rounded-full px-4 py-2">
  <Text className="block text-sky-500 text-xs font-semibold">标签文字</Text>
</View>
```

- 圆角：`rounded-full`
- 背景：浅色背景
- 文字：深色文字

### 进度条
```tsx
<View className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
  <View className="h-full bg-gradient-to-r from-sky-400 to-green-300 transition-all" style={{ width: '50%' }} />
</View>
```

- 高度：`h-4` (16px)
- 圆角：`rounded-full`
- 渐变：`from-sky-400 to-green-300`

---

## 导航结构

### TabBar 配置
```typescript
tabBar: {
  color: '#9E9E9E',
  selectedColor: '#4FC3F7',
  backgroundColor: '#FFFFFF',
  borderStyle: 'white',
  list: [
    { pagePath: 'pages/index/index', text: '全部' },
    { pagePath: 'pages/mine/index', text: '我的' },
    { pagePath: 'pages/activity/index', text: '活动' }
  ]
}
```

- 未选中：灰色
- 选中：天空蓝
- 背景：白色

---

## 空状态

```tsx
<View className="bg-white rounded-3xl p-10 text-center shadow-md">
  <Text className="block text-6xl mb-4">📹</Text>
  <Text className="block text-gray-500 text-lg mb-2">还没有内容</Text>
  <Text className="block text-gray-400 text-sm">去发布你的第一个心里话吧</Text>
</View>
```

- 图标：超大尺寸（text-6xl）
- 文字：标题 + 说明
- 样式：卡片式布局

---

## 加载状态

```tsx
<View className="flex items-center justify-center py-10">
  <Text className="block text-sky-400 text-lg">🌈 加载中...</Text>
</View>
```

- 图标：彩虹 emoji
- 文字：浅色说明

---

## 设计禁忌

❌ **禁止使用的设计**：
- 不要使用尖锐的直角，所有元素必须圆润
- 不要使用深色背景，保持明亮温暖
- 不要使用复杂的渐变，使用简单的双色渐变
- 不要使用冷色调，避免蓝色、灰色为主
- 不要使用小字体，最小 12px
- 不要使用密集的布局，保持足够留白

❌ **禁止的颜色组合**：
- 禁止：黑 + 红（太严肃）
- 禁止：深蓝 + 深灰（太冷）
- 禁止：纯黑 + 纯白（太生硬）

---

## 特殊组件

### 等级徽章

```tsx
<View className={`rounded-full px-4 py-2 ${levelColorClass}`}>
  <Text className="block text-xs font-bold">{levelEmoji} {levelName}</Text>
</View>
```

- 圆角：`rounded-full`
- 颜色：根据等级变化

### 卡通形象卡片
```tsx
<View className="bg-gradient-to-br from-sky-100 to-pink-100 rounded-3xl p-8 text-center shadow-lg">
  <Text className="block text-7xl mb-3">{characterEmoji}</Text>
  <Text className="block text-gray-800 font-bold text-2xl mb-1">{characterName}</Text>
  <Text className="block text-gray-500 text-sm">{characterDescription}</Text>
</View>
```

- 背景：渐变色
- 图标：超大尺寸（text-7xl）
- 文字：标题 + 描述

### 倒计时条
```tsx
<View className="bg-white/95 backdrop-blur-sm shadow-lg border-b-3 border-sky-200">
  {/* 倒计时内容 */}
</View>
```

- 背景：半透明白色
- 边框：底部 3px 边框
- 阴影：`shadow-lg`

---

## 页面结构模板

### 标准页面
```tsx
<View className="min-h-screen bg-gray-50 flex flex-col">
  {/* 倒计时条 */}
  <CountdownBar />

  {/* 主要内容 */}
  <View className="p-5 flex-1 pb-24">
    {/* 页面内容 */}
  </View>
</View>
```

### 有浮动按钮的页面
```tsx
<View className="min-h-screen bg-gray-50 flex flex-col">
  {/* 倒计时条 */}
  <CountdownBar />

  {/* 主要内容 */}
  <View className="p-5 flex-1 pb-32">
    {/* 页面内容 */}
  </View>

  {/* 浮动按钮 */}
  <View style={{ position: 'fixed', right: 20, bottom: 80, zIndex: 100 }}>
    {/* 浮动按钮内容 */}
  </View>
</View>
```

---

## 设计原则

1. **儿童优先**：所有设计都要考虑 10 岁儿童的认知能力和操作习惯
2. **温暖友好**：使用温暖的颜色和圆润的形状，营造友好氛围
3. **简单明了**：避免复杂的操作和过多的信息
4. **有趣好玩**：加入游戏化元素和可爱的图标
5. **安全可靠**：使用安全的设计语言，让孩子和家长放心

---

## 图标使用指南

### 常用图标

- ✅ 成功：`✨` `🎉` `🌟` `⭐`
- ❌ 失败：`😔` `😢` `😿`
- 💡 提示：`💡` `🌈` `🎨`
- 📹 视频：`📹` `🎬` `🎥`
- ❤️ 点赞：`❤️` `🤍` `💕`
- 🔒 锁定：`🔒` `🔐`
- 🏆 排名：`🏆` `🥇` `🥈` `🥉`

### 图标大小

- 大图标：`text-6xl` (60px)
- 中图标：`text-4xl` (40px)
- 小图标：`text-2xl` (24px)
- 迷你图标：`text-xl` (20px)

---

## 最后检查

✅ 把产品名遮住，仅凭描述能认出是什么产品吗？
✅ 是否出现了"科技蓝+圆角卡片+蓝紫色渐变"这类万能但无趣的组合？
✅ 所有组件是否都使用了大圆角？
✅ 颜色是否鲜艳活泼？
✅ 字体是否足够大？
✅ 布局是否简单明了？
