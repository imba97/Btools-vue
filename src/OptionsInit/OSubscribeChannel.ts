import ExtStorage from '@base/storage/ExtStorage'
import { OptionsType } from '@base/enums/OptionsType'
import { ISubscribeChannel, TSubscribeChannel } from '@base/storage/template'
import _ from 'lodash'

export class OSubscribeChannel {
  private _localData: ISubscribeChannel = {}

  constructor() {
    this.init()
  }

  async init() {
    await this.get()

    _.forEach(this._localData.setting, (item, key) => {
      switch (key) {
        case 'time':
          if (!this._localData.setting?.time) this.setTime()
          break
      }
    })

    this.save()
  }

  setTime() {
    console.log('set time')
    const values = [
      {
        name: '10分钟',
        type: OptionsType.Text,
        value: 10
      },
      {
        name: '30分钟',
        type: OptionsType.Text,
        value: 30
      },
      {
        name: '1小时',
        type: OptionsType.Text,
        value: 60
      }
    ]

    this._localData.setting!.time = {
      name: '检查更新周期',
      values,
      current: values[0]
    }
  }

  async get() {
    this._localData = await ExtStorage.Instance().getStorage<
      TSubscribeChannel,
      ISubscribeChannel
    >(
      new TSubscribeChannel({
        setting: {
          time: null
        }
      })
    )
  }

  save() {
    ExtStorage.Instance().setStorage<TSubscribeChannel, ISubscribeChannel>(
      new TSubscribeChannel(this._localData)
    )
  }
}
