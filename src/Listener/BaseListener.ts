/**
 * 监听器基类
 */

import Vue from 'vue'

export default class BaseListener {
  protected urls: string[] = []

  constructor() {
    this.init()
  }

  protected init() {
    Vue.chrome.webRequest.onCompleted.addListener(details => {
      // 执行处理函数
      this.handle()
    }, {
      urls: this.urls
    })
  }

  protected handle() {

  }
}
