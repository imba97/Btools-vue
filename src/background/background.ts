import axios from 'axios'
import _ from 'lodash'
import { browser } from 'webextension-polyfill-ts'

import {
  ResourceListListener,
  CommentListener,
  ChannelListener
} from '@/Listener'

// 加载 background scripts
import './scripts/Account'

// 加载监听器

new ResourceListListener()
new CommentListener()
new ChannelListener()

browser.runtime.onMessage.addListener((request) => {
  const params =
    request.type === 'GET' ? { params: request.params } : { data: request.data }

  return axios({
    method: request.type,
    baseURL: request.baseUrl,
    url: request.url,
    headers: request.headers || {},
    ...params
  }).then((response) => {
    return response.data
  })
})
