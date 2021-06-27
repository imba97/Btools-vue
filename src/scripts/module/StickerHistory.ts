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

/**
 * 历史表情 DOM 元素信息
 */
class StickerHistoryDomInfo {
  public div: HTMLDivElement[] = []
  public textarea: HTMLTextAreaElement[] = []
}

export default class StickerHistory extends BaseModule {
  private _sticker_history_dom_info?: StickerHistoryDomInfo
  private _addedListener = false
  private _localData: IComment = {}

  protected async handle() {
    if (window.__BTOOLS__.stickerHistory) return
    window.__BTOOLS__.stickerHistory = true

    this._sticker_history_dom_info = new StickerHistoryDomInfo()

    // 读取存储表情
    this._localData = await ExtStorage.Instance().getStorage<
      TComment,
      IComment
    >(
      new TComment({
        stickerHistory: []
      })
    )

    // 在页面添加历史表情
    Util.Instance()
      .getElements('.textarea-container')
      .then((eles) => {
        eles.forEach((ele) => {
          const btools_sticker_history = document.createElement('div')
          btools_sticker_history.setAttribute('class', 'btools-sticker-history')
          ele.appendChild(btools_sticker_history)
          this._sticker_history_dom_info?.div.push(btools_sticker_history)
          this._sticker_history_dom_info?.textarea.push(
            $(ele).find('textarea')[0]
          )
        })
      })
      .then(() => {
        this.createList(this._localData)
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
      // $(emojiBoxTitle).on('DOMNodeInserted', (e) => {
      //   console.log($('.emoji-box .emoji-title').text())
      // })

      const self = this

      $(document).on('click', '.emoji-wrap .emoji-list', async function () {
        const img = $(this).find('img')
        const isKaomoji = img.length === 0
        const text = isKaomoji ? $(this).text() : img.attr('title') || ''
        const src = img.attr('src') || ''

        const stickerHistory: IStickerHistory = {
          isKaomoji,
          text,
          src
        }

        // 如果存在则不做任何操作
        if (
          _.findIndex(self._localData.stickerHistory, stickerHistory) !== -1
        ) {
          return
        }

        self._localData.stickerHistory?.unshift(stickerHistory)

        await ExtStorage.Instance().setStorage<TComment, IComment>(
          new TComment({
            stickerHistory: self._localData.stickerHistory
          })
        )

        self.createList(self._localData)
      })
    }
  }

  private createList(data: IComment) {
    this._sticker_history_dom_info!.div.forEach((ele, domIndex) => {
      if (!data.stickerHistory || data.stickerHistory.length === 0) {
        ele.innerHTML = ''
        return
      }

      const ul = document.createElement('ul')

      data.stickerHistory.forEach((item, index) => {
        const li = document.createElement('li')
        li.setAttribute('class', item.isKaomoji ? 'kaomoji' : 'img')

        li.innerHTML = item.isKaomoji
          ? `<span>${item.text}</span>`
          : `<img src="${item.src}" />`

        li.addEventListener('mousedown', (e: MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()

          // 左键发送表情
          if (e.button === 0) {
            // 插入文字
            this.insertText(item.text, domIndex)

            // 获取是否点击
            const isClick = li.getAttribute('data-is-click')
            // 如果已经点击 则不重复添加监听
            if (isClick === 'true') return
            li.setAttribute('data-is-click', 'true')
            // 添加监听 鼠标移出后把表情排到第一个
            li.addEventListener(
              'mouseleave',
              () => {
                // 先删除
                const removedItem = this._localData.stickerHistory?.splice(
                  index,
                  1
                )
                if (removedItem && removedItem.length === 1)
                  this._localData.stickerHistory?.unshift(removedItem[0])

                this.saveLocalData()
              },
              {
                once: true
              }
            )

            return
          }

          // 中键删除表情
          if (e.button === 1) {
            // 删除对应表情
            this._localData.stickerHistory?.splice(index, 1)
            this.saveLocalData()
          }
        })

        ul.appendChild(li)

        ele.innerHTML = ''
        ele.append(ul)
      })
    })
  }

  private saveLocalData() {
    // 存储删除后的表情
    ExtStorage.Instance()
      .setStorage<TComment, IComment>(
        new TComment({
          stickerHistory: this._localData.stickerHistory
        })
      )
      .then((resData) => {
        // 重新创建表情列表
        this.createList(resData)
      })
  }

  private insertText(text: string, domIndex: number) {
    // 插入文字
    if (this._sticker_history_dom_info) {
      const $t = this._sticker_history_dom_info.textarea[domIndex]
      if ($t.selectionStart || $t.selectionStart === 0) {
        var startPos = $t.selectionStart
        var endPos = $t.selectionEnd
        var scrollTop = $t.scrollTop
        $t.value =
          $t.value.substring(0, startPos) +
          text +
          $t.value.substring(endPos, $t.value.length)
        $t.focus()
        $t.selectionStart = startPos + text.length
        $t.selectionEnd = startPos + text.length
        $t.scrollTop = scrollTop
      } else {
        $t.value += text
        $t.focus()
      }
    }
  }
}
