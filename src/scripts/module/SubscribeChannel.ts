import ModuleBase from '@/scripts/module/ModuleBase'
import Util from '@/scripts/base/Util'
import ExtStorage from '@/scripts/base/storage/ExtStorage'
import {
  TSubscribeChannel,
  ISubscribeChannel,
  IVideoData
} from '@/scripts/base/storage/template'
import _ from 'lodash'
import { Url } from '@/scripts/base/Url'
import IconUtil from '@/scripts/base/IconUtil'
import HKM from '@/scripts/base/HotKeyMenu'

export class SubscribeChannel extends ModuleBase {
  private _localData: ISubscribeChannel = {}

  /**
   * 视频临时存储
   */
  private _videos_temp: IVideoData[] = []

  /**
   * 订阅按钮（快捷键菜单按钮）
   */
  private _subscribeButton = document.createElement('a')

  /**
   * 是否已订阅
   */
  private _isSubscribed = false

  /**
   * 频道信息
   */
  private _channel_info: { uid?: number; sid?: number } = {}

  /**
   * 快捷键菜单 实例
   */
  private _hkm?: HKM

  /**
   * 快捷键菜单类型 订阅 和 取消订阅
   */
  private _hkm_type: { [key: string]: HotKeyMenuOption } = {
    subscribe: {
      key: 'S',
      title: '订阅频道',
      action: () => {
        this.doSubscribe(this._channel_info.uid!, this._channel_info.sid!)
      }
    },
    unsubscribe: {
      key: 'S',
      title: '取消订阅',
      action: () => {
        this.doUnSubscribe(this._channel_info.uid!, this._channel_info.sid!)
      }
    }
  }

  /**
   * 订阅按钮颜色
   */
  private _logo_color = {
    /**
     * 未订阅
     */
    doNotSubscribe: '#00a1d6',

    /**
     * 订阅中（请求接口等待）
     */
    subscribing: '#ccc',

    /**
     * 已订阅
     */
    subscribed: '#13a813'
  }

  protected async handle() {
    // 防止重复加载
    if (document.querySelector('.btools-subscribe-button') !== null) return

    Util.Instance().console('订阅频道', 'success')

    // 读取本地数据
    this._localData = await ExtStorage.Instance().getStorage<
      TSubscribeChannel,
      ISubscribeChannel
    >(
      new TSubscribeChannel({
        channel: {},
        channelInfo: {},
        channelVideos: {},
        userInfo: {}
      })
    )

    const channel_action_row = await Util.Instance().getElement(
      '.channel-action-row'
    )

    const channel_info_reg =
      /space\.bilibili\.com\/(\d+)\/channel\/seriesdetail\?sid=(\d+)/.exec(
        window.location.href
      )

    if (channel_info_reg === null) return

    // 用户 ID
    this._channel_info.uid = parseInt(channel_info_reg[1])
    // 频道 ID
    this._channel_info.sid = parseInt(channel_info_reg[2])

    // 查询是否已订阅
    this._isSubscribed = this.isSubscribed(
      this._channel_info.uid,
      this._channel_info.sid
    )

    // 订阅按钮
    this._subscribeButton.classList.add('btools-subscribe-button')
    this._subscribeButton.innerHTML = this._isSubscribed
      ? IconUtil.Instance().LOGO(this._logo_color.subscribed)
      : IconUtil.Instance().LOGO(this._logo_color.doNotSubscribe)

    // 创建快捷键菜单
    this._hkm = new HKM(this._subscribeButton).add([
      this._isSubscribed ? this._hkm_type.unsubscribe : this._hkm_type.subscribe
    ])

    channel_action_row.appendChild(this._subscribeButton)
  }

  /**
   * 订阅处理事件
   * @param uid 用户ID
   * @param sid 频道ID
   */
  private async doSubscribe(uid: number, sid: number) {
    if (!this._localData.channel!.hasOwnProperty(uid)) {
      this._localData.channel![uid] = []
      this._localData.userInfo![uid] = {}
    }

    if (this._localData.channel![uid].indexOf(sid) !== -1) return

    // 切换按钮颜色
    this._subscribeButton.innerHTML = IconUtil.Instance().LOGO(
      this._logo_color.subscribing
    )

    // 频道数据 获取频道标题 和 作者名称
    const channelData = await Url.CHANNEL_INFO.request({
      series_id: sid
    })

    await this.getChannelVideos(uid, sid)

    const userInfo = await Url.USER_CARD.request({
      mid: uid.toString()
    })

    // 频道信息
    this._localData.channelInfo![sid] = {
      title: _.get(channelData, 'data.meta.name', '获取失败')
    }

    // 用户信息
    this._localData.userInfo![uid] = {
      name: userInfo.data.card.name,
      face: userInfo.data.card.face
    }

    // 添加到本地存储
    this._localData.channel![uid].push(sid)

    // 添加频道视频
    if (!this._localData.channelVideos?.hasOwnProperty(uid))
      this._localData.channelVideos![uid] = {}

    this._localData.channelVideos![uid][sid] = this._videos_temp

    this.save()

    // 更改快捷键菜单
    this._hkm
      ?.removeWithKey(this._hkm_type.subscribe.key)
      .add([this._hkm_type.unsubscribe])

    // logo 颜色
    this._subscribeButton.innerHTML = IconUtil.Instance().LOGO(
      this._logo_color.subscribed
    )
  }

  /**
   * 取消订阅事件
   * @param uid 用户ID
   * @param sid 频道ID
   */
  private doUnSubscribe(uid: number, sid: number) {
    const channelIndex = this._localData.channel![uid].indexOf(sid)

    if (channelIndex === -1) {
      return
    }

    // 删除频道
    this._localData.channel![uid].splice(channelIndex, 1)

    // 删除频道视频
    delete this._localData.channelVideos![uid][sid]

    this.save()

    // 更改快捷键菜单
    this._hkm
      ?.removeWithKey(this._hkm_type.unsubscribe.key)
      .add([this._hkm_type.subscribe])

    // logo 颜色
    this._subscribeButton.innerHTML = IconUtil.Instance().LOGO(
      this._logo_color.doNotSubscribe
    )
  }

  /**
   * 获取频道所有视频 视频存入 _videos_temp
   * @param uid 用户ID
   * @param sid 频道 ID
   * @param page 页数
   * @returns 频道数据
   */
  private async getChannelVideos(uid: number, sid: number, page: number = 1) {
    const result = await Url.CHANEL_VIDEO.request({
      mid: uid,
      series_id: sid,
      pn: page
    })

    // 遍历视频列表
    if (result.data.archives.length !== 0) {
      result.data.archives.forEach((item: IVideoData) => {
        this._videos_temp.push({
          bvid: item.bvid,
          title: item.title,
          pic: item.pic,
          readed: true
        })
      })
      // 如果本页全满 说明可能有下一页
      if (result.data.archives.length === 100)
        await this.getChannelVideos(uid, sid, ++page)
    }
  }

  /**
   * 查询是否已订阅
   * @param uid 用户ID
   * @param sid 频道ID
   * @returns 是否已订阅
   */
  private isSubscribed(uid: number, sid: number): boolean {
    return (
      // chanel 不是 undefined
      this._localData.channel !== undefined &&
      // 频道中有 uid
      this._localData.channel.hasOwnProperty(uid) &&
      // uid 下有 sid
      this._localData.channel[uid].indexOf(sid) !== -1
      // 则已订阅
    )
  }

  /**
   * 存储本地数据
   */
  private save() {
    ExtStorage.Instance().setStorage<TSubscribeChannel, ISubscribeChannel>(
      new TSubscribeChannel(this._localData)
    )
  }
}
