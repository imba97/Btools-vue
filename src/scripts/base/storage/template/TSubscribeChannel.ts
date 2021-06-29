import TemplateBase from '@/scripts/base/storage/template/TemplateBase'

export interface IVideoData {
  /**
   * 视频封面链接
   */
  pic: string

  /**
   * 视频 BV号
   */
  bvid: string

  /**
   * 视频标题
   */
  title: string
}

interface IChanelInfo extends Object {
  [key: number]: number[]
}

export interface ISubscribeChannel {
  /**
   * 订阅的频道
   * key: uid
   * value: [
   *   chanel_id_1,
   *   chanel_id_2,
   *   ...
   * ]
   */
  chanel?: IChanelInfo

  /**
   * 已查看的视频信息
   * key: uid-aid
   * value: 视频信息
   */
  readed?: { [key: string]: IVideoData[] }
}

export class TSubscribeChannel extends TemplateBase {
  constructor(data: ISubscribeChannel) {
    super(data)
  }
}
