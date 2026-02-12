/**
 * H5 端特殊样式注入
 * 如无必要，请勿修改本文件
 */
export function injectH5Styles() {
  if (TARO_ENV !== 'h5') return

  const style = document.createElement('style')
  style.innerHTML = `
/* H5 端隐藏 TabBar 空图标（只隐藏没有 src 的图标） */
.weui-tabbar__icon:not([src]),
.weui-tabbar__icon[src=''] {
  display: none !important;
}

.weui-tabbar__item:has(.weui-tabbar__icon:not([src])) .weui-tabbar__label,
.weui-tabbar__item:has(.weui-tabbar__icon[src='']) .weui-tabbar__label {
  margin-top: 0 !important;
}
  `
  document.head.appendChild(style)
}
