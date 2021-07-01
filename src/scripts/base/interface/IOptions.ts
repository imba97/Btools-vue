export interface IBtoolsConfigsOptions<T> extends Object {
  /**
   * 选项名称
   */
  name: string

  /**
   * 选项类型
   */
  type: string

  /**
   * 选项值
   */
  values: T[]

  /**
   * 当前选项值
   */
  current: T
}

/**
 * 配置项
 */
export interface IBtoolsOptions<T> {
  /**
   * 配置项名称
   */
  name: string

  /**
   * 配置项选项值
   */
  options: T
}
