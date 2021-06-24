/**
 * 模块：历史表情
 */

import ExtStorage from '@/scripts/base/storage/ExtStorage'
import { TComment, IComment } from '@/scripts/base/storage/template'
import { IContentJs } from '@/scripts/base/interface/IContentJs'

export default class StickerHistory {
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
