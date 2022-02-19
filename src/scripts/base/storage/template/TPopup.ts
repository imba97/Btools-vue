/**
 * Popup 存储模板
 */

import { TemplateBase } from '@/scripts/base/storage/template/TemplateBase'

/**
 * Popup 配置项
 */
export interface IPopup extends Object {
  /**
   * 当前 route path
   */
  routePath?: string
}

export class TPopup extends TemplateBase {
  constructor(data: IPopup) {
    super(data)
  }
}
