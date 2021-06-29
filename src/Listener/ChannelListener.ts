/**
 * 监听器：频道
 */

import BaseListener from '@/listener/baseListener'
import { RequestApiType } from '@/scripts/base/enums/ContentJsType'

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
  }
}
