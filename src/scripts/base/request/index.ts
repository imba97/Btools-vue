import _ from 'lodash'
import qs from 'querystring'
import { default as axios, AxiosRequestConfig, Method } from 'axios'
import { browser } from 'webextension-polyfill-ts'

import Singleton from '@/scripts/base/singletonBase/Singleton'

export default class Request extends Singleton {
  /**
   * 请求接口 URL
   */
  protected baseUrl!: string

  protected async request(options: AxiosRequestConfig): Promise<any> {
    // 如果没有 tabs.sendMessage 说明是 background js
    if (_.get(browser, 'tabs.sendMessage', null) !== null) {
      return this.backgroundRequest(options)
    }

    return new Promise((resolve, reject) => {
      browser.runtime
        .sendMessage({
          type: options.method,
          baseUrl: this.baseUrl,
          url: options.url,
          ...(options.method?.toLocaleUpperCase() === 'GET'
            ? { params: options.data }
            : { data: qs.stringify(options.data) }),
          headers:
            options.method?.toLocaleUpperCase() === 'GET'
              ? {}
              : { 'content-type': 'application/x-www-form-urlencoded' },
          ...options
        })
        .then((json) => {
          if (!json) reject(new Error('error'))
          resolve(json)
        })
    })
  }

  /**
   * background js 发起请求
   * @param options
   * @returns
   */
  protected async backgroundRequest(options: AxiosRequestConfig) {
    return await axios({
      method: options.method,
      baseURL: this.baseUrl,
      url: options.url,
      ...(options.method?.toLocaleUpperCase() === 'GET'
        ? { params: options.data }
        : { data: qs.stringify(options.data) }),
      headers:
        options.method?.toLocaleUpperCase() === 'GET'
          ? {}
          : { 'content-type': 'application/x-www-form-urlencoded' },
      ...options
    }).then((response) => {
      return response.data
    })
  }
}
