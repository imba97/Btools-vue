/**
 * 找回失效视频存储
 */

import TemplateBase from '@/scripts/base/storage/template/TemplateBase'

export interface IVideoInfo {
  /**
   * 视频标题
   */
  title: string

  /**
   * 视频图片链接
   */
  pic: string
}

export interface IRetrieveInvalidVideo {
  videoInfo: Object
}

export class TRetrieveInvalidVideo extends TemplateBase {
  protected _data

  constructor(data: IRetrieveInvalidVideo) {
    super()

    this._data = data
  }
}
