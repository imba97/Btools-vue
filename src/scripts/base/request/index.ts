import _ from 'lodash'
import qs from 'querystring'
import { default as axios, AxiosRequestConfig, Method } from 'axios'
import { browser } from 'webextension-polyfill-ts'

import Singleton from '@/scripts/base/singletonBase/Singleton'
import ExtStorage from '../storage/ExtStorage'
import {
  IMultipleAccounts,
  TMultipleAccounts
} from '../storage/template/TMultipleAccounts'

export default class Request extends Singleton {
  /**
   * 请求接口 URL
   */
  protected baseUrl!: string

  protected async request(
    options: AxiosRequestConfig,
    accountId?: string
  ): Promise<any> {
    // 如果没有 tabs.sendMessage 说明不是 content js
    if (_.get(browser, 'tabs.sendMessage', null) !== null) {
      return this.backgroundRequest(options, accountId)
    }

    let userCookie = ''

    if (accountId) {
      const accounts = await ExtStorage.Instance().getStorage<
        TMultipleAccounts,
        IMultipleAccounts
      >(
        new TMultipleAccounts({
          userList: []
        })
      )

      const user = _.find(accounts.userList, {
        uid: accountId
      })

      if (user) {
        userCookie = `SESSDATA=${user.token}; bili_jct=${user.csrf}`
      }
    }

    return new Promise((resolve, reject) => {
      browser.runtime
        .sendMessage({
          type: options.method,
          baseUrl: this.baseUrl,
          url: options.url,
          ...(options.method?.toLocaleUpperCase() === 'GET'
            ? { params: options.data }
            : { data: options.data }),
          headers:
            options.method?.toLocaleUpperCase() === 'GET'
              ? {
                  cookie: userCookie
                }
              : {
                  'content-type': 'application/x-www-form-urlencoded',
                  cookie: userCookie
                },
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
  protected async backgroundRequest(
    options: AxiosRequestConfig,
    accountId?: string
  ) {
    const isGet = options.method?.toLocaleUpperCase() === 'GET'

    return await axios({
      method: options.method,
      baseURL: this.baseUrl,
      url: options.url,
      ...(isGet
        ? { params: options.data }
        : { data: qs.stringify(options.data) }),
      headers: isGet
        ? {}
        : { 'content-type': 'application/x-www-form-urlencoded' }
    }).then((response) => {
      return response.data
    })
  }
}
