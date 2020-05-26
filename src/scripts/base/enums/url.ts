export class Url {

  private _base_url = 'https://api.bilibili.com/';

  public static readonly enums: Url[] = [];

  public static readonly USER_CARD: Url = new Url('/x/web-interface/card');

  constructor(private _url: string) {
    Url.enums.push(this);
  }

  get url(): string {
    return this._base_url + this._url;
  }

}