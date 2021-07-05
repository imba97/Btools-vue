import Util from '@base/Util'
import { WatcherBase, HandleOptions } from '@/Watcher/WatcherBase'
import $ from 'jquery'
import IconUtil from '@/scripts/base/IconUtil'
import { default as HKM, SetCssTarget } from '@/scripts/base/HotKeyMenu'

export class GetPicWatcher extends WatcherBase {
  protected init(): void {
    this.urls[GetPicEnum.Video] = /bilibili\.com\/video/
    this.urls[GetPicEnum.Bangumi] = /bilibili\.com\/bangumi/
    this.urls[GetPicEnum.Watchlater] =
      /bilibili\.com\/medialist\/play\/watchlater/
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
      case GetPicEnum.Watchlater:
        this.watchlater()
        break
      case GetPicEnum.LiveRoom:
        this.liveRoom()
        break
    }
  }

  private async video(selector?: string): Promise<HKM> {
    // 获取 Btools 按钮 父元素
    const btools_box = await Util.Instance().getElement(
      selector || '#bilibiliPlayer'
    )

    // 添加 Btools 按钮
    const btools_button = $(btools_box)
      .append(
        `
        <div class="btools-get-pic-video">
          ${IconUtil.Instance().LOGO()}
        </div>
        `
      )
      .find('.btools-get-pic-video')

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

  private async watchlater() {
    // 有 video

    const img = await Util.Instance().getElement(
      '.player-auxiliary-playlist-item-active img'
    )

    const hkm = await this.video('#viewbox_report')
    hkm.setCss(SetCssTarget.OverlordElements, {
      top: 100
    })
    hkm.removeWithKey('S').add([
      {
        key: 'S',
        title: '打开封面',
        action: () => {
          const srcSplit = (img as HTMLImageElement).src.split('@')
          if (srcSplit.length > 1) {
            window.open(srcSplit[0])
          } else {
            window.open((img as HTMLImageElement).src)
          }
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
   * 稍后再看
   */
  Watchlater,

  /**
   * 直播间
   */
  LiveRoom
}
