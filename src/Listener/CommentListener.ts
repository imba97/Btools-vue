/**
 * 监听器：评论
 */

import ListenerBase from '@/Listener/ListenerBase'
import { RequestApiType } from '@base/enums/ContentJsType'

export class CommentListener extends ListenerBase {
  init() {
    this.urls = [
      '*://api.bilibili.com/x/v2/reply/main*',
      '*://api.bilibili.com/x/v2/reply/jump*'
    ]
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
