/**
 * 模块基类
 */

import ExtStorage from '@/scripts/base/storage/ExtStorage'
import { TComment, IComment } from '@/scripts/base/storage/template'

export default class BaseModule {
  constructor() {
    const localData = this.getLocalData()
    console.log('历史表情', localData)
  }

  private getLocalData(): Promise<IComment> {
    return ExtStorage.Instance().getStorage<TComment, IComment>(
      new TComment({
        stickerHistory: []
      })
    )
  }
}
