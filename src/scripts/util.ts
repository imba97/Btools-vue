export default class Util {
  private static _instance: Util;

  public static instance(): Util {
    if (typeof this._instance === 'undefined') {
      this._instance = new Util();
    }
    return this._instance;
  }

  public getCookie(name: string): void {
    console.log(name);
  }

  public info(msg: any): void {
    console.log(msg);
  }
}
