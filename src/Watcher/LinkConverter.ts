/**
 * 链接转换
 */

import Util from '@/scripts/base/Util'
import { WatcherBase, HandleOptions } from '@/Watcher/WatcherBase'
import $ from 'jquery'
import _ from 'lodash'

export class LinkConverter extends WatcherBase {
  private _url_reg =
    /(?<!href=")(https?:\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|])/g

  protected init(): void {
    this.urls[LinkConverterEnum.Video] = /bilibili\.com\/video/
    this.urls[LinkConverterEnum.Read] = /bilibili\.com\/read/
  }

  protected handle(options: HandleOptions): void {
    Util.Instance().console('链接转换', 'success')

    switch (options.index) {
      case LinkConverterEnum.Video:
        this.video()
        break
      case LinkConverterEnum.Read:
        this.read()
        break
    }
  }

  private async video() {
    // 添加 title 内容监听 如果变化说明切换视频了
    const video_title = await Util.Instance().getElement('.video-title')
    $(video_title).on('DOMNodeInserted', () => {
      this.onTitleChange()
    })
  }

  /**
   * 标题发生变化
   */
  private async onTitleChange() {
    // 获取简介
    const desc_info = await Util.Instance().getElement('.desc-info span')

    // 替换 url
    const html = desc_info.innerHTML.replace(this._url_reg, (url) => {
      return `<a href="${url}" target="_blank">${url}</a>`
    })

    desc_info.innerHTML = html
  }

  private read() {
    window.onload = async () => {
      const article_p = await Util.Instance().getElements(
        '#read-article-holder p'
      )

      // 循环所有 p 标签
      article_p.forEach((p) => {
        // 替换 url
        const html = p.innerHTML.replace(this._url_reg, (url) => {
          return `<a href="${url}" target="_blank">${url}</a>`
        })

        p.innerHTML = html
      })
    }
  }
}

enum LinkConverterEnum {
  /**
   * 视频简介
   */
  Video,

  /**
   * 专栏文章
   */
  Read
}
