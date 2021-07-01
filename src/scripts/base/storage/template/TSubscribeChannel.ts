import TemplateBase from '@/scripts/base/storage/template/TemplateBase'
import { IBtoolsConfigsOptions, IBtoolsOptions } from '@base/interface/IOptions'

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

interface IChannel extends Object {
  cid: number
  title: string
  author: string
}

interface IChannelInfo extends Object {
  [key: number]: IChannel[]
}

interface IReaded extends Object {
  [key: number]: IVideoData[]
}

interface IReadedInfo extends Object {
  [key: number]: IReaded
}

/**
 * 订阅频道 配置项
 */
export interface ISubscribeChannelOptions extends Object {
  time: IBtoolsConfigsOptions<number> | null
}

export interface ISubscribeChannel {
  /**
   * 订阅的频道
   */
  channel?: IChannelInfo

  /**
   * 已查看的视频信息
   */
  readed?: IReadedInfo

  /**
   * 设置 - 查询间隔
   */
  setting?: ISubscribeChannelOptions
}

export class TSubscribeChannel extends TemplateBase {
  constructor(data: ISubscribeChannel) {
    super(data)
  }
}
