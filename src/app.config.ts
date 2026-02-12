export default defineAppConfig({
  pages: [
    'pages/login/index',
    'pages/index/index',
    'pages/mine/index',
    'pages/activity/index',
    'pages/publish/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff7ed',
    navigationBarTitleText: '诉苦大会',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#666666',
    selectedColor: '#f97316',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/index/index', text: '全部' },
      { pagePath: 'pages/activity/index', text: '活动' },
      { pagePath: 'pages/mine/index', text: '我的' }
    ]
  }
})
