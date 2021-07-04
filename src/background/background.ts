import { Url } from '@/scripts/base/Url'
import axios from 'axios'
import _ from 'lodash'
import { browser } from 'webextension-polyfill-ts'

import { OSubscribeChannel } from '@/OptionsInit'

import {
  ResourceListListener,
  CommentListener,
  ChannelListener
} from '@/Listener'

// 初始化配置

new OSubscribeChannel()

// 加载监听器

new ResourceListListener()
new CommentListener()
new ChannelListener()

// 设置 Header
browser.webRequest.onBeforeSendHeaders.addListener(
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

browser.runtime.onMessage.addListener((request) => {
  const params =
    request.type === 'GET' ? { params: request.params } : { data: request.data }

  return new Promise((resolve, reject) => {
    axios({
      method: request.type,
      url: request.url,
      ...params,
      headers: request.headers || {}
    }).then((response) => {
      resolve(response.data)
    })
  })
})
