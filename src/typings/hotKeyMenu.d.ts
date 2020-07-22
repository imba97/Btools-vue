declare interface HotKeyMenuOption {

  /** 快捷键菜单每一项的按键值 */
  key: number;

  /** 快捷键菜单每一项的显示文字 */
  title: string;

  /** 快捷键菜单每一项执行的函数 */
  action: (overlordElement: HTMLElement) => void;

  /** 快捷键菜单每一项添加到的位置（可选） */
  position?: string;

}