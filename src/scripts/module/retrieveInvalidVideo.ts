/**
 * 模块：找回失效视频
 */

import _ from 'lodash'
import $ from 'jquery'

import HKM from '@base/HotKeyMenu'
import Util from '@base/Util'
import { Url } from '@base/Url'
import ModuleBase from '@/scripts/module/ModuleBase'

import ExtStorage from '@base/storage/ExtStorage'
import {
  TRetrieveInvalidVideo,
  IRetrieveInvalidVideo,
  IVideoInfo,
  IVideoDetail
} from '@base/storage/template'

export class RetrieveInvalidVideo extends ModuleBase {
  private _notFoundTitle = '未查询到视频信息'

  private _localData: IRetrieveInvalidVideo = {
    videoInfo: {},
    videoDetail: {}
  }

  protected handle() {
    const videoList = Util.Instance().getElements(
      '.fav-video-list>li.disabled>a.cover,.fav-video-list>li.disabled>a.title'
    )

    // 获取本地数据
    const localData = ExtStorage.Instance().getStorage<
      TRetrieveInvalidVideo,
      IRetrieveInvalidVideo
    >(
      new TRetrieveInvalidVideo({
        videoInfo: {},
        videoDetail: {}
      })
    )

    // 初始化
    Promise.all([videoList, localData]).then((res) => {
      this.Init(res[0], res[1])
    })
  }

  private async Init(
    elements: NodeListOf<HTMLElement>,
    localData: IRetrieveInvalidVideo
  ) {
    // 设置读取到的视频信息
    this._localData = localData

    // 视频 AV 号
    const aids: number[] = []

    // 获取本地数据

    // 循环失效视频标签
    _.forEach(elements, (element) => {
      const bvid = element.parentElement?.getAttribute('data-aid')

      if (!bvid) return true

      // 获取 AV 号
      const aid = Util.Instance().bv2av(bvid)

      // 如果在本地储存中 则用本地信息 否则获取相应的 AV 号
      if (localData.videoInfo.hasOwnProperty(bvid)) {
        if (!localData.videoInfo[bvid].hasOwnProperty('mid')) {
          aids.push(aid)
        }

        this.setInvalidVideoInfo(
          element.parentElement!,
          localData.videoInfo[bvid].title,
          localData.videoInfo[bvid].pic
        )

        // 给找到的视频添加快捷键菜单
        if (localData.videoInfo[bvid].title !== this._notFoundTitle)
          this.setHMK(element, aid.toString(), localData.videoInfo[bvid])

        return
      }

      // 不在本地存储中 添加到待查询的 aid 数组内
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

        // 如果没找到视频则不添加快捷键菜单
        if (data.title === this._notFoundTitle) return true

        // 为失效视频创建快捷键菜单
        const a = await Util.Instance().getElements(
          `.fav-video-list>li.disabled[data-aid=${bvid}]>a.cover,.fav-video-list>li.disabled[data-aid=${bvid}]>a.title`
        )

        a.forEach((aEle) => {
          this.setHMK(aEle, _aid, data)
        })
      })
    }

    // 处理未找到的视频
    _.forEach(_.difference(aids, findAids), async (aid) => {
      const bvid = Util.Instance().av2bv(aid)

      // 未找到的也添加本地数据对象
      this.addLocalData(bvid, {
        mid: '',
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
        .attr({
          src: cover,
          alt: '封面已被删除'
        })
        .css('-webkit-filter', 'none')

      // 移除遮挡
      $(element).find('.disabled-cover').remove()
    }
  }

  private setHMK(element: HTMLElement, aid: string, data: IVideoInfo) {
    new HKM(element).add([
      {
        key: 'S',
        title: '用百度搜索',
        action: () => {
          window.open(`https://www.baidu.com/s?ie=UTF-8&wd=${data.title}`)
        }
      },
      {
        key: 'E',
        title: '打开UP主空间',
        action: () => {
          if (data['mid'] !== undefined)
            window.open(`https://space.bilibili.com/${data.mid}`)
        }
      },
      {
        key: 'D',
        title: '详细信息',
        action: () => {
          this.detailInfo(aid)
        }
      }
    ])
  }

  private addLocalData(bvid: string, data: IVideoInfo) {
    const saveData: { [key: string]: IVideoInfo } = {}
    saveData[bvid] = {
      mid: data.mid,
      title: data.title,
      pic: data.pic
    }

    this._localData.videoInfo = _.assign(this._localData.videoInfo, saveData)
  }

  private async detailInfo(aid: string) {
    const bvid = Util.Instance().av2bv(parseInt(aid))
    // 如果存在本地存储中
    if (this._localData.videoDetail.hasOwnProperty(bvid)) {
      this.showDetail(aid, bvid, this._localData.videoDetail[bvid])
      return
    }

    const detail = await Url.BILIPLUS_VIDEO_DETAIL.request({
      id: aid
    })

    const partNames: string[] = []
    // 取出分P标题
    _.forEach(detail.list, (item) => {
      partNames.push(item.part)
    })

    const detailInfo: IVideoDetail = {
      desc: detail.description,
      partNames: partNames,
      author: detail.author,
      created_at: detail.created_at
    }

    this.showDetail(aid, bvid, detailInfo)

    this._localData.videoDetail[bvid] = detailInfo

    ExtStorage.Instance().setStorage<
      TRetrieveInvalidVideo,
      IRetrieveInvalidVideo
    >(new TRetrieveInvalidVideo(this._localData))
  }

  private showDetail(aid: string, bvid: string, detailInfo: IVideoDetail) {
    const getPartNames =
      detailInfo.partNames.length === 1 && detailInfo.partNames[0] === ''
        ? '<li>无</li>'
        : this.getDetailPartNamesLi(detailInfo.partNames)

    let detailBox = $('.btools-detail-box')
    if (detailBox.length === 0) {
      $('body').append(
        `
        <div class="btools-detail-box">
          <span class="btools-close-btn">×</span>
          <div class="btools-container">
            <p class="btools-title">${this._localData.videoInfo[bvid].title}</p>
            <p class="btools-part">分P信息</p>
            <ul class="btools-list"></ul>
            <div class="btools-link">
              缓存：
              <a href="https://www.jijidown.com/video/av${aid}" target="_blank">哔哩哔哩唧唧</a>
              、<a href="https://www.biliplus.com/video/av${aid}" target="_blank">biliplus</a>
            </div>
          </div>
          <div class="btools-background"></div>
        </div>
      `
      )

      detailBox = $('.btools-detail-box')

      detailBox.find('.btools-list').html(getPartNames)

      detailBox.on('click', '.btools-close-btn', () => {
        detailBox.hide()
      })

      return
    }

    if (detailBox.is(':hidden')) {
      detailBox.show()
    }

    detailBox.find('.btools-title').text(this._localData.videoInfo[bvid].title)
    detailBox.find('.btools-list').html(getPartNames).scrollTop(0)
  }

  private getDetailPartNamesLi(partNames: string[]) {
    let result = ''
    _.forEach(partNames, (item, index) => {
      result += `<li>${index + 1}. ${item}</li>`
    })

    return result
  }
}
