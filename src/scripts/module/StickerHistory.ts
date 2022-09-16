/**
 * 模块
 *  - 历史表情
 *  - 自定义颜文字
 * 
 * 移除原因：评论输入框没法通过获取 dom 修改 value
 */

import Util from '@/scripts/base/Util'
import { TComment, IComment } from '@/scripts/base/storage/template'
import ModuleBase from '@/scripts/module/ModuleBase'
import $ from 'jquery'
import _ from 'lodash'
import { IEmoteItem, IEmotePackage, IStickerHistory } from '@/scripts/base/storage/template/TComment'
import ExtStorage from '@/scripts/base/storage/ExtStorage'
import IconUtil from '@/scripts/base/IconUtil'
import { BilibiliApi } from '@/api'
import { TMultipleAccounts, IMultipleAccounts } from '@/scripts/base/storage/template/TMultipleAccounts'

export class StickerHistory extends ModuleBase {
  private _div!: HTMLDivElement
  private _container!: HTMLDivElement
  private _list!: HTMLUListElement
  private _showMore!: HTMLElement
  private _textarea: HTMLTextAreaElement | null = null

  private _addedListener = false
  private _localData: IComment = {}

  private _emoteList: IEmotePackage[] = []

  private _isAddedCustomizeKaomoji = false

  protected async handle() {
    if (document.querySelector('.btools-sticker-history') !== null) return

    Util.Instance().console('历史表情', 'success')

    // 读取存储表情
    this._localData = await ExtStorage.Instance().getStorage<
      TComment,
      IComment
    >(
      new TComment({
        stickerHistory: [],
        customizeKaomoji: []
      })
    )

    // 添加历史表情页面元素
    this.addStickerHistoryElement()

    // 开启初始化
    this.Init()

    // 创建历史表情列表
    this.createList(this._localData)
  }

  private async addStickerHistoryElement() {
    this._div = document.createElement('div')
    this._div.classList.add('btools-sticker-history')

    // 历史表情 容器 用于定位
    this._container = document.createElement('div')
    this._container.classList.add(
      'btools-sticker-history-container'
    )

    // ul
    this._list = document.createElement('ul')
    this._container.appendChild(this._list)

    // 显示更多 按钮
    this._showMore = document.createElement('button')
    this._showMore.classList.add('btools-sticker-history-show-more')
    this._showMore.setAttribute('data-added-listener', 'false')
    this._showMore.innerHTML = IconUtil.Instance().SHOW_MORE('#CCC')
    this._div.append(this._showMore)

    this._div.appendChild(this._container)
    document.body.appendChild(this._div)
  }

  private async Init() {
    // 防止重复添加监听
    if (this._addedListener) return
    this._addedListener = true

    $('body').on('focus', '.reply-box-warp textarea', (e) => {
      this._textarea = (e.target) as HTMLTextAreaElement
      const textarea = $(this._textarea)
      $(this._div).css({
        top: (textarea.offset()?.top || 0) + 66,
        left: (textarea.offset()?.left || 0) + 80
      }).show()
    })

    $('body').on('blur', '.reply-box-warp textarea', (e) => {
      $(this._div).hide()
    })

    // // 评论类型点击事件
    // $('body').on('click', '.clearfix li', async () => {
    //   // 2.1. 楼中楼默认展开的情况，调用一次 replyListener 并指定 this 为 回复按钮
    //   this.resetViewStatus()
    // })

    // // 给 reply 按钮添加监听
    // $('body').on('click', '.list-item .reply', () => {
    //   this.resetViewStatus()
    // })

    // 表情按钮点击事件
    $('body').on('click', '.reply-box .emoji-btn', async () => {
      // 表情盒子 title
      const emojiBoxTitle = await Util.Instance().getElement(
        '.emoji-panel .emoji-title'
      )

      this._isAddedCustomizeKaomoji = false

      // 监听 表情类型 title 内容变化
      let customizeKaomojiElement: JQuery<HTMLElement>

      $(emojiBoxTitle).on('DOMNodeInserted', async (e) => {
        if (!this._isAddedCustomizeKaomoji) {
          const emoji_box = await Util.Instance().getElement('.emoji-panel')
          // 自定义颜文字 输入框
          customizeKaomojiElement = $(emoji_box)
            .append(
              `
              <div class="customize-kaomoji">
                <input type="text" placeholder="请输入颜文字，回车提交" />
              </div>
            `
            )
            .find('.customize-kaomoji')
            .on('keyup', (e) => {
              // 过滤回车
              if (e.key !== 'Enter') return

              // 不能为空
              if ((e.target as HTMLInputElement).value.trim() === '') return

              const isAdded = this.addCustomizeKaomoji(
                (e.target as HTMLInputElement).value
              )
              // 添加成功
              if (isAdded) {
                // 删除文本框内容
                (e.target as HTMLInputElement).value = ''
              }
            })
          this._isAddedCustomizeKaomoji = true
        }

        if (!customizeKaomojiElement) return

        if ($(emojiBoxTitle).text() === '颜文字') {
          this.createCustomizeKaomoji()
          customizeKaomojiElement?.show()
        } else {
          customizeKaomojiElement?.hide()
          $('.btools-customize-kaomoji').remove()
        }
      })
    })

    // 表情点击事件
    $(document).on('click', '.emoji-content .emoji-info', async (e) => {
      const currentTarget = $(e.currentTarget)
      const img = currentTarget.find('img')

      let stickerHistory: IStickerHistory

      // 没图片则是颜文字
      if (img.length === 0) {
        stickerHistory = {
          isKaomoji: true,
          text: currentTarget.text(),
          src: ''
        }
      } else {
        // 获取当前表情包的类型图片 url
        const currentTypeSrc = $('.emoji-tab .current-type img').attr('src')
        // 根据 url 搜索表情包列表
        const currentEmote = _.find(this._emoteList, item => item.url.indexOf(currentTypeSrc!)) as IEmotePackage

        // 点击表情的图片 url
        const src = img.attr('src') || ''

        if (!currentEmote || src === '') {
          return
        }

        // 再根据表情图片 url 搜表情，最终获取到表情对应的文本
        const emote = _.find(currentEmote.emote, item => item.url.indexOf(src)) as IEmoteItem

        stickerHistory = {
          isKaomoji: false,
          text: emote.text,
          src
        }
      }

      const index = _.findIndex(this._localData.stickerHistory, stickerHistory)

      // 如果存在则只排序
      if (index !== -1) {
        this.removeAndAddToFirst(this._localData.stickerHistory!, index)
        this.save(true)

        return
      }

      this._localData.stickerHistory?.unshift(stickerHistory)

      await ExtStorage.Instance().setStorage<TComment, IComment>(
        new TComment({
          stickerHistory: this._localData.stickerHistory
        })
      )

      this.createList(this._localData)
    })

    // 请求表情列表
    this._emoteList = await BilibiliApi.Instance().emoteList().then(res => {
      return _.get(res, 'data.packages', [])
    })

  }

  private createList(data: IComment) {
    let isShowMore = false

    const ul = $(this._list)
    ul.html('')

    if (!data.stickerHistory || data.stickerHistory.length === 0) {
      return
    }

    data.stickerHistory.forEach((item, index) => {
      const li = document.createElement('li')
      li.setAttribute('class', item.isKaomoji ? 'kaomoji' : 'img')

      li.innerHTML = item.isKaomoji
        ? `<span>${item.text}</span>`
        : `<img src="${item.src}" />`

      li.addEventListener(
        'click',
        (e: MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()

          // 左键发送表情
          if (e.button === 0) {
            // 插入文字
            this.insertText(item.text)

            // 获取是否点击
            const isClick = li.getAttribute('data-is-click')
            // 如果已经点击 则不重复添加监听
            if (isClick === 'true') return
            li.setAttribute('data-is-click', 'true')
            // 添加监听 鼠标移出后把表情排到第一个
            li.addEventListener(
              'mouseleave',
              () => {
                this.removeAndAddToFirst(
                  this._localData.stickerHistory!,
                  index
                )

                this.save(true)
              },
              {
                once: true
              }
            )
          }
        },
        false
      )

      li.addEventListener('mousedown', (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        // 中键删除表情
        if (e.button === 1) {
          // 删除对应表情
          this._localData.stickerHistory?.splice(index, 1)
          this.save(true)
        }
      })

      ul.append(li)
    })

    // 高度大于两行则显示 “显示更多” 按钮
    const ulHeight = ul.height()
    if (ulHeight && ulHeight > 30) {
      isShowMore = true
    }

    if (isShowMore) {
      // 显示
      $(this._showMore).show()

      // 防止重复添加点击事件
      if (this._showMore.getAttribute('data-added-listener') === 'true') return
      this._showMore.setAttribute('data-added-listener', 'true')
      this._showMore.setAttribute('data-is-show', 'false')

      // 添加点击事件
      this._showMore.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const ul = $(this._list)
        const row = (ul.height() || 1) / 30
        const isShow = this._showMore.getAttribute('data-is-show') === 'true'

        if (isShow) {
          // 隐藏
          $(this._container).removeClass('more').css({
            height: 30
          })
        } else {
          // 显示
          $(this._container)
            .addClass('more')
            .css({
              height: 30 * row
            })
        }

        this._showMore.setAttribute('data-is-show', isShow ? 'false' : 'true')
      })
    } else {
      $(this._container).removeClass('more').css({
        height: 30
      })

      $(this._showMore).hide()
    }
  }

  private createCustomizeKaomoji() {
    if (this._localData.customizeKaomoji?.length === 0) return

    _.forEachRight(this._localData.customizeKaomoji, (item) => {
      this.addCustomizeKaomojiToEmojiBox(item.text)
    })
  }

  /**
   * 保存本地存储
   * @param isStickerHistory 是否是历史表情
   */
  private save(isStickerHistory: boolean) {
    const storage = ExtStorage.Instance().setStorage<TComment, IComment>(
      new TComment(this._localData)
    )

    if (isStickerHistory) {
      storage.then((resData) => {
        // 重新创建表情列表
        this.createList(resData)
      })
    }
  }

  private async insertText(text: string) {
    // 插入文字
    const $t = this._textarea!

    if ($t.selectionStart || $t.selectionStart === 0) {
      const startPos = $t.selectionStart
      const endPos = $t.selectionEnd
      const scrollTop = $t.scrollTop
      $t.value = `${$t.value.substring(
        0,
        startPos
      )}${text}${$t.value.substring(endPos, $t.value.length)}`
      $t.focus()
      $t.selectionStart = startPos + text.length
      $t.selectionEnd = startPos + text.length
      $t.scrollTop = scrollTop
    } else {
      $t.value += text
      $t.focus()
    }
  }

  /**
   * 添加颜文字
   * @param val 颜文字
   */
  private addCustomizeKaomoji(val: string): boolean {
    // 检查是否已存在
    const index = _.findIndex(this._localData.customizeKaomoji, {
      text: val
    })

    if (index !== -1) return false

    // 添加界面
    this.addCustomizeKaomojiToEmojiBox(val)

    // 本地存储
    this._localData.customizeKaomoji!.unshift({
      isBig: false,
      text: val
    })

    this.save(false)

    return true
  }

  /**
   * 添加颜文字到颜文字框（添加到界面上）
   * @param val 颜文字
   */
  private async addCustomizeKaomojiToEmojiBox(val: string) {
    const emojiElement = document.createElement('div')
    emojiElement.setAttribute(
      'class',
      'emoji-info btools-customize-kaomoji'
    )
    emojiElement.setAttribute('data-emoji-text', val)
    emojiElement.setAttribute('data-is-click', 'false')
    emojiElement.innerHTML = `
      <div class="text-emoji">${val}</div>
    `

    const enmoji_box = await Util.Instance().getElement(
      '.emoji-panel .emoji-content'
    )
    $(enmoji_box).prepend(emojiElement)

    emojiElement.addEventListener('mousedown', (e) => {
      e.preventDefault()
      e.stopPropagation()

      const isClick = emojiElement.getAttribute('data-is-click')

      const index = _.findIndex(this._localData.customizeKaomoji, {
        text: val
      })

      if (isClick !== 'true') {
        emojiElement.addEventListener(
          'mouseleave',
          () => {
            // 界面
            emojiElement.setAttribute('data-is-click', 'false')
            emojiElement.remove()
            $(enmoji_box).prepend(emojiElement)
            // 存储
            this.removeAndAddToFirst(this._localData.customizeKaomoji!, index)
            this.save(false)
          },
          {
            once: true
          }
        )
      }

      // 左键
      if (e.button === 0) {
        emojiElement.setAttribute('data-is-click', 'true')
        return
      }

      // 中键 删除
      if (e.button === 1) {
        this._localData.customizeKaomoji!.splice(index, 1)

        this.save(false)

        emojiElement.remove()
      }
    })
  }

  private removeAndAddToFirst(arr: Array<any>, index: number) {
    // 先删除
    const removedItem = arr.splice(index, 1)
    // 添加到第一个
    if (removedItem && removedItem.length === 1) arr.unshift(removedItem[0])
  }

  // private resetViewStatus() {
  //   if ($('.open-reply .comment-send').length === 0) {
  //     $(
  //       this._sticker_history_dom_info!.btools_sticker_history['list-item']
  //     ).hide()
  //     return
  //   }

  //   const btoolsStickerHistory = $(
  //     this._sticker_history_dom_info!.btools_sticker_history['list-item']
  //   )

  //   btoolsStickerHistory.show().remove()

  //   $('.open-reply').append(btoolsStickerHistory)
  // }
}
