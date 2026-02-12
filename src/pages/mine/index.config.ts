export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '我的', navigationBarBackgroundColor: '#fff7ed' })
  : { navigationBarTitleText: '我的', navigationBarBackgroundColor: '#fff7ed' }
