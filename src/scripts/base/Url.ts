import { default as qs, ParsedUrlQueryInput } from 'querystring'
import { default as axios, AxiosRequestConfig, Method } from 'axios'
import { browser } from 'webextension-polyfill-ts'
import Util from './Util'

/**
 * URL 类型
 */
export enum UrlType {
  BILIBILI,
  BILIPLUS
}

export class Url<T extends ParsedUrlQueryInput> {
  public static readonly enums: Url<any>[] = []

  public static readonly headers: { [key: string]: { [key: string]: string } } =
    {}

  // public static readonly 名称: Url<{ 发送参数名: 发送参数类型 }> = new Url(请求类型, URL类型, 'URL路径', RequestHeaders)

  // ========= BILIBILI =========

  /**
   * 获取用户卡片信息
   */
  public static readonly USER_CARD: Url<{ mid: string }> = new Url(
    'GET',
    UrlType.BILIBILI,
    '/x/web-interface/card',
    null
  )

  /**
   * 获取频道信息
   */
  public static readonly CHANEL_VIDEO: Url<{
    mid: number
    cid: number
    pn: number
  }> = new Url(
    'GET',
    UrlType.BILIBILI,
    '/x/space/channel/video?ps=100&order=0&ctype=0',
    null
  )

  /**
   * 获取视频信息
   */
  public static readonly VIDEO_INFO: Url<{ bvid: string }> = new Url(
    'GET',
    UrlType.BILIBILI,
    '/x/web-interface/view',
    null
  )

  public static readonly LIKE: Url<{
    aid: number
    like: number
    csrf: string
  }> = new Url('POST', UrlType.BILIBILI, '/x/web-interface/archive/like', {
    Referer: 'https://www.bilibili.com',
    Origin: 'https://www.bilibili.com'
  })

  public static readonly BILIPLUS_VIDEO_INFO: Url<{ aid: string }> = new Url(
    'GET',
    UrlType.BILIPLUS,
    '/aidinfo',
    null
  )

  // ========= 测试 =========

  // ========= 测试 =========

  constructor(
    private _method: Method,
    private _type: UrlType,
    private _path: string,
    private _headers: any
  ) {
    if (this._headers !== null) Url.headers[this.url] = this._headers
    Url.enums.push(this)
  }

  get baseUrl(): string | undefined {
    // 根据 type 获取 baseUrl
    switch (this._type) {
      case UrlType.BILIBILI:
        return 'https://api.bilibili.com'

      case UrlType.BILIPLUS:
        return 'https://www.biliplus.com/api'

      default:
        Util.Instance().console('未曾设想的 Base Url 类型', 'error')
    }
  }

  get path(): string {
    return this._path
  }

  get url(): string {
    return `${this.baseUrl}${this._path}`
  }

  get method(): Method {
    return this._method
  }

  public request(params?: T, options?: AxiosRequestConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      browser.runtime
        .sendMessage({
          type: this.method,
          url: this.url,
          ...(this._method === 'GET'
            ? { params }
            : { data: qs.stringify(params) }),
          headers:
            this._method === 'GET'
              ? {}
              : { 'content-type': 'application/x-www-form-urlencoded' },
          ...options
        })
        .then((json) => {
          console.log(json)
          if (!json) reject(new Error('error'))
          resolve(json)
        })
    })
  }

  public async backgroundRequest(params: T, options?: AxiosRequestConfig) {
    return await axios({
      method: this.method,
      url: this.url,
      ...(this._method === 'GET' ? { params } : { data: qs.stringify(params) }),
      headers:
        this._method === 'GET'
          ? {}
          : { 'content-type': 'application/x-www-form-urlencoded' },
      ...options
    }).then((response) => {
      return response.data
    })
  }
}
