import Util from '@base/Util'
import { WatcherBase, HandleOptions } from '@/Watcher/WatcherBase'
import $ from 'jquery'
import IconUtil from '@/scripts/base/IconUtil'
import HKM from '@/scripts/base/HotKeyMenu'

export class GetPicWatcher extends WatcherBase {
  protected init(): void {
    this.urls[GetPicEnum.LiveRoom] = /live\.bilibili\.com/
  }
  protected handle(options: HandleOptions): void {
    Util.Instance().console('获取图片', 'success')

    switch (options.index) {
      case GetPicEnum.LiveRoom:
        this.liveRoom()
        break
    }
  }

  private async liveRoom() {
    // 获取 Btools 按钮 父元素
    const coloration_area = await Util.Instance().getElement(
      '.supporting-info .live-skin-coloration-area'
    )

    // 添加 Btools 按钮
    const btools_button = $(coloration_area).prepend(`
      <div class="btools-get-pic-live-room">
        <i>${IconUtil.Instance().LOGO('#00a1d6')}</i>
        <span>Btools</span>
      </div>
    `)

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
  LiveRoom
}
