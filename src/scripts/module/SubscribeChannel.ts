import BaseModule from '@/scripts/module/BaseModule'
import Util from '@base/Util'
import ExtStorage from '@base/storage/ExtStorage'
import { TSubscribeChannel, ISubscribeChannel } from '@base/storage/template'
import _ from 'lodash'
import { Url } from '../base/Url'
import IconUtil from '../base/IconUtil'
import HKM from '../base/HotKeyMenu'

export default class SubscribeChannel extends BaseModule {
  private _localData: ISubscribeChannel = {}
  private _subscribeButton = document.createElement('a')
  private _isSubscribed = false
  private _channel_info: { uid?: number; cid?: number } = {}
  private _hkm?: HKM
  private _hkm_type: { [key: string]: HotKeyMenuOption } = {
    subscribe: {
      key: 'S',
      title: '订阅频道',
      action: () => {
        this.doSubscribe(this._channel_info.uid!, this._channel_info.cid!)
      }
    },
    unsubscribe: {
      key: 'S',
      title: '取消订阅',
      action: () => {
        this.doUnSubscribe(this._channel_info.uid!, this._channel_info.cid!)
      }
    }
  }

  protected async handle() {
    Util.Instance().console('订阅频道', 'success')

    // 读取本地数据
    this._localData = await ExtStorage.Instance().getStorage<
      TSubscribeChannel,
      ISubscribeChannel
    >(
      new TSubscribeChannel({
        chanel: {},
        readed: {}
      })
    )

    const channel_action_row = await Util.Instance().getElement(
      '.channel-action-row'
    )

    const channel_info_reg =
      /space\.bilibili\.com\/(\d+)\/channel\/detail\?cid=(\d+)/.exec(
        window.location.href
      )

    if (channel_info_reg === null) return

    // 用户 ID
    this._channel_info.uid = parseInt(channel_info_reg[1])
    // 频道 ID
    this._channel_info.cid = parseInt(channel_info_reg[2])

    // 查询是否已订阅
    this._isSubscribed = this.isSubscribed(
      this._channel_info.uid,
      this._channel_info.cid
    )
    console.log('是否已订阅', this._isSubscribed)

    this._subscribeButton.setAttribute('class', 'btools-subscribe-button')
    this._subscribeButton.innerHTML = this._isSubscribed
      ? IconUtil.Instance().LOGO('#CCC')
      : IconUtil.Instance().LOGO()

    this._hkm = new HKM(this._subscribeButton).add([this._hkm_type.subscribe])

    channel_action_row.appendChild(this._subscribeButton)
  }

  /**
   * 订阅处理事件
   * @param uid 用户ID
   * @param cid 频道ID
   */
  private async doSubscribe(uid: number, cid: number, page: number = 1) {
    Url.CHANEL_VIDEO.request({
      mid: uid,
      cid,
      ps: page
    }).then((json) => {
      console.log(json)
    })

    this._hkm
      ?.removeWithKey(this._hkm_type.subscribe.key)
      .add([this._hkm_type.unsubscribe])

    this._subscribeButton.innerHTML = IconUtil.Instance().LOGO('#CCC')
  }

  /**
   * 取消订阅事件
   * @param uid 用户ID
   * @param cid 频道ID
   */
  private doUnSubscribe(uid: number, cid: number) {
    this._hkm
      ?.removeWithKey(this._hkm_type.unsubscribe.key)
      .add([this._hkm_type.subscribe])
    this._subscribeButton.innerHTML = IconUtil.Instance().LOGO()
  }

  /**
   * 查询是否已订阅
   * @param uid 用户ID
   * @param cid 频道ID
   * @returns 是否已订阅
   */
  private isSubscribed(uid: number, cid: number): boolean {
    console.log(`查询是否已订阅 uid: ${uid}, cid: ${cid}`)
    return (
      // chanel 不是 undefined
      this._localData.chanel !== undefined &&
      // 频道中有 uid
      this._localData.chanel.hasOwnProperty(uid) &&
      // uid 下有 cid
      this._localData.chanel[uid].indexOf(cid) !== -1
      // 则已订阅
    )
  }

  private reset() {}
}
