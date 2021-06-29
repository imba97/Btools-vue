import { Url } from '@/scripts/base/Url'
import axios from 'axios'
import _ from 'lodash'
import { browser } from 'webextension-polyfill-ts'

import { ResourceListListener, CommentListener } from '@/Listener'

new ResourceListListener()
new CommentListener()

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

browser.runtime.onMessage.addListener(async function (request, sender) {
  const params =
    request.type === 'GET' ? { params: request.params } : { data: request.data }

  return await axios({
    method: request.type,
    url: request.url,
    ...params,
    headers: request.headers || {}
  }).then((response) => response.data)
})
