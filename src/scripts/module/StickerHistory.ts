/**
 * 模块：历史表情
 */

import Util from '@/scripts/base/Util'
import { TComment, IComment } from '@/scripts/base/storage/template'
import BaseModule from '@/scripts/module/BaseModule'
import $ from 'jquery'
import _ from 'lodash'
import { IStickerHistory } from '@base/storage/template/TComment'
import ExtStorage from '@base/storage/ExtStorage'
import Vue from 'vue'
import StickerHistoryComponent from '@components/StickerHistory.vue'

export default class StickerHistory extends BaseModule {
  private _addedListener = false
  private _localData: IComment = {}

  protected async handle() {
    if (window.__BTOOLS__.stickerHistory) return
    window.__BTOOLS__.stickerHistory = true

    console.log('历史表情')

    // 在页面添加历史表情
    Util.Instance()
      .getElements('.textarea-container')
      .then((eles) => {
        eles.forEach(async (ele) => {
          const btools_sticker_history = document.createElement('div')
          btools_sticker_history.setAttribute('class', 'btools-sticker-history')
          ele.appendChild(btools_sticker_history)

          this._localData = await this.getLocalData<IComment, TComment>(
            new TComment({
              stickerHistory: []
            })
          )

          const ul = document.createElement('ul')

          this._localData.stickerHistory?.forEach((item) => {
            const li = document.createElement('li')
            li.setAttribute('class', item.isKaomoji ? 'kaomoji' : 'img')

            li.innerHTML = item.isKaomoji
              ? `<span>${item.text}</span>`
              : `<img src="${item.src}" />`

            ul.appendChild(li)
          })

          btools_sticker_history.append(ul)
        })
      })

    // 表情 按钮被点击 开启初始化
    Util.Instance()
      .getElements('.comment-emoji')
      .then((eles) => {
        eles.forEach((ele) => {
          ele.addEventListener('click', async () => {
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
        console.log($('.emoji-box .emoji-title').text())
      })

      const self = this

      $(document).on('click', '.emoji-wrap .emoji-list', function () {
        const img = $(this).find('img')
        const isKaomoji = img.length === 0
        const text = isKaomoji ? $(this).text() : ''
        const src = img.attr('src') || ''

        const stickerHistory: IStickerHistory = {
          isKaomoji,
          text,
          src
        }

        const isNone =
          _.findIndex(self._localData.stickerHistory, stickerHistory) === -1
        console.log('isNone', isNone)

        console.log(stickerHistory)
        self._localData.stickerHistory?.push(stickerHistory)

        ExtStorage.Instance().setStorage<TComment, IComment>(
          new TComment({
            stickerHistory: self._localData.stickerHistory
          })
        )

        // console.log(img.attr('title'))
      })
    }
  }

  private listener(e: Event) {
    console.log(e)
  }
}
