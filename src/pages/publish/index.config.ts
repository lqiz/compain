export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '发布心里话'
    })
  : { navigationBarTitleText: '发布心里话' }
