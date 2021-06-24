/**
 * 观察者基类
 *
 * 功能：
 *     根据 URL 提供功能，监听页面 DOM 元素
 */

import Vue from 'vue'

Vue.chrome = Vue.prototype.$chrome = chrome || browser

export default abstract class BaseWatcher {
  constructor() {
    this.handle()
  }

  protected abstract handle(): void
}
