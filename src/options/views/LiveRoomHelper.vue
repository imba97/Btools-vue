<template>
  <div>
    <h2 class="title">直播间助手配置项（点击切换选项）</h2>
    <ul class="options">
      <li
        v-for="(item, index) in options"
        :key="index"
        @click="change($event, index, item.key)"
        @contextmenu="change($event, index, item.key)"
      >
        <span class="name">{{ item.name }}：</span>
        <span class="value">{{ item.current.name }}</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { OLiveRoomHelper } from '@/OptionsInit'
import { OptionsType } from '@/scripts/base/enums/OptionsType'
import { IBtoolsConfigsOptions, IBtoolsOptions } from '@/scripts/base/interface/IOptions'
import ExtStorage from '@/scripts/base/storage/ExtStorage'
import { TLiveRoomHelper, ILiveRoomHelper } from '@/scripts/base/storage/template'
import _ from 'lodash'
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class SubscribeChannel extends Vue {
  private _localData: ILiveRoomHelper = {}
  private _isSetting = false

  options: Options[] = []
  type = OptionsType

  async created() {
    this._localData = await new OLiveRoomHelper().init()

    // 循环每一项 显示到界面
    _.forEach(this._localData.setting, (option, key) => {
      if (
        !option ||
        !(option as IBtoolsOptions<any>).name ||
        !(option as IBtoolsOptions<any>).current
      )
        return true

      this.options.push({
        key,
        name: (option as IBtoolsOptions<any>).name!,
        current: (option as IBtoolsOptions<any>).current!
      })
    })
  }

  /**
   * 改变值
   * @param e 鼠标事件
   * @param optionIndex 选项 index
   * @param key 本地存储 key
   */
  async change(e: MouseEvent, optionIndex: number, key: string) {
    e.preventDefault()
    e.stopPropagation()

    // 是否正在设置
    if (this._isSetting) return
    this._isSetting = true

    // 找到当前选项 index
    const index = _.findIndex(
      this._localData.setting![key].values,
      (item: IBtoolsConfigsOptions<any>) =>
        item.value === this._localData.setting![key].current.value
    )

    // 最大值
    const max = this._localData.setting![key].values.length

    // 下一项 index
    let next

    // 鼠标左键 下一项
    if (e.button === 0) {
      next = index + 1 < max ? index + 1 : 0
      // 鼠标右键 上一项
    } else if (e.button === 2) {
      next = (index - 1 >= 0 ? index : max) - 1
    } else {
      return
    }

    // 设置本地存储
    this._localData.setting![key].current =
      this._localData.setting![key].values[next]

    // 设置页面
    this.options[optionIndex].current =
      this._localData.setting![key].values[next]

    // 保存本地存储
    await ExtStorage.Instance().setStorage<TLiveRoomHelper, ILiveRoomHelper>(
      new TLiveRoomHelper(this._localData)
    )

    this._isSetting = false
  }
}

interface Options {
  key: string
  name: string
  current: IBtoolsOptions<any>
}
</script>
