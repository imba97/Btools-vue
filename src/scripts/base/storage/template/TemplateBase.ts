export default abstract class TemplateBase {
  private _name: string

  protected abstract _data: Object

  public constructor() {
    this._name = (<any>this).__proto__.constructor.name
  }
  public GetName(): string {
    return this._name
  }

  public GetData(): Object {
    return this._data
  }

  public SetData(data: Object): void {
    this._data = data
  }
}
