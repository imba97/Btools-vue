/**
 * 直播间助手
 */

import Util from '@/scripts/base/Util'
import { WatcherBase, HandleOptions } from '@/Watcher/WatcherBase'
import $ from 'jquery'
import _ from 'lodash'
import {
  ILiveRoomHelper,
  TLiveRoomHelper
} from '@/scripts/base/storage/template'
import ExtStorage from '@/scripts/base/storage/ExtStorage'

export class LiveRoomHelper extends WatcherBase {
  private _localData?: ILiveRoomHelper

  protected async init() {
    this.urls[LiveRoomHelperEnum.Live] = /live\.bilibili\.com/
  }

  protected handle(options: HandleOptions): void {
    Util.Instance().console('直播间助手', 'success')

    switch (options.index) {
      case LiveRoomHelperEnum.Live:
        this.live()
        break
    }
  }

  private async live() {
    this._localData = await ExtStorage.Instance().getStorage<
      TLiveRoomHelper,
      ILiveRoomHelper
    >(
      new TLiveRoomHelper({
        setting: {
          miniPlayer: null
        }
      })
    )

    // 关闭直播间迷你播放器
    if (
      this._localData!.setting?.miniPlayer?.current &&
      !this._localData!.setting.miniPlayer.current.value
    ) {
      const player = await Util.Instance().getElement(
        '.player-section .live-player-ctnr'
      )
      $(player).addClass('miniPlayerHide')
    }
  }
}

enum LiveRoomHelperEnum {
  Live
}
