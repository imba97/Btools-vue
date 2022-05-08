import _ from 'lodash'
import qs from 'querystring'
import axios, { AxiosRequestConfig, Method } from 'axios'
import { browser } from 'webextension-polyfill-ts'

import Singleton from '@/scripts/base/singletonBase/Singleton'
import ExtStorage from '@/scripts/base/storage/ExtStorage'
import {
  IMultipleAccounts,
  TMultipleAccounts
} from '@/scripts/base/storage/template/TMultipleAccounts'

export default class Request extends Singleton {
  /**
   * 请求接口 URL
   */
  protected baseUrl!: string

  protected async request(options: AxiosRequestConfig): Promise<any> {
    // 如果没有 tabs.sendMessage 说明不是 content js
    if (_.get(browser, 'tabs.sendMessage', null) !== null) {
      return this.backgroundRequest(options)
    }

    const isGet = options.method?.toLocaleUpperCase() === 'GET'

    const headers: { [key: string]: any } = isGet
      ? {}
      : {
          'content-type': 'application/x-www-form-urlencoded'
        }

    return new Promise((resolve, reject) => {
      browser.runtime
        .sendMessage({
          type: options.method,
          baseUrl: this.baseUrl,
          url: options.url,
          ...(isGet
            ? { params: options.data }
            : { data: qs.stringify(options.data) }),
          headers
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
    const isGet = options.method?.toLocaleUpperCase() === 'GET'

    const headers: { [key: string]: any } = isGet
      ? {}
      : {
          'content-type': 'application/x-www-form-urlencoded'
        }

    return await axios({
      method: options.method,
      baseURL: this.baseUrl,
      url: options.url,
      ...(isGet
        ? { params: options.data }
        : { data: qs.stringify(options.data) }),
      headers
    }).then((response) => {
      return response.data
    })
  }
}
