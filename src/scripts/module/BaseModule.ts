/**
 * 模块基类
 */

import ExtStorage from '@/scripts/base/storage/ExtStorage'
import TemplateBase from '@/scripts/base/storage/template/TemplateBase'

export default abstract class BaseModule {
  private _name: string
  public constructor() {
    this._name = (this as any).__proto__.constructor.name
    this.handle()
  }

  protected abstract handle(): void
}
