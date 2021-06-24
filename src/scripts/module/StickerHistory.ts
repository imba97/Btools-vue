/**
 * 模块：历史表情
 */

import Util from '@/scripts/base/Util'
import { TComment, IComment } from '@/scripts/base/storage/template'
import BaseModule from '@/scripts/module/BaseModule'
import $ from 'jquery'

export default class StickerHistory extends BaseModule {
  private _addedListener = false
  private _localData: IComment = {}

  protected async handle() {
    if (window.__BTOOLS__.stickerHistory) return
    window.__BTOOLS__.stickerHistory = true

    console.log('历史表情')

    // 表情 按钮被点击 开启初始化
    Util.Instance()
      .getElements('.comment-emoji')
      .then((eles) => {
        eles.forEach((ele) => {
          ele.addEventListener('click', async () => {
            this._localData = await this.getLocalData<IComment, TComment>(
              new TComment({
                stickerHistory: []
              })
            )

            this.Init()
          })
        })
      })
  }

  private async Init() {
    // 表情盒子 title
    const emojiBoxTitle = await Util.Instance().getElement(
      '.emoji-box .emoji-title span'
    )
    // 防止重复添加监听
    if (!this._addedListener) {
      this._addedListener = true
      // 监听 title 内容变化
      $(emojiBoxTitle).on('DOMNodeInserted', (e) => {
        console.log(e.target.tagName)
        /**
         * TODO LIST
         *  - 添加表情元素点击事件
         *  - 点击后添加到历史表情区域
         *  - 存入插件存储
         */
      })
    }
  }
}
