/**
 * 直播间助手存储模板
 */

import { TemplateBase } from '@/scripts/base/storage/template/TemplateBase'
import { IBtoolsOptions } from '@/scripts/base/interface/IOptions'

/**
 * 直播间助手 配置项
 */
export interface ILiveRoomHelperOptions extends Object {
  /**
   * 迷你播放器是否显示
   */
  miniPlayer: IBtoolsOptions<boolean> | null
}

export interface ILiveRoomHelper extends Object {
  setting?: ILiveRoomHelperOptions
}

export class TLiveRoomHelper extends TemplateBase {
  constructor(data: ILiveRoomHelper) {
    super(data)
  }
}
