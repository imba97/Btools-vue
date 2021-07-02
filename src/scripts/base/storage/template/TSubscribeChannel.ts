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

  /**
   * 是否已读
   */
  readed: boolean
}

interface IChannel extends Object {
  [key: number]: number[]
}

interface IChannelInfo extends Object {
  [key: number]: {
    title: string
  }
}

interface IUserInfo extends Object {
  [key: number]: {
    name: string
    face: string
  }
}

export interface IChannelVideoInfo extends Object {
  [key: number]: IChannelVideos
}

interface IChannelVideos extends Object {
  [key: number]: IVideoData[]
}

/**
 * 订阅频道 配置项
 */
export interface ISubscribeChannelOptions extends Object {
  time: IBtoolsOptions<number>
}

export interface ISubscribeChannel {
  /**
   * 订阅的频道
   */
  channel?: IChannel

  channelInfo?: IChannelInfo

  userInfo?: IUserInfo

  /**
   * 频道视频信息
   */
  channelVideos?: IChannelVideoInfo

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
