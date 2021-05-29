/**
 * 收藏夹
 */

import Vue from 'vue'
import BaseListener from '@/Listener/BaseListener'
import Util from '@/scripts/util'

import { ContentJsType } from '@/scripts/base/enums/ContentJsType'

export default class ResourceListListener extends BaseListener {
  init() {
    this.urls = ['*://api.bilibili.com/x/v3/fav/resource/list*']
    super.init()
  }

  handle() {
    
    Util.Instance.ContentJsExec({
      type: ContentJsType.Action
    }, function(response) {
      console.log(response)
    })

    super.handle()
  }
}
