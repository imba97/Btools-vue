/**
 * 观察者基类
 *
 * 功能：
 *     根据 URL 提供功能，监听页面 DOM 元素
 */

import _ from 'lodash'

export abstract class WatcherBase {
  protected urls: RegExp[] = []

  constructor() {
    // 初始化（子类设置 urls 等操作）
    this.init()

    let urlIndex = -1

    _.forEach(this.urls, (urlReg, index) => {
      if (urlReg.test(window.location.href)) {
        urlIndex = index
        return false
      }
    })

    // 如果有匹配的 url 则执行处理函数
    if (urlIndex !== -1)
      this.handle({
        index: urlIndex
      })
  }

  protected abstract init(): void
  protected abstract handle(options: HandleOptions): void
}

export interface HandleOptions extends Object {
  index: number
}
