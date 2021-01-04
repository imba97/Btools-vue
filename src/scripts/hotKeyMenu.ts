import Util from './util';

export default class HKM {
  // 宿主元素，添加快捷键菜单的元素
  private overlordElements?: NodeListOf<HTMLElement>;
  // 菜单 DIV
  private menuElement: HTMLElement = document.createElement('div');

  // 所有选项
  private options: Array<HotKeyMenuOption> = [];
  // 当前选择的选项
  private selectedItem = -1;
  // 键盘
  private keys: Array<string> = [];

  private _height = 100;

  private onKeyDownFunc: any;
  private onMouseUpFunc: any;

  constructor(elements: NodeListOf<HTMLElement>) {
    if (elements.length === 0) return this;

    this.overlordElements = elements;

    // 生成快捷键菜单ID，每个快捷键菜单对应一个，与宿主元素绑定
    const hotKeyMenuID = Util.Instance.random();

    this.overlordElements.forEach(overlordElement => {
      overlordElement.setAttribute('btools-bind-hkm-id', hotKeyMenuID);

      // 鼠标按下
      overlordElement.addEventListener('mousedown', (e: MouseEventInit) => {
        e = e || window.event;

        if (e.button !== 0) return false;

        this.onMouseUpFunc = this.onMouseUp.bind(this, overlordElement);
        this.onKeyDownFunc = this.onKeyDown.bind(this, overlordElement);

        // 显示菜单
        this.menuElement.style.display = 'block';
        // 设置位移 X 中心在鼠标位置 Y 鼠标位置 - 60 也就是默认选中第一个
        Util.Instance.position(this.menuElement, e.clientX! - this.menuElement.clientWidth / 2, e.clientY! - 60);

        // 监听鼠标抬起
        window.addEventListener('mouseup', this.onMouseUpFunc);

        // 监听键盘事件
        window.addEventListener('keydown', this.onKeyDownFunc);
      }, true);
    });

    this.menuElement.setAttribute('class', 'Btools-hot-key-menu');
    this.menuElement.setAttribute('btools-hkm-id', hotKeyMenuID);

    // 标题
    const titleElement = document.createElement('p');
    titleElement.setAttribute('class', 'title');
    titleElement.innerText = '快捷键菜单';

    // 选项列表
    const optionsElement = document.createElement('ul');
    optionsElement.setAttribute('class', 'options');

    // 背景
    const backgroundElement = document.createElement('div');
    backgroundElement.setAttribute('class', 'background');

    // 加到菜单中
    this.menuElement.appendChild(titleElement);
    this.menuElement.appendChild(optionsElement);
    this.menuElement.appendChild(backgroundElement);

    document.body.appendChild(this.menuElement);
  }

  private onMouseUp() {
    // 获取参数
    const args: Array<any> = Array.prototype.slice.call(arguments);
    const overlordElement = args[0];
    // 隐藏菜单
    this.menuElement.style.display = 'none';
    // 有 被选中的选项 并且 有 action 函数 则执行
    if (this.selectedItem !== -1 && typeof this.options[this.selectedItem].action === 'function') {
      this.options[this.selectedItem].action(overlordElement);
    }
    // 删除事件监听
    this.removeEventListener();
  }

  private onKeyDown() {
    // 获取参数
    const args: Array<any> = Array.prototype.slice.call(arguments);
    const overlordElement = args[0];
    const e = args[1] || window.event;
    // 获取按键对应的数组 index
    const index: number = this.keys.indexOf(e.key.toUpperCase());
    // 如果这个按键不在快捷键菜单内 直接 return
    if (index === -1) return;
    // 隐藏菜单
    this.menuElement.style.display = 'none';
    // 有 action 函数 则执行
    if (typeof this.options[index].action === 'function') {
      this.options[index].action(overlordElement);
    }
    // 删除事件监听
    this.removeEventListener();
  }

  private removeEventListener() {
    // 删除键盘事件
    if (this.onKeyDownFunc !== null) {
      window.removeEventListener('keydown', this.onKeyDownFunc);
      this.onKeyDownFunc = null;
    }

    // 删除鼠标事件
    if (this.onMouseUpFunc !== null) {
      window.removeEventListener('mouseup', this.onMouseUpFunc);
      this.onMouseUpFunc = null;
    }
  }

  public add(options: Array<HotKeyMenuOption>): HKM {
    options.forEach(option => {
      // 如果没设置 position 则默认 push 到数组末尾
      if (typeof option.position === 'undefined') {
        this.options.push(option);
        this.keys.push(option.key);
        return true;
      }

      // 有的话如果是 first 则用 unshift 放在数组开头
      switch (option.position) {
        case 'first':
          this.options.unshift(option);
          this.keys.unshift(option.key);
          break;

        default:
          this.options.push(option);
          this.keys.push(option.key);
          break;
      }
    });

    this.restructure();
    return this;
  }

  /**
   * 根据 keyCode 删除选项
   * @param key 按键值
   */
  public removeWithKey(key: string): HKM {
    this.options.forEach((option, index) => {
      if (option.key !== key) return false;

      // 根据 index，删除元素
      this.options.splice(index, 1);

      // 重新构建菜单
      this.restructure();
    });

    return this;
  }

  private show(test: any) {
    Util.Instance.console(test);
  }

  private restructure() {
    // 获取第一个子元素 ul
    const optionsElement = this.menuElement.children[1];

    // 清空 HTML
    optionsElement.innerHTML = '';

    this.setHeightWithOptionsLength(this.options.length);

    this.options.forEach((option, index) => {
      const optionElement = document.createElement('li');

      const optionKeyElement = document.createElement('span');
      const optionTitleElement = document.createElement('p');

      // key 和 标题
      optionKeyElement.innerText = option.key.toUpperCase();
      optionTitleElement.innerText = option.title;

      optionElement.addEventListener('mouseover', () => {
        optionElement.classList.add('btools-hkm-option-selected');
        // 设置当前被选中的元素
        this.selectedItem = index;
      });
      optionElement.addEventListener('mouseout', () => {
        optionElement.classList.remove('btools-hkm-option-selected');
        // 设置当前被选中的元素为空
        this.selectedItem = -1;
      });

      optionElement.appendChild(optionKeyElement);
      optionElement.appendChild(optionTitleElement);

      // 将选项 li 放入 ul
      optionsElement.appendChild(optionElement);
    });
  }

  private setHeightWithOptionsLength(optionsLength: number) {
    const optionsTitleElementStyleHeight = 40;
    const optionsElementStylePadding = optionsLength * 10;
    const optionsElementStyleHeight = optionsLength * 30;
    this.height = optionsTitleElementStyleHeight + optionsElementStylePadding + optionsElementStyleHeight;
  }

  private set height(setHeight: number) {
    this._height = setHeight;

    console.log(setHeight);

    this.menuElement.style.height = setHeight + 'px';
  }

  private get height() {
    return this._height;
  }
}
