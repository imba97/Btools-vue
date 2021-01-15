import Vue from 'vue'
import { default as qs, ParsedUrlQueryInput } from 'querystring'
import { AxiosRequestConfig } from 'axios'

/**
 * URL 类型
 */
export enum UrlType {
  BILIBILI,
  BILIPLUS,
  IMBA97
}

/**
 * 请求类型
 */
export enum MethodType {
  GET,
  POST
}

export class Url<T extends ParsedUrlQueryInput>  {
  private _bilibili_base_url = 'https://api.bilibili.com'

  private _biliplus_base_url = 'https://www.biliplus.com/api'

  private _imba97_base_rul = 'https://bili.imba97.cn'

  public static readonly enums: Url<any>[] = []

  // ========= BILIBILI =========

  // 获取用户卡片信息
  public static readonly USER_CARD: Url<{ mid: string }> = new Url(MethodType.GET, UrlType.BILIBILI, '/x/web-interface/card')
  // public static readonly 名称: Url<{ 发送参数名: 发送参数类型 }> = new Url(URL类型, 'URL路径', 请求类型)

  // ========= BILIPLUS =========

  // 获取视频缓存
  public static readonly VIDEO_CACHE: Url<{ id: number }> = new Url(MethodType.GET, UrlType.BILIPLUS, '/view')

  // ========= 测试 =========

  // 测试
  public static readonly POST_TEST: Url<{ param: string | number }> = new Url(MethodType.POST, UrlType.IMBA97, '/postTest.php')

  constructor(private _method: MethodType, private _type: UrlType, private _path: string) {
    Url.enums.push(this)
  }

  get baseUrl(): string {

    // 根据 type 获取 baseUrl
    switch (this._type) {
      case UrlType.BILIBILI:
        return this._bilibili_base_url

      case UrlType.BILIPLUS:
        return this._biliplus_base_url

      case UrlType.IMBA97:
        return this._imba97_base_rul

      default:
        throw new Error('获取 Base URL 失败')          
    }

  }

  get path(): string {
    return this._path
  }

  get url(): string {
    return `${this.baseUrl}${this._path}`
  }

  get method(): string {
    switch(this._method) {
      case MethodType.GET:
        return 'GET'
      case MethodType.POST:
        return 'POST'
      default:
        throw new Error('未曾设想的类型')
    }
  }

  public request(params?: T, options?: AxiosRequestConfig) : Promise<any> {
    return new Promise((resolve, reject) => {
      Vue.chrome.runtime.sendMessage({
        type: this.method,
        url: this.url,
        ...(this._method === MethodType.GET ? { params } : { data: qs.stringify(params) }),
        headers: this._method === MethodType.GET ? { } : { 'content-type': 'application/x-www-form-urlencoded' },
        ...options
      }, (json) => {
        if(!json) reject('error')
        resolve(json)
      })
    })
  }
}
