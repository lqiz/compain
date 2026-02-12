export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '活动', navigationBarBackgroundColor: '#fff7ed' })
  : { navigationBarTitleText: '活动', navigationBarBackgroundColor: '#fff7ed' }
