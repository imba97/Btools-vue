/**
 * 模块：找回失效视频
 */

import _ from 'lodash'
import $ from 'jquery'
import moment from 'moment'

import HKM from '@/scripts/base/HotKeyMenu'
import Util from '@/scripts/base/Util'
import ModuleBase from '@/scripts/module/ModuleBase'

import ExtStorage from '@/scripts/base/storage/ExtStorage'
import {
  TRetrieveInvalidVideo,
  IRetrieveInvalidVideo,
  IVideoInfo,
  IVideoDetail
} from '@/scripts/base/storage/template'
import { BilibiliApi, BiliPlus, JijiDown } from '@/api'

export class RetrieveInvalidVideo extends ModuleBase {
  private _notFoundTitle = '未查询到视频信息'

  private _localData: IRetrieveInvalidVideo = {
    videoInfo: {},
    videoDetail: {},
    notInvalidVideoInfo: {}
  }

  /**
   * 未失效视频 已请求视频信息的 bvid
   */
  private _notInvalidVideoBvids: string[] = []

  protected async handle() {
    const videoList = Util.Instance().getElements(
      '.fav-video-list>li>a.cover,.fav-video-list>li>a.title'
    )

    // 获取本地数据
    const localData = ExtStorage.Instance().getStorage<
      TRetrieveInvalidVideo,
      IRetrieveInvalidVideo
    >(
      new TRetrieveInvalidVideo({
        videoInfo: {},
        videoDetail: {},
        notInvalidVideoInfo: {}
      })
    )

    // 初始化
    const res = await Promise.all([videoList, localData])

    this.Init(res[0], res[1])
  }

  private async Init(
    elements: NodeListOf<HTMLElement>,
    localData: IRetrieveInvalidVideo
  ) {
    // 设置读取到的视频信息
    this._localData = localData

    // 每次初始化都清空
    this._notInvalidVideoBvids = []

    // 视频 AV 号
    const aids: number[] = []

    // 循环失效视频标签
    _.forEach(elements, async (element) => {
      // 获取 BV 号
      const bvid = element.parentElement?.getAttribute('data-aid')
      if (!bvid) return true

      // 获取 AV 号
      const aid = Util.Instance().bv2av(bvid)

      // 是否是失效的
      const isDisabled =
        _.indexOf(element.parentElement?.classList, 'disabled') !== -1

      // 没有失效的视频
      if (!isDisabled) {
        await this.notInvalidVideoHandle(element, bvid)
        return true
      }

      // 如果在本地储存中 则用本地信息 否则获取相应的 AV 号
      if (isDisabled && localData.videoInfo.hasOwnProperty(bvid)) {
        if (!localData.videoInfo[bvid].hasOwnProperty('mid')) {
          if (aids.indexOf(aid) === -1) aids.push(aid)
        }

        this.setInvalidVideoInfo(
          element.parentElement!,
          localData.videoInfo[bvid].title,
          localData.videoInfo[bvid].pic
        )

        // 给找到的视频添加快捷键菜单
        if (localData.videoInfo[bvid].title !== this._notFoundTitle)
          this.setHMK(element, aid.toString(), localData.videoInfo[bvid])

        return true
      }

      // 不在本地存储中 添加到待查询的 aid 数组内
      if (aids.indexOf(aid) === -1) aids.push(aid)
    })

    // 保存一下
    this.save()

    // 如果没有则不查询
    if (aids.length === 0) return

    // 已找到的视频 AV 号，与 aids 做对比，找出未找到的视频
    const findAids: number[] = []

    // 请求 biliplus 查询失效视频信息
    const json = await BiliPlus.Instance().videoInfo(aids.join(','))

    if (json.code === 0) {
      // 构造以找到 aid
      _.keys(json.data).map((str) => findAids.push(parseInt(str)))

      // 循环找到的视频
      _.forEach(json.data, async (data: IVideoInfo, _aid: string) => {
        const aid = parseInt(_aid)
        const bvid = Util.Instance().av2bv(aid)

        // 标题 不等于 未找到的标题 就创建快捷键菜单
        this.foundInvalidVideoHandle(
          aid,
          bvid,
          data,
          data.title !== this._notFoundTitle
        )
      })
    }

    // 处理未找到的视频
    _.forEach(_.difference(aids, findAids), async (aid) => {
      // biliplus 未找到的 发到 jijidown 继续查找
      const jijidownData = await JijiDown.Instance().videoInfo(`${aid}`)

      const bvid = Util.Instance().av2bv(aid)

      // 查到则保存
      if (jijidownData.upid !== -1) {
        const data = {
          mid: jijidownData.upid,
          title: jijidownData.title,
          pic: jijidownData.img
        }

        this.foundInvalidVideoHandle(aid, bvid, data, true)
      } else {
        // jijidown 也未找到 添加到本地存储
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
      }
    })

    // 不知为何 _localData 赋值慢半拍
    setTimeout(() => {
      // 数据保存到本地
      this.save()
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

  /**
   * 已找到视频处理
   * @param aid AV号
   * @param bvid BV号
   * @param data 视频数据
   * @param isCreateHKM 是否创建快捷键菜单
   */
  private async foundInvalidVideoHandle(
    aid: number,
    bvid: string,
    data: IVideoInfo,
    isCreateHKM: boolean
  ) {
    // 添加到本地数据对象
    this.addLocalData(bvid, data)

    // 拿到失效视频 Element
    const element = await Util.Instance().getElement(
      `.fav-video-list>li.disabled[data-aid=${bvid}]`
    )

    this.setInvalidVideoInfo(element, data.title, data.pic)

    if (!isCreateHKM) return

    // 为失效视频创建快捷键菜单
    const a = await Util.Instance().getElements(
      `.fav-video-list>li.disabled[data-aid=${bvid}]>a.cover,.fav-video-list>li.disabled[data-aid=${bvid}]>a.title`
    )

    a.forEach((aEle) => {
      this.setHMK(aEle, `${aid}`, data)
    })
  }

  /**
   * 未失效视频处理
   * @param element
   * @param bvid
   */
  private async notInvalidVideoHandle(element: HTMLElement, bvid: string) {
    // 判断是否有本地存储
    if (this._localData.notInvalidVideoInfo.hasOwnProperty(bvid)) {
      this.setNotInvalidVideoHMK(element, bvid)
      return
    }

    const videoInfo = await BilibiliApi.Instance().videoInfo(bvid)

    if (videoInfo.code === 0) {
      this._localData.notInvalidVideoInfo[bvid] = {
        mid: videoInfo.data.owner.mid,
        aid: videoInfo.data.aid
      }

      // 视频信息
      this._localData.videoInfo[bvid] = {
        mid: videoInfo.data.owner.mid,
        title: videoInfo.data.title,
        pic: videoInfo.data.pic
      }

      // 分P信息
      const partNames: string[] = []
      _.forEach(videoInfo.data.pages, (item) => {
        partNames.push(item.part)
      })

      // 详情信息
      this._localData.videoDetail[bvid] = {
        desc: videoInfo.data.desc,
        author: videoInfo.data.owner.name,
        partNames,
        created_at: moment(videoInfo.data.pubdate * 1000).format('YYYY-MM-DD HH:mm:ss')
      }

      this.setNotInvalidVideoHMK(element, bvid)
    }
  }

  private setNotInvalidVideoHMK(element: HTMLElement, bvid: string) {
    new HKM(element).add([
      {
        key: 'S',
        title: '打开视频',
        action: () => {
          window.open(`https://b23.tv/${bvid}`)
        }
      },
      {
        key: 'E',
        title: '打开UP主空间',
        action: () => {
          window.open(
            `https://space.bilibili.com/${this._localData.notInvalidVideoInfo[bvid].mid}`
          )
        }
      },
      {
        key: 'D',
        title: '详细信息',
        action: () => {
          this.detailInfo(this._localData.notInvalidVideoInfo[bvid].aid)
        }
      }
    ])
  }

  private setHMK(element: HTMLElement, aid: string, data: IVideoInfo) {
    $(element).addClass('btools-user-select-none')
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
      this.showDetail()
      this.setDetailInfo(aid, bvid, this._localData.videoDetail[bvid])
      return
    }

    // 显示详情窗口 此时会 loading
    this.showDetail()
    const detail = await BiliPlus.Instance().videoDetail(aid)

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

    // 请求完成后 展示信息
    this.setDetailInfo(aid, bvid, detailInfo)

    this._localData.videoDetail[bvid] = detailInfo

    this.save()
  }

  private showDetail() {
    let detailBox = $('.btools-detail-box')
    if (detailBox.length === 0) {
      $('body').append(
        `
        <div class="btools-detail-box">
          <span class="btools-close-btn">×</span>
          <div class="btools-container">
            <div class="btools-video-info">
              <p class="btools-title"></p>
              <p class="btools-part">分P信息</p>
              <ul class="btools-list"></ul>
              <div class="btools-link">
                缓存：
                <a class="btools-link-jijidown" href="javascript:void(0);" target="_blank">哔哩哔哩唧唧</a>
                、<a class="btools-link-biliplus" href="javascript:void(0);" target="_blank">biliplus</a>
              </div>
            </div>
            <div class="btools-loading">
              <div class="sk-chase">
                <div class="sk-chase-dot"></div>
                <div class="sk-chase-dot"></div>
                <div class="sk-chase-dot"></div>
                <div class="sk-chase-dot"></div>
                <div class="sk-chase-dot"></div>
                <div class="sk-chase-dot"></div>
              </div>
            </div>
          </div>
          <div class="btools-background"></div>
        </div>
      `
      )

      detailBox = $('.btools-detail-box')

      detailBox.on('click', '.btools-close-btn', () => {
        detailBox.hide()
      })

      return
    }

    // 展示 并先隐藏 视频信息 显示 loading
    if (detailBox.is(':hidden')) {
      detailBox.show()
      detailBox.find('.btools-video-info').hide()
      detailBox.find('.btools-loading').show()
    }
  }

  private setDetailInfo(aid: string, bvid: string, detailInfo: IVideoDetail) {
    const detailBox = $('.btools-detail-box')

    const getPartNames =
      detailInfo.partNames.length === 1 && detailInfo.partNames[0] === ''
        ? '<li>无</li>'
        : this.getDetailPartNamesLi(detailInfo.partNames)

    // 添加分P信息
    detailBox.find('.btools-list').html(getPartNames)
    // 设置标题
    detailBox.find('.btools-title').text(this._localData.videoInfo[bvid].title)
    // 设置分P滚动条到最顶部
    detailBox.find('.btools-list').html(getPartNames).scrollTop(0)

    // 设置缓存网站 链接
    detailBox
      .find('.btools-link-jijidown')
      .attr('href', `https://www.jijidown.com/video/av${aid}`)
    detailBox
      .find('.btools-link-biliplus')
      .attr('href', `https://www.biliplus.com/video/av${aid}`)

    // 展示 视频信息 隐藏 loading
    detailBox.find('.btools-video-info').show()
    detailBox.find('.btools-loading').hide()
  }

  private getDetailPartNamesLi(partNames: string[]) {
    let result = ''
    _.forEach(partNames, (item, index) => {
      result += `<li>${index + 1}. ${item}</li>`
    })

    return result
  }

  private save() {
    ExtStorage.Instance().setStorage<
      TRetrieveInvalidVideo,
      IRetrieveInvalidVideo
    >(new TRetrieveInvalidVideo(this._localData))
  }
}
