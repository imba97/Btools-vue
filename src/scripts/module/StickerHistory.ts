/**
 * 模块
 *  - 历史表情
 *  - 自定义颜文字
 */

import Util from '@base/Util'
import { TComment, IComment } from '@base/storage/template'
import ModuleBase from '@/scripts/module/ModuleBase'
import $ from 'jquery'
import _ from 'lodash'
import { IStickerHistory } from '@base/storage/template/TComment'
import ExtStorage from '@base/storage/ExtStorage'
import IconUtil from '@base/IconUtil'

/**
 * 历史表情 DOM 元素信息
 */
class StickerHistoryDomInfo {
  public div: HTMLDivElement[] = []
  public textarea: string[] = []
  public showMore: HTMLButtonElement[] = []
}

export class StickerHistory extends ModuleBase {
  private _sticker_history_dom_info?: StickerHistoryDomInfo
  private _addedListener = false
  private _localData: IComment = {}

  private _isAddedCustomizeKaomoji = false

  protected async handle() {
    if (document.querySelector('.btools-sticker-history') !== null) return

    Util.Instance().console('历史表情', 'success')

    this._sticker_history_dom_info = new StickerHistoryDomInfo()

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

    // 在页面添加历史表情
    // 1. 上面的评论框
    await this.addStickerHistoryElement('.bb-comment')
    // 2. 下面的评论框
    await this.addStickerHistoryElement('.comment-send-lite')

    this.createList(this._localData)

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

  private async addStickerHistoryElement(selector: string) {
    const ele = await Util.Instance().getElement(selector)
    const btools_sticker_history = document.createElement('div')
    btools_sticker_history.setAttribute('class', 'btools-sticker-history')

    // 历史表情 容器 用于定位
    const btools_sticker_history_container = document.createElement('div')
    btools_sticker_history_container.setAttribute(
      'class',
      'btools-sticker-history-container'
    )

    // ul
    const ul = document.createElement('ul')
    btools_sticker_history_container.appendChild(ul)

    // 显示更多 按钮
    const show_more = document.createElement('button')
    show_more.setAttribute('class', 'btools-sticker-history-show-more')
    show_more.setAttribute('data-added-listener', 'false')
    show_more.innerHTML = IconUtil.Instance().SHOW_MORE('#CCC')
    btools_sticker_history.append(show_more)
    this._sticker_history_dom_info?.showMore.push(show_more)

    btools_sticker_history.appendChild(btools_sticker_history_container)
    ele.appendChild(btools_sticker_history)
    this._sticker_history_dom_info?.div.push(btools_sticker_history_container)

    const textarea: string =
      selector === '.bb-comment'
        ? '.bb-comment .comment-send .textarea-container textarea'
        : '.bb-comment .comment-send-lite .textarea-container textarea'

    this._sticker_history_dom_info?.textarea.push(textarea)
  }

  private async Init() {
    // 表情盒子 title
    const emojiBoxTitle = await Util.Instance().getElement(
      '.emoji-box .emoji-title span'
    )
    // 防止重复添加监听
    if (this._addedListener) return
    this._addedListener = true
    // 监听 表情类型 title 内容变化
    let customizeKaomojiElement: JQuery<HTMLElement>
    $(emojiBoxTitle).on('DOMNodeInserted', async (e) => {
      if (!this._isAddedCustomizeKaomoji) {
        const emoji_box = await Util.Instance().getElement('.emoji-box')
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
              ;(e.target as HTMLInputElement).value = ''
            }
          })
        this._isAddedCustomizeKaomoji = true
      }

      if (!customizeKaomojiElement) return

      if ($('.emoji-box .emoji-title').text() === '颜文字') {
        this.createCustomizeKaomoji()
        customizeKaomojiElement?.show()
      } else {
        customizeKaomojiElement?.hide()
      }
    })

    const self = this

    // 表情点击事件
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

      const index = _.findIndex(self._localData.stickerHistory, stickerHistory)

      // 如果存在则只排序
      if (index !== -1) {
        self.removeAndAddToFirst(self._localData.stickerHistory!, index)
        self.save(true)

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

  private createList(data: IComment) {
    let isShowMore = false

    this._sticker_history_dom_info!.div.forEach((ele, domIndex) => {
      const ul = $(ele).find('ul')
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

              return
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
    })

    // 显示更多
    const showMore = this._sticker_history_dom_info?.showMore
    if (!showMore) return

    if (isShowMore) {
      showMore.forEach((show_more, index) => {
        // 显示
        $(show_more).show()

        // 防止重复添加点击事件
        if (show_more.getAttribute('data-added-listener') === 'true') return
        show_more.setAttribute('data-added-listener', 'true')
        show_more.setAttribute('data-is-show', 'false')

        // 添加点击事件
        show_more.addEventListener('click', (e: MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()

          const div = this._sticker_history_dom_info!.div[index]

          const ul = $(div).find('ul')
          const row = (ul.height() || 1) / 30
          const isShow = show_more.getAttribute('data-is-show') === 'true'

          if (isShow) {
            // 隐藏
            $(div).removeClass('more').css({
              height: 30
            })
          } else {
            // 显示
            $(div)
              .addClass('more')
              .css({
                height: 30 * row
              })
          }

          show_more.setAttribute('data-is-show', isShow ? 'false' : 'true')
        })
      })
    } else {
      showMore.forEach((show_more, index) => {
        const div = this._sticker_history_dom_info!.div[index]
        $(div).removeClass('more').css({
          height: 30
        })

        $(show_more).hide()
      })
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

  private async insertText(text: string, domIndex: number) {
    // 插入文字
    if (this._sticker_history_dom_info) {
      const $t = (await Util.Instance().getElement(
        this._sticker_history_dom_info.textarea[domIndex]
      )) as HTMLTextAreaElement
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
    const a = document.createElement('a')
    a.setAttribute(
      'class',
      'emoji-list emoji-text emoji-default btools-customize-kaomoji'
    )
    a.setAttribute('data-emoji-text', val)
    a.setAttribute('data-is-click', 'false')
    a.innerText = val

    const enmoji_box = await Util.Instance().getElement(
      '.emoji-box .emoji-wrap'
    )
    $(enmoji_box).prepend(a)

    a.addEventListener('mousedown', (e) => {
      e.preventDefault()
      e.stopPropagation()

      const isClick = a.getAttribute('data-is-click')

      const index = _.findIndex(this._localData.customizeKaomoji, {
        text: val
      })

      if (isClick !== 'true') {
        a.addEventListener(
          'mouseleave',
          () => {
            // 界面
            a.setAttribute('data-is-click', 'false')
            a.remove()
            $(enmoji_box).prepend(a)
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
        a.setAttribute('data-is-click', 'true')
        return
      }

      // 中键 删除
      if (e.button === 1) {
        this._localData.customizeKaomoji!.splice(index, 1)

        this.save(false)

        a.remove()
      }
    })
  }

  private removeAndAddToFirst(arr: Array<any>, index: number) {
    // 先删除
    const removedItem = arr.splice(index, 1)
    // 添加到第一个
    if (removedItem && removedItem.length === 1) arr.unshift(removedItem[0])
  }
}
