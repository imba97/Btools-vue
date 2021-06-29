/**
 * 监听器基类
 *
 * 功能：
 *     与前端交互，监听API请求，当结果返回后再进行页面操作
 */

import { RequestApiType } from '@/scripts/base/enums/ContentJsType'
import { browser } from 'webextension-polyfill-ts'

interface IContentJs extends Object {
  type: RequestApiType
  tabId?: number
}

export default abstract class BaseListener {
  protected tabId?: number
  protected urls: string[] = []

  constructor() {
    this.init()
  }

  protected init() {
    browser.webRequest.onCompleted.addListener(
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
      browser.tabs.sendMessage(options.tabId, options).then(callback)
      return
    }
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs.length === 0) throw new Error('tabs length is 0')
      browser.tabs.sendMessage(tabs[0].id!, options).then(callback)
    })
  }
}
