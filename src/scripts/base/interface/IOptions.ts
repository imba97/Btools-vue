import { OptionsType } from '@base/enums/OptionsType'

export interface IBtoolsConfigsOptions<T> extends Object {
  /**
   * 选项名称
   */
  name: string

  /**
   * 值
   */
  value: T

  /**
   * 选项类型
   */
  type: OptionsType
}

/**
 * 配置项
 */
export interface IBtoolsOptions<T> {
  /**
   * 配置项名称
   */
  name?: string

  /**
   * 选项值
   */
  values?: IBtoolsConfigsOptions<T>[]

  /**
   * 当前选项值
   */
  current: IBtoolsConfigsOptions<T> | null
}
