/**
 * 模块基类
 */

export default abstract class ModuleBase {
  private _name: string
  public constructor() {
    this._name = (this as any).__proto__.constructor.name
    this.handle()
  }

  protected abstract handle(): void
}
