/**
 * 监听器：频道
 */

import BaseListener from '@/listener/baseListener'
import { RequestApiType } from '@/scripts/base/enums/ContentJsType'
import ExtStorage from '@/scripts/base/storage/ExtStorage'
import {
  ISubscribeChannel,
  ISubscribeChannelOptions,
  TSubscribeChannel
} from '@/scripts/base/storage/template'
import Util from '@/scripts/base/Util'

export default class ChannelListener extends BaseListener {
  init() {
    this.urls = ['*://api.bilibili.com/x/space/channel/video*']
    super.init()
  }

  handle() {
    this.sendToContentJs(
      {
        type: RequestApiType.Channel,
        tabId: this.tabId
      },
      (response) => {}
    )

    const defaultSetting: ISubscribeChannelOptions = {
      time: null
    }

    // 获取配置项
    ExtStorage.Instance().getStorage<TSubscribeChannel, ISubscribeChannel>(
      new TSubscribeChannel({
        setting: defaultSetting
      })
    )

    /**
     * 查询是否到获取频道视频时间
     */
    setInterval(() => {
      Util.Instance().console('查询')
    }, 1000)
  }
}
