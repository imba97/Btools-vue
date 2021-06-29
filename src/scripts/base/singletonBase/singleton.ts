export default class Singleton {
  public static Instance<T>(this: new () => T): T {
    if (!(this as any).instance) (this as any).instance = new this()
    return (this as any).instance
  }
}
