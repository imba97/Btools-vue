export interface ConfigOptions {
  
}

/**
 * 扩展配置 接口
 */
export interface IExtConfigs {

  getConfig(keys: Object): Promise<Object>

  setConfig(keys: Object): Promise<Object>

  removeConfig(keys: Object): Promise<Object>

}

/**
 * 扩展配置 实现类
 */
export class ExtConfigs implements IExtConfigs {

  public getConfig(keys: Object): Promise<Object> {
    return this._getStorage(keys);
  }

  public setConfig(keys: Object): Promise<Object> {
    return this._setStorage(keys);
  }

  public removeConfig(keys: Object): Promise<Object> {
    Object.keys(keys).map(function(option: any) {
      // 置空后保存
      keys[option] = null;
    });
    return this._setStorage(keys);
  }

  private _getStorage(keys: Object): Promise<Object> {
    return new Promise(resolve => {
      chrome.storage.sync.get(keys, function(items) {
        resolve(items);
      });
    });
  }

  private _setStorage(keys: Object): Promise<Object> {
    return new Promise(resolve => {
      chrome.storage.sync.set(keys, function() {
        resolve(keys);
      });
    });
  } 

}