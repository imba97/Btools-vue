import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'

import '@styles/global'

import Util from '@/scripts/base/Util'
import { RequestApiType } from '@/scripts/base/enums/ContentJsType'

/**
 * 加载 Btools 功能模块
 */
import RetrieveInvalidVideo from '@/scripts/module/RetrieveInvalidVideo'
import StickerHistory from '@/scripts/module/StickerHistory'

Vue.config.productionTip = false

Vue.chrome = Vue.prototype.$chrome = chrome || browser
Vue.use(VueRouter)
Vue.use(Vuex)

Vue.chrome.runtime.onMessage.addListener(function (
  request,
  sender,
  sendResponse
) {
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
  }

  // callback 目前不需要
  sendResponse()

  return true
})
