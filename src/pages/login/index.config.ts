export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '登录', navigationBarBackgroundColor: '#fff7ed' })
  : { navigationBarTitleText: '登录', navigationBarBackgroundColor: '#fff7ed' }
