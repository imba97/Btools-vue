import Vue from 'vue'
import { browser } from 'webextension-polyfill-ts'

import '@styles/global'
import '@styles/index'

import Util from '@/scripts/base/Util'
import { RequestApiType } from '@/scripts/base/enums/ContentJsType'

/**
 * 加载 Btools Linstener 模块
 */
import {
  RetrieveInvalidVideo,
  StickerHistory,
  SubscribeChannel
} from '@/scripts/module'

/**
 * 加载 Btools Watcher 模块
 */
import {
  GetPicWatcher,
  LinkConverter,
  LiveRoomHelper,
  HaiLinHappy
} from '@/Watcher'

Util.Instance().console('已开启', 'success')

Vue.config.productionTip = false

// Vue.use(VueRouter)
// Vue.use(Vuex)

// Linstener 模块
browser.runtime.onMessage.addListener(function (request, sender) {
  // 根据类型调用不同功能模块
  switch (request.type) {
    case RequestApiType.ResourceList:
      // 找回失效视频
      new RetrieveInvalidVideo()
      break

    case RequestApiType.Reply:
      new StickerHistory()
      // 历史表情
      break

    case RequestApiType.Channel:
      // 订阅频道
      new SubscribeChannel()
      break
  }

  // callback 目前不需要
  // return new Promise(() => {})
})

// Watcher 模块
new GetPicWatcher()
new LinkConverter()
new LiveRoomHelper()
new HaiLinHappy()
