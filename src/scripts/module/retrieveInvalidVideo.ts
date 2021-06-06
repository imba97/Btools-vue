/**
 * 模块：找回失效视频
 */

import _ from 'lodash'
import $ from 'jquery'

import HKM from '@/scripts/base/hotKeyMenu'
import Util from '@/scripts/base/util'
import { Url } from '@/scripts/base/enums/url'

export default class RetrieveInvalidVideo {
  private _notFoundTitle = '未查询到视频信息'

  constructor() {
    const videoList = Util.Instance.getElements(
      '.fav-video-list>li.disabled>a.cover'
    )

    videoList.then(async (elements) => {
      // 视频 AV 号
      const aids: number[] = []

      // 循环失效视频标签
      _.forEach(elements, (element) => {
        const bvid = element.parentElement?.getAttribute('data-aid')
        if (bvid) {
          // 获取 AV 号
          const aid = Util.Instance.bv2av(bvid)
          aids.push(aid)
        }
      })

      // 已找到的视频 AV 号，与 aids 做对比，找出未找到的视频
      const findAids: number[] = []

      // 请求 biliplus 查询失效视频信息
      await Url.BILIPLUS_VIDEO_INFO.request({
        aid: aids.join(','),
      }).then((json) => {
        if (json.code !== 0) return

        // 构造以找到 aid
        _.keys(json.data).map((str) => findAids.push(parseInt(str)))

        // 循环找到的视频
        _.forEach(json.data, (data, _aid: string) => {
          const aid = parseInt(_aid)
          const bvid = Util.Instance.av2bv(aid)
          // 拿到失效视频 Element
          Util.Instance.getElement(
            `.fav-video-list>li.disabled[data-aid=${bvid}]`
          ).then((element) => {
            this.setInvalidVideoInfo(element, data.title, data.pic)
            // 为失效视频创建快捷键菜单
            new HKM(element).add([
              {
                key: 'S',
                title: '用百度搜索',
                action: () => {
                  window.open(
                    `https://www.baidu.com/s?ie=UTF-8&wd=${data.title}`
                  )
                },
              },
            ])
            // HKM End
          })
          // getElement End
        })
        // 循环 json.data End
      })

      // 处理未找到的视频
      _.forEach(_.difference(aids, findAids), (aid) => {
        const bvid = Util.Instance.av2bv(aid)

        Util.Instance.getElement(
          `.fav-video-list>li.disabled[data-aid=${bvid}]`
        ).then((element) => {
          this.setInvalidVideoInfo(element, this._notFoundTitle)
        })
      })
    })
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
      'font-weight': 700,
    })

    if (cover) {
      // 视频封面
      $(element)
        .find('a.disabled .cover-img')
        .attr('src', cover)
        .css('-webkit-filter', 'none')

      // 移除遮挡
      $(element).find('.disabled-cover').remove()
    }
  }
}
