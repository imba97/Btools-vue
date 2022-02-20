import Request from '@/scripts/base/request'

export default class BilibiliPassport extends Request {
  constructor() {
    super()

    this.baseUrl = 'https://passport.bilibili.com'
  }

  /**
   * 获取二维码登录链接
   */
  public getLoginUrl() {
    return this.request({
      url: '/qrcode/getLoginUrl',
      method: 'GET'
    })
  }

  /**
   * 获取登录信息
   */
  public getLoginInfo(oauthKey: string) {
    return this.request({
      url: '/qrcode/getLoginInfo',
      method: 'POST',
      data: {
        oauthKey
      }
    })
  }

  public logout(biliCSRF: string, accountId: string) {
    return this.request(
      {
        url: '/login/exit/v2',
        method: 'POST',
        data: {
          biliCSRF
        }
      },
      accountId
    )
  }
}
