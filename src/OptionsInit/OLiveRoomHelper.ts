import ExtStorage from '@/scripts/base/storage/ExtStorage'
import { OptionsType } from '@/scripts/base/enums/OptionsType'
import {
  ILiveRoomHelper,
  TLiveRoomHelper
} from '@/scripts/base/storage/template'
import _ from 'lodash'

export class OLiveRoomHelper {
  private _localData: ILiveRoomHelper = {}

  async init() {
    await this.get()

    _.forEach(this._localData.setting, (item, key) => {
      switch (key) {
        case 'miniPlayer':
          if (!this._localData.setting?.miniPlayer) this.setMiniPlayer()
          break
      }
    })

    return await this.save()
  }

  setMiniPlayer() {
    const values = [
      {
        name: '开',
        type: OptionsType.Text,
        value: true
      },
      {
        name: '关',
        type: OptionsType.Text,
        value: false
      }
    ]

    this._localData.setting!.miniPlayer = {
      name: '显示迷你播放器',
      values,
      current: values[0]
    }
  }

  async get() {
    this._localData = await ExtStorage.Instance().getStorage<
      TLiveRoomHelper,
      ILiveRoomHelper
    >(
      new TLiveRoomHelper({
        setting: {
          miniPlayer: null
        }
      })
    )
  }

  async save() {
    return await ExtStorage.Instance().setStorage<
      TLiveRoomHelper,
      ILiveRoomHelper
    >(new TLiveRoomHelper(this._localData))
  }
}
