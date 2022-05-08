export class TemplateBase {
  private _name: string

  protected _data: Object

  public constructor(data: Object) {
    this._data = data
    this._name = (this as any).__proto__.constructor.name
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

export interface ITemplateBase extends Object {
  setting?: { [key: string]: any }
}
