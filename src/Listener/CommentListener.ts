/**
 * 监听器：评论
 */

import BaseListener from '@/listener/baseListener'
import { RequestApiType } from '@/scripts/base/enums/ContentJsType'

export default class CommentListListener extends BaseListener {
  init() {
    this.urls = ['*://api.bilibili.com/x/v2/reply/main*']
    super.init()
  }

  handle() {
    console.log('评论监听器')
    this.sendToContentJs(
      {
        type: RequestApiType.Reply,
        tabId: this.tabId
      },
      (response) => {}
    )
  }
}
