/**
 * 监听器：收藏夹
 */

import ListenerBase from '@/Listener/ListenerBase'
import { RequestApiType } from '@base/enums/ContentJsType'

export class ResourceListListener extends ListenerBase {
  init() {
    this.urls = ['*://api.bilibili.com/x/v3/fav/resource/list*']
    super.init()
  }

  handle() {
    this.sendToContentJs(
      {
        type: RequestApiType.ResourceList,
        tabId: this.tabId
      },
      (response) => {}
    )
  }
}
