import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import axios from 'axios'

import '@styles/global'

import { ContentJsType } from '@/scripts/base/enums/ContentJsType'

Vue.config.productionTip = false

Vue.chrome = Vue.prototype.$chrome = chrome || browser
Vue.use(VueRouter)
Vue.use(Vuex)

Vue.chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // console.log(sender.tab ?"from a content script:" + sender.tab.url :"from the extension");
  console.log(request)
  // if (request.type === ContentJsType.Action) {
  //   request.action()
  // }
  sendResponse('我收到了你的消息！')

  return true
});
