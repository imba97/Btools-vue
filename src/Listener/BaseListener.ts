/**
 * 监听器基类
 *
 * 功能：
 *     监听API请求，当结果返回后再进行页面操作
 */

import Vue from 'vue'
import { IContentJs } from '@/scripts/base/interface/IContentJs'

export default abstract class BaseListener {
  protected tabId?: number
  protected urls: string[] = []

  constructor() {
    this.init()
  }

  protected init() {
    Vue.chrome.webRequest.onCompleted.addListener(
      (details) => {
        this.tabId = details.tabId
        // 执行处理函数
        this.handle()
      },
      {
        urls: this.urls
      }
    )
  }

  protected abstract handle(): void

  /**
   * 向 Content Js 发送数据
   * @param options
   * @param callback
   * @returns
   */
  protected sendToContentJs(
    options: IContentJs,
    callback: (response: any) => void
  ) {
    // 如果传了 tabId 则直接用这个
    if (typeof options.tabId !== 'undefined') {
      Vue.chrome.tabs.sendMessage(options.tabId, options, callback)
      return
    }
    Vue.chrome.tabs.query(
      { active: true, currentWindow: true },
      function (tabs) {
        if (tabs.length === 0) throw new Error('tabs length is 0')
        Vue.chrome.tabs.sendMessage(tabs[0].id!, options, callback)
      }
    )
  }
}
