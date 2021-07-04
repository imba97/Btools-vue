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
    // 直播间 打开封面 用
    __NEPTUNE_IS_MY_WAIFU__: any
  }
}

export {}
