/**
 * 评论相关功能存储模板
 *   - 历史表情
 *   - 自定义颜文字
 */

import { TemplateBase } from '@/scripts/base/storage/template/TemplateBase'

/**
 * 历史表情接口
 */
export interface IStickerHistory {
  /**
   * 是否是颜文字
   */
  isKaomoji: boolean

  /**
   * 表情文字
   */
  text: string

  /**
   * 表情图片链接
   */
  src: string
}

/**
 * 自定义颜文字接口
 */
export interface ICustomizeKaomoji {
  /**
   * 是否是大型颜文字
   */
  isBig: boolean

  name?: string

  /**
   * 颜文字
   */
  text: string
}

export type IEmoteItem = {
  text: string
  url: string
}

export type IEmotePackage = {
  /**
   * .current-type 下的 img url
   */
  url: string

  /**
   * 表情列表
   */
  emote: IEmoteItem[]
}

export interface IComment extends Object {
  stickerHistory?: IStickerHistory[]
  customizeKaomoji?: ICustomizeKaomoji[]
}

export class TComment extends TemplateBase {
  constructor(data: IComment) {
    super(data)
  }
}
