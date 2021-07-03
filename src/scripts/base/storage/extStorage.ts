/**
 * 扩展配置
 */

import _ from 'lodash'

import { browser } from 'webextension-polyfill-ts'

import TemplateBase from '@/scripts/base/storage/template/TemplateBase'
import Singleton from '@/scripts/base/singletonBase/Singleton'

export default class ExtStorage extends Singleton {
  public getStorage<T extends TemplateBase, TResult>(
    configs: T
  ): Promise<TResult> {
    return this._getStorage<T, TResult>(configs)
  }

  public setStorage<T extends TemplateBase, TResult>(
    configs: T
  ): Promise<TResult> {
    return this._setStorage<T, TResult>(configs)
  }

  public removeStorage<T extends TemplateBase, TResult>(
    configs: T
  ): Promise<TResult> {
    const data = configs.GetData()
    Object.keys(data).map(function (option: string | number) {
      // 置空后保存
      data[option] = null
    })

    configs.SetData(data)

    return this._setStorage(configs)
  }

  public clear() {
    browser.storage.local.clear()
  }

  private _getStorage<T extends TemplateBase, TResult>(
    configs: T
  ): Promise<TResult> {
    return new Promise((resolve) => {
      // 根据类型自动分配模块 index
      const space = new Object()
      space[configs.GetName()] = configs.GetData()

      browser.storage.local.get(space).then((items) => {
        resolve({
          ...configs.GetData(),
          ...items[configs.GetName()]
        })
      })
    })
  }

  private _setStorage<T extends TemplateBase, TResult>(
    configs: T
  ): Promise<TResult> {
    return new Promise((resolve) => {
      // 根据类型自动分配模块 index
      const space = {}
      space[configs.GetName()] = configs.GetData()

      browser.storage.local.set(space).then(() => {
        resolve(configs.GetData() as TResult)
      })
    })
  }
}
