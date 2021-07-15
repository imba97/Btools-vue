/**
 * 找回失效视频存储模板
 */

import { TemplateBase } from '@base/storage/template/TemplateBase'

export interface IVideoInfo extends Object {
  /**
   * 作者 UID
   */
  mid: string

  /**
   * 视频标题
   */
  title: string

  /**
   * 视频图片链接
   */
  pic: string
}

export interface IVideoDetail extends Object {
  /**
   * 视频简介详情
   */
  desc: string

  /**
   * 作者
   */
  author: string

  /**
   * 分P 标题
   */
  partNames: string[]

  /**
   * 发布时间
   */
  created_at: string
}

export interface IRetrieveInvalidVideo extends Object {
  videoInfo: { [key: string]: IVideoInfo }
  videoDetail: { [key: string]: IVideoDetail }
}

export class TRetrieveInvalidVideo extends TemplateBase {
  constructor(data: IRetrieveInvalidVideo) {
    super(data)
  }
}
