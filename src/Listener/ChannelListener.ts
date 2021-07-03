/**
 * 监听器：频道
 */

import BaseListener from '@/listener/baseListener'
import { RequestApiType } from '@/scripts/base/enums/ContentJsType'
import ExtStorage from '@/scripts/base/storage/ExtStorage'
import {
  ISubscribeChannel,
  ISubscribeChannelOptions,
  IVideoData,
  TSubscribeChannel
} from '@/scripts/base/storage/template'
import { Url } from '@/scripts/base/Url'
import _ from 'lodash'

export default class ChannelListener extends BaseListener {
  private _localData: ISubscribeChannel = {}

  /**
   * 视频信息临时存储
   */
  private _videos_temp: IVideoData[] = []

  init() {
    this.urls = ['*://api.bilibili.com/x/space/channel/video*']
    super.init()

    // 开启计时器
    this.startInterval()
  }

  async handle() {
    this.sendToContentJs(
      {
        type: RequestApiType.Channel,
        tabId: this.tabId
      },
      (response) => {}
    )
  }

  /**
   * 检测订阅频道的视频更新
   */
  private async startInterval() {
    // 默认配置
    const defaultSetting: ISubscribeChannelOptions = {
      time: null
    }

    // 本地存储
    this._localData = await ExtStorage.Instance().getStorage<
      TSubscribeChannel,
      ISubscribeChannel
    >(
      new TSubscribeChannel({
        channel: {},
        channelVideos: {},
        setting: defaultSetting
      })
    )

    // 先查询一次（打开浏览器时、刚安装插件时）
    await this.query()

    console.log('localData', this._localData)

    /**
     * 查询是否到获取频道视频时间
     */
    const queryInterval =
      this._localData.setting?.time &&
      this._localData.setting.time.current?.value &&
      this._localData.setting.time.current.value >= 10
        ? this._localData.setting.time.current.value
        : 10

    // 开启计时器
    setInterval(() => {
      this.query()
      // 用户设置的时间(分钟) * 60 秒
    }, queryInterval * 60000)
  }

  /**
   * 查询最新数据 并跟本地存储中的数据对比
   * @returns
   */
  private async query() {
    if (!this._localData.channel) return

    // 请求间隔 index
    let requestTimeout = 0

    // 循环订阅的频道
    _.forEach(this._localData.channel, (cids, uid) => {
      // 用户 ID
      const _uid = parseInt(uid)
      // 循环所有频道 ID
      _.forEach(cids, async (cid) => {
        // 延时执行
        setTimeout(async () => {
          // 清空视频信息临时存储数组
          this._videos_temp = []
          // 获取最新频道视频
          await this.getChannelVideos(_uid, cid)

          // 与本地存储进行差异对比 取得新视频
          const newVideos = _.differenceBy(
            this._videos_temp,
            this._localData.channelVideos![uid][cid],
            'bvid'
          )

          // 如果有新视频
          if (newVideos.length !== 0) {
            // 合并数组
            this._localData.channelVideos![uid][cid] = _.union(
              this._localData.channelVideos![uid][cid],
              newVideos
            )

            // 保存到本地存储
            this.save()
          }
        }, 3000 * ++requestTimeout)
      })
    })
  }

  /**
   * 获取频道视频
   * @param uid 用户 ID
   * @param cid 频道 ID
   * @param page 页数
   */
  private async getChannelVideos(uid: number, cid: number, page: number = 1) {
    // 发送请求
    const result = await Url.CHANEL_VIDEO.backgroundRequest({
      mid: uid,
      cid,
      pn: page
    })

    // 遍历视频列表
    if (result.data.list.archives.length !== 0) {
      result.data.list.archives.forEach((item: IVideoData) => {
        this._videos_temp.push({
          bvid: item.bvid,
          title: item.title,
          pic: item.pic,
          // 所有视频默认为未读
          readed: false
        })
      })
      // 如果本页全满 说明可能有下一页
      if (result.data.list.archives.length === 100)
        await this.getChannelVideos(uid, cid, ++page)
    }
  }

  private save() {
    ExtStorage.Instance().setStorage<TSubscribeChannel, ISubscribeChannel>(
      new TSubscribeChannel(this._localData)
    )
  }
}
