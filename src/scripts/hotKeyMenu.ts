import Util from './util';

export default class HKM {
  private menuElement: Element = document.createElement('div');
  private overlordElements?: NodeListOf<Element>;

  private options: Array<HotKeyMenuOption> = [];
  private selectedItem = -1;

  private _height = 100;

  constructor(elements: NodeListOf<Element>) {
    if (elements.length === 0) return this;

    this.overlordElements = elements;

    // 生成快捷键菜单ID，每个快捷键菜单对应一个，与宿主元素绑定
    const hotKeyMenuID = Util.instance().random();

    this.overlordElements.forEach(overlordElement => {
      overlordElement.setAttribute('btools-bind-hkm-id', hotKeyMenuID);

      // 鼠标按下
      overlordElement.addEventListener('mousedown', (e: MouseEventInit) => {
        e = e || window.event;

        if (e.button !== 0) return true;

        // 鼠标抬起
        window.addEventListener('mouseup', (e: MouseEventInit) => {
          e = e || window.event;
          // Util.instance().changeDisplay(this.menuElement, 'hide');
          this.menuElement.removeClass('test');
        }, {
          once: true
        });

        this.menuElement.addClass('test');

        Util.instance().changeDisplay(this.menuElement, 'show');
        Util.instance().position(this.menuElement, e.clientX! - this.height / 2, e.clientY! - this.height / 2);

        console.log(this.menuElement.clientWidth, this.menuElement.clientHeight);
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

  public add(options: [HotKeyMenuOption]) {
    options.forEach(option => {
      // 如果没设置 position 则默认 push 到数组末尾
      if (typeof option.position === 'undefined') {
        this.options.push(option);
        return true;
      }

      // 有的话如果是 first 则用 unshift 放在数组开头
      switch (option.position) {
        case 'first':
          this.options.unshift(option);
          break;

        default:
          this.options.push(option);
          break;
      }
    });
  }

  public removeWithKey(key: number) {

  }

  private show(test: any) {
    Util.instance().console(test);
  }

  private restructure() {
    const optionsElement = this.menuElement.children[0];

    this.options.forEach(option => {
      const optionElement = document.createElement('li');
      optionElement.innerText = option.title;
      optionElement.addEventListener('mouseover', function() {

      });
      optionElement.addEventListener('mouseout', function() {

      });
    });
  }

  private set height(setHeight: number) {
    this._height = setHeight;

    let style = this.menuElement.getAttribute('style') || '';

    const regHeight = /height:([^;]*?);/;

    const isHeight = regHeight.test(style);

    if (isHeight) {
      style = style.replace(regHeight, `height: ${setHeight}px;`);
      this.menuElement.setAttribute('style', style);
    } else {
      style = `height: ${setHeight}px; ${style}`;
      this.menuElement.setAttribute('style', style);
    }
  }

  private get height() {
    return this._height;
  }
}
