import { ParsedUrlQueryInput } from 'querystring'
import Request from '@/scripts/base/request'

export default class JijiDown extends Request {
  constructor() {
    super()

    this.baseUrl = 'https://www.jijidown.com/api'
  }

  public videoInfo(id: string) {
    return this.request({
      url: '/v1/video/get_info',
      method: 'GET',
      data: {
        id
      }
    })
  }
}
