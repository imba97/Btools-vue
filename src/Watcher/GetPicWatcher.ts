/**
 * 获取封面
 */

import Util from '@/scripts/base/Util'
import { WatcherBase, HandleOptions } from '@/Watcher/WatcherBase'
import $ from 'jquery'
import IconUtil from '@/scripts/base/IconUtil'
import { default as HKM, HKMElement } from '@/scripts/base/HotKeyMenu'

export class GetPicWatcher extends WatcherBase {
  protected init(): void {
    this.urls[GetPicEnum.Video] = /bilibili\.com\/video/
    this.urls[GetPicEnum.Bangumi] = /bilibili\.com\/bangumi/
    this.urls[GetPicEnum.Medialist] = /bilibili\.com\/medialist/
    this.urls[GetPicEnum.Read] = /bilibili\.com\/read/
    this.urls[GetPicEnum.LiveRoom] = /live\.bilibili\.com/
  }
  protected handle(options: HandleOptions): void {
    Util.Instance().console('获取图片', 'success')

    switch (options.index) {
      case GetPicEnum.Video:
        this.video()
        break
      case GetPicEnum.Bangumi:
        this.bangumi()
        break
      case GetPicEnum.Medialist:
        this.medialist()
        break

      case GetPicEnum.Read:
        window.addEventListener('load', () => {
          this.read()
        })
        break
      case GetPicEnum.LiveRoom:
        this.liveRoom()
        break
    }
  }

  private async video(selector?: string): Promise<HKM> {
    // 获取 Btools 按钮 父元素
    const btools_box = await Util.Instance().getElement(selector || 'body')

    // 添加 Btools 按钮
    $(btools_box).append(
      `
        <div class="btools-get-pic-video">
          ${IconUtil.Instance().LOGO()}
        </div>
        `
    )

    const btools_button = $('.btools-get-pic-video')

    // 添加 快捷键菜单
    const hkm = new HKM(btools_button[0]).add([
      {
        key: 'S',
        title: '打开封面',
        action: () => {
          this.executeScript(`
            if(
              window.__INITIAL_STATE__ &&
              window.__INITIAL_STATE__.elecFullInfo
            )
            window.open(window.__INITIAL_STATE__.elecFullInfo.data.pic)
          `)
        }
      }
    ])

    btools_button.hide()

    $(() => {
      this.resetHkmPosition(hkm)
      btools_button.show()
    })

    window.addEventListener('resize', () => {
      this.resetHkmPosition(hkm)
    })

    return Promise.resolve(hkm)
  }

  private async bangumi() {
    // 有 video
    const hkm = await this.video()
    hkm.removeWithKey('S').add([
      {
        key: 'S',
        title: '打开封面',
        action: () => {
          this.executeScript(`
          if(
            window.__INITIAL_STATE__ &&
            window.__INITIAL_STATE__.epInfo
          )
          window.open(window.__INITIAL_STATE__.epInfo.cover)
        `)
        }
      },
      {
        key: 'D',
        title: '打开海报',
        action: () => {
          this.executeScript(`
          if(
            window.__INITIAL_STATE__ &&
            window.__INITIAL_STATE__.mediaInfo
          )
          window.open(window.__INITIAL_STATE__.mediaInfo.cover)
        `)
        }
      }
    ])
  }

  private async medialist() {
    // 有 video

    await Util.Instance().getElement(
      '.player-auxiliary-playlist-item-active img'
    )

    const hkm = await this.video()
    $(hkm.getElement(HKMElement.OverlordElements)!).show()
    hkm.removeWithKey('S').add([
      {
        key: 'S',
        title: '打开封面',
        action: async () => {
          const img = await Util.Instance().getElement(
            '.player-auxiliary-playlist-item-active img'
          )
          window.open(this.getOriginalDrawing(img as HTMLImageElement))
        }
      }
    ])
  }

  private async read() {
    const imgs = await Util.Instance().getElements('#article-content img')

    new HKM(imgs).add([
      {
        key: 'S',
        title: '打开原图',
        action: (img) => {
          this.openOriginalDrawing(img as HTMLImageElement)
        }
      },
      {
        key: 'D',
        title: '新窗口打开',
        action: (img) => {
          window.open(this.getOriginalDrawing(img as HTMLImageElement))
        }
      }
    ])
  }

  private async liveRoom() {
    // 获取 Btools 按钮 父元素
    const btools_box = await Util.Instance().getElement(
      '.supporting-info .live-skin-coloration-area'
    )

    // 添加 Btools 按钮
    const btools_button = $(btools_box)
      .prepend(
        `
      <div class="btools-get-pic-live-room">
        <i>${IconUtil.Instance().LOGO()}</i>
        <span>Btools</span>
      </div>
    `
      )
      .find('.btools-get-pic-live-room')

    // 添加 快捷键菜单
    new HKM(btools_button[0]).add([
      {
        key: 'S',
        title: '打开封面',
        action: () => {
          this.executeScript(`
            if(
              window.__NEPTUNE_IS_MY_WAIFU__ &&
              window.__NEPTUNE_IS_MY_WAIFU__.roomInfoRes
            )
            window.open(window.__NEPTUNE_IS_MY_WAIFU__.roomInfoRes.data.room_info.cover)
          `)
        }
      }
    ])
  }

  /**
   * 重置快捷键菜单的位置，到播放器左上角
   * @param hkm 快捷键菜单
   */
  private resetHkmPosition(hkm: HKM) {
    const player = $('#bilibiliPlayer')
    hkm.setCss(HKMElement.OverlordElements, {
      top: (player.offset()?.top || 0) + 10,
      left: (player.offset()?.left || 0) - 40
    })
  }

  /**
   * 获取图片原图链接
   * @param img 图片 元素
   * @returns 原图链接
   */
  private getOriginalDrawing(img: HTMLImageElement) {
    const srcSplit = img.src.split('@')
    if (srcSplit.length > 1) {
      return srcSplit[0]
    } else {
      return img.src
    }
  }

  /**
   * 打开原图
   * @param img
   */
  private async openOriginalDrawing(img: HTMLImageElement) {
    // 获取页面上的打开原图容器
    let container = document.querySelector('.btools-origina-drawing-container')
    let content = document.querySelector(
      '.btools-origina-drawing-container .btools-img'
    )
    let image = document.querySelector(
      '.btools-origina-drawing-container .btools-content img'
    )
    // 如果没则创建
    if (container === null) {
      // 容器
      container = document.createElement('div')
      container.setAttribute('class', 'btools-origina-drawing-container')

      // 内容
      image = document.createElement('img')

      content = document.createElement('div')
      content.setAttribute('class', 'btools-content')

      // 背景
      const background = document.createElement('div')
      background.setAttribute('class', 'btools-background')

      content.appendChild(image)

      container.appendChild(content)
      container.appendChild(background)

      document.body.appendChild(container)

      // 图片已加载 时间监听
      image.addEventListener('load', () => {
        const imgDom = $(image!)
        const containerDom = $(container!)
        // 显示容器
        containerDom.show()

        // 滚动条复原
        $(content!).scrollTop(0).scrollLeft(0)

        const imageWidth = imgDom.outerWidth()
        const imageHeight = imgDom.outerHeight()

        const imageViewWidth = containerDom.outerWidth()
        const imageViewHeight = containerDom.outerHeight()

        if (
          !imageViewWidth ||
          !imageViewHeight ||
          !imageWidth ||
          !imageHeight
        ) {
          return
        }

        const imageTop =
          imageHeight < imageViewHeight
            ? imageViewHeight / 2 - imageHeight / 2
            : 0
        const imageLeft =
          imageWidth < imageViewWidth ? imageViewWidth / 2 - imageWidth / 2 : 0

        $(image!).css({
          top: imageTop,
          left: imageLeft,
          opacity: 1
        })
      })
    }

    container.addEventListener('click', function () {
      $(image!).attr('src', '')
      $(container!).hide()
    })

    // 获取原图链接
    const src = this.getOriginalDrawing(img)
    // 显示
    $(image!).css('opacity', 0).attr('src', src)
  }

  /**
   * 执行脚本（因为插件不能直接获取到页面 window）
   * @param code 代码
   */
  private executeScript(code: string) {
    $('body')
      .append(`<script id="openLiveRoomImg">${code};void(0);</script>`)
      .find('#openLiveRoomImg')
      .remove()
  }
}

enum GetPicEnum {
  /**
   * 视频页面
   */
  Video,

  /**
   * 番剧、电影
   */
  Bangumi,

  /**
   * 稍后再看、收藏夹的播放全部
   */
  Medialist,

  /**
   * 专栏
   */
  Read,

  /**
   * 直播间
   */
  LiveRoom
}
