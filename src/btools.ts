import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import axios from 'axios'

import '@styles/global'

import Util from '@/scripts/base/util'
import { IContentJs } from '@/scripts/base/interface/IContentJs'
import { ContentJsType } from '@/scripts/base/enums/contentJsType'

/**
 * 加载 Btools 功能模块
 */
import RetrieveInvalidVideo from '@/scripts/module/retrieveInvalidVideo'

Vue.config.productionTip = false

Vue.chrome = Vue.prototype.$chrome = chrome || browser
Vue.use(VueRouter)
Vue.use(Vuex)

Vue.chrome.runtime.onMessage.addListener(function (
  request,
  sender,
  sendResponse
) {
  Util.Instance.console(request)

  // 根据类型调用不同功能模块
  switch (request.type) {
    // 收藏夹
    case ContentJsType.RetrieveInvalidVideo:
      new RetrieveInvalidVideo()
      break
  }

  // callback 目前不需要
  // sendResponse()

  return true
})
