import Request from '@/scripts/base/request'

export default class BilibiliApi extends Request {
  constructor() {
    super()

    this.baseUrl = 'https://api.bilibili.com'
  }

  public myInfo() {
    return this.request({
      url: '/x/space/myinfo',
      method: 'GET'
    })
  }

  /**
   * 获取用户卡片信息
   */
  public userCard(mid: string) {
    return this.request({
      url: '/x/web-interface/card',
      method: 'GET',
      data: {
        mid
      }
    })
  }

  /**
   * 获取频道信息
   */
  public getChannelInfo(series_id: number) {
    return this.request({
      url: '/x/series/series',
      method: 'GET',
      data: {
        series_id
      }
    })
  }

  /**
   * 获取频道视频
   */
  public getChannelVideo(mid: number, series_id: number, pn: number) {
    return this.request({
      url: '/x/series/archives?ps=100&order=0&ctype=0',
      method: 'GET',
      data: {
        mid,
        series_id,
        pn
      }
    })
  }

  /**
   * 获取视频信息
   */
  public videoInfo(bvid: string) {
    return this.request({
      url: '/x/web-interface/view',
      method: 'GET',
      data: {
        bvid
      }
    })
  }

  /**
   * 表情包列表
   */
  public emoteList() {
    return this.request({
      url: '/x/emote/user/panel/web?business=reply',
      method: 'GET'
    })
  }

  /**
   * 点赞接口
   * @param aid 视频ID
   * @param like 点赞 | 取消点赞
   * @param csrf
   */
  public like(aid: number, like: 0 | 1, csrf: string) {
    return this.request({
      url: '/x/web-interface/archive/like',
      method: 'POST',
      data: {
        aid,
        like,
        csrf
      }
    })
  }
}
