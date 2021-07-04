/**
 * 监听器：评论
 */

import ListenerBase from '@/Listener/ListenerBase'
import { RequestApiType } from '@/scripts/base/enums/ContentJsType'

export class CommentListener extends ListenerBase {
  init() {
    this.urls = ['*://api.bilibili.com/x/v2/reply/main*']
    super.init()
  }

  handle() {
    this.sendToContentJs(
      {
        type: RequestApiType.Reply,
        tabId: this.tabId
      },
      (response) => {}
    )
  }
}
