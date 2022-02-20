import Request from '@/scripts/base/request'

export default class BilibiliPassport extends Request {
  constructor() {
    super()

    this.baseUrl = 'https://passport.bilibili.com/'
  }

  public getLoginUrl() {
    return this.request({
      url: '/qrcode/getLoginUrl',
      method: 'GET'
    })
  }
}
