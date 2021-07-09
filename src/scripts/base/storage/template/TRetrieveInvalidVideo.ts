/**
 * 找回失效视频存储模板
 */

import { TemplateBase } from '@base/storage/template/TemplateBase'

export interface IVideoInfo extends Object {
  /**
   * 视频标题
   */
  title: string

  /**
   * 视频图片链接
   */
  pic: string
}

export interface IRetrieveInvalidVideo extends Object {
  videoInfo: { [key: string]: IVideoInfo }
}

export class TRetrieveInvalidVideo extends TemplateBase {
  constructor(data: IRetrieveInvalidVideo) {
    super(data)
  }
}
