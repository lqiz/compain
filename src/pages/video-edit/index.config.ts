export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '编辑视频' })
  : { navigationBarTitleText: '编辑视频' }
