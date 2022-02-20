import { ParsedUrlQueryInput } from 'querystring'
import Request from '@/scripts/base/request'

export default class BiliPlus extends Request {
  constructor() {
    super()

    this.baseUrl = 'https://www.biliplus.com/api'
  }

  public videoInfo(aid: string) {
    return this.request({
      url: '/aidinfo',
      method: 'GET',
      data: {
        aid
      }
    })
  }

  public videoDetail(id: string) {
    return this.request({
      url: '/view',
      method: 'GET',
      data: {
        id
      }
    })
  }
}
