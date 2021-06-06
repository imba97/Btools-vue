/**
 * 监听器：收藏夹
 */

import BaseListener from '@/listener/baseListener'
import { ContentJsType } from '@/scripts/base/enums/contentJsType'

export default class ResourceListListener extends BaseListener {
  init() {
    this.urls = ['*://api.bilibili.com/x/v3/fav/resource/list*']
    super.init()
  }

  handle() {
    this.sendToContentJs(
      {
        type: ContentJsType.RetrieveInvalidVideo,
        tabId: this.tabId,
      },
      (response) => {}
    )

    super.handle()
  }
}
