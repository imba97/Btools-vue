interface IBtools {
  /**
   * 历史表情模块 是否已加载
   */
  stickerHistory: boolean

  /**
   * 颜文字模块 是否已加载
   */
  kaomoji: boolean
}

declare global {
  interface Window {
    __BTOOLS__: IBtools
  }
}

export {}
