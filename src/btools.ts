import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import { browser } from 'webextension-polyfill-ts'

import '@styles/global'

import Util from '@/scripts/base/Util'
import { RequestApiType } from '@/scripts/base/enums/ContentJsType'

/**
 * 加载 Btools 功能模块
 */
import {
  RetrieveInvalidVideo,
  StickerHistory,
  SubscribeChannel
} from '@/scripts/module'

Vue.config.productionTip = false

Vue.use(VueRouter)
Vue.use(Vuex)

// 声明全局变量
window.__BTOOLS__ = {
  stickerHistory: false,
  kaomoji: false,
  subscribeChannel: false
}

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

Util.Instance().console('已开启', 'success')
