/**
 * 扩展配置
 */

import Vue from 'vue'
import _ from 'lodash'

import TemplateBase from '@/scripts/base/storage/template/TemplateBase'
import Singleton from '@/scripts/base/singletonBase/singleton'

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
    Vue.chrome.storage.sync.clear()
  }

  private _getStorage<T extends TemplateBase, TResult>(
    configs: T
  ): Promise<TResult> {
    return new Promise((resolve) => {
      // 根据类型自动分配模块 index
      const space = new Object()
      space[configs.GetName()] = configs.GetData()

      console.log('读取', space)

      Vue.chrome.storage.sync.get(space, function (items) {
        console.log('get', items)
        resolve(items[configs.GetName()])
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

      console.log('保存', space)

      Vue.chrome.storage.sync.set(space, function () {
        resolve(<TResult>configs.GetData())
      })
    })
  }
}
