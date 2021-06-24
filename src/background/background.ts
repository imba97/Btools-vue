import { Url } from '@/scripts/base/Url'
import axios from 'axios'
import Vue from 'vue'
import _ from 'lodash'

import { ResourceListListener, CommentListener } from '@/listener'

new ResourceListListener()
new CommentListener()

Vue.chrome = Vue.prototype.$chrome = chrome || browser

// 设置 Header
Vue.chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    const headers = Url.headers[details.url]

    if (headers === undefined) return { requestHeaders: details.requestHeaders }

    _.forEach<{ [key: string]: string }>(headers, (hValue, hKey) => {
      let found = false
      for (const n in details.requestHeaders) {
        found = details.requestHeaders[n].name == hKey
        if (found) {
          details.requestHeaders[n].value = hValue
        }
      }

      if (!found) {
        details.requestHeaders!.push({ name: hKey, value: hValue })
      }
    })

    return { requestHeaders: details.requestHeaders }
  },
  {
    urls: ['<all_urls>']
  },
  ['requestHeaders', 'blocking']
)

Vue.chrome.runtime.onMessage.addListener(function (
  request,
  sender,
  sendResponse
) {
  const params =
    request.type === 'GET' ? { params: request.params } : { data: request.data }

  axios({
    method: request.type,
    url: request.url,
    ...params,
    headers: request.headers || {}
  }).then((response) => {
    sendResponse(response.data)
  })

  return true
})
