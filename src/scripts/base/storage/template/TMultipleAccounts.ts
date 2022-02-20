/**
 * 多帐号 存储模板
 */

import { TemplateBase } from '@/scripts/base/storage/template/TemplateBase'
import { IAccountItem } from '@/scripts/base/interface/IMultipleAccounts'

/**
 * 多帐号 配置项
 */
export interface IMultipleAccounts extends Object {
  /**
   * 用户列表
   */
  userList?: IAccountItem[]
}

export class TMultipleAccounts extends TemplateBase {
  constructor(data: IMultipleAccounts) {
    super(data)
  }
}
