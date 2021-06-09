/**
 * 模块：找回失效视频
 */

import _ from 'lodash'
import $ from 'jquery'

import HKM from '@/scripts/base/hotKeyMenu'
import Util from '@/scripts/base/util'
import { Url } from '@/scripts/base/enums/url'

import ExtStorage from '@/scripts/base/storage/extStorage'
import {
  TRetrieveInvalidVideo,
  IRetrieveInvalidVideo,
  IVideoInfo
} from '@/scripts/base/storage/template'
import Vue from 'vue'

export default class RetrieveInvalidVideo {
  private _notFoundTitle = '未查询到视频信息'

  private _localData: IRetrieveInvalidVideo = {
    videoInfo: {}
  }

  constructor() {
    // ExtStorage.Instance().clear()

    const videoList = Util.Instance().getElements(
      '.fav-video-list>li.disabled>a.cover'
    )

    // 获取本地数据
    const localData = this.getLocalData()

    // 初始化
    Promise.all([videoList, localData]).then((res) => {
      // 设置读取到的视频信息
      this._localData = res[1]
      this.Init(res[0], res[1])
    })
  }

  private async Init(
    elements: NodeListOf<HTMLElement>,
    localData: IRetrieveInvalidVideo
  ) {
    // 视频 AV 号
    const aids: number[] = []

    // 获取本地数据

    // 循环失效视频标签
    _.forEach(elements, (element) => {
      const bvid = element.parentElement?.getAttribute('data-aid')

      if (!bvid) return

      // 如果在本地储存中 则用本地信息 否则获取相应的 AV 号
      if (localData.videoInfo.hasOwnProperty(bvid)) {
        this.setInvalidVideoInfo(
          element.parentElement!,
          localData.videoInfo[bvid].title,
          localData.videoInfo[bvid].pic
        )
        this.setHMK(element, localData.videoInfo[bvid])

        return
      }

      // 获取 AV 号
      const aid = Util.Instance().bv2av(bvid)
      aids.push(aid)
    })

    // 如果没有则不查询
    if (aids.length === 0) return

    // 已找到的视频 AV 号，与 aids 做对比，找出未找到的视频
    const findAids: number[] = []

    // 请求 biliplus 查询失效视频信息
    const json = await Url.BILIPLUS_VIDEO_INFO.request({
      aid: aids.join(',')
    })

    if (json.code === 0) {
      // 构造以找到 aid
      _.keys(json.data).map((str) => findAids.push(parseInt(str)))

      // 循环找到的视频
      _.forEach(json.data, async (data: IVideoInfo, _aid: string) => {
        const aid = parseInt(_aid)
        const bvid = Util.Instance().av2bv(aid)
        // 拿到失效视频 Element
        const element = await Util.Instance().getElement(
          `.fav-video-list>li.disabled[data-aid=${bvid}]`
        )

        // 添加到本地数据对象
        this.addLocalData(bvid, data)

        this.setInvalidVideoInfo(element, data.title, data.pic)
        // 为失效视频创建快捷键菜单
        this.setHMK(element, data)
      })
    }

    // 处理未找到的视频
    _.forEach(_.difference(aids, findAids), async (aid) => {
      const bvid = Util.Instance().av2bv(aid)

      // 未找到的也添加本地数据对象
      this.addLocalData(bvid, {
        title: this._notFoundTitle,
        pic: ''
      })

      await Util.Instance()
        .getElement(`.fav-video-list>li.disabled[data-aid=${bvid}]`)
        .then((element) => {
          this.setInvalidVideoInfo(element, this._notFoundTitle)
        })
    })

    // 不知为何 _localData 赋值慢半拍
    setTimeout(() => {
      // 数据保存到本地
      ExtStorage.Instance().setStorage<
        TRetrieveInvalidVideo,
        IRetrieveInvalidVideo
      >(new TRetrieveInvalidVideo(this._localData))
    }, 1000)
  }

  /**
   * 设置失效视频信息
   * @param title 标题
   * @param cover 封面
   */
  private setInvalidVideoInfo(
    element: HTMLElement,
    title: string,
    cover?: string
  ) {
    // 视频标题
    const color = title === this._notFoundTitle ? '#CCC' : '#F66'
    $(element).find('a.title').text(title).css({
      color: color,
      'font-weight': 700
    })

    if (cover && cover !== '') {
      // 视频封面
      $(element)
        .find('a.disabled .cover-img')
        .attr('src', cover)
        .css('-webkit-filter', 'none')

      // 移除遮挡
      $(element).find('.disabled-cover').remove()
    }
  }

  private getLocalData(): Promise<IRetrieveInvalidVideo> {
    return ExtStorage.Instance().getStorage<
      TRetrieveInvalidVideo,
      IRetrieveInvalidVideo
    >(
      new TRetrieveInvalidVideo({
        videoInfo: {}
      })
    )
  }

  private setHMK(element: HTMLElement, data: IVideoInfo) {
    new HKM(element).add([
      {
        key: 'S',
        title: '用百度搜索',
        action: () => {
          window.open(`https://www.baidu.com/s?ie=UTF-8&wd=${data.title}`)
        }
      }
    ])
  }

  private addLocalData(bvid: string, data: IVideoInfo) {
    const saveData: { [key: string]: IVideoInfo } = {}
    saveData[bvid] = {
      title: data.title,
      pic: data.pic
    }

    this._localData.videoInfo = _.assign(this._localData.videoInfo, saveData)
  }
}
