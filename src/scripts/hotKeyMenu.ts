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

  private _height = 100;

  constructor(elements: NodeListOf<HTMLElement>) {
    if (elements.length === 0) return this;

    this.overlordElements = elements;

    // 生成快捷键菜单ID，每个快捷键菜单对应一个，与宿主元素绑定
    const hotKeyMenuID = Util.instance.random();

    this.overlordElements.forEach(overlordElement => {
      overlordElement.setAttribute('btools-bind-hkm-id', hotKeyMenuID);

      // 鼠标按下
      overlordElement.addEventListener('mousedown', (e: MouseEventInit) => {
        e = e || window.event;

        if (e.button !== 0) return true;

        // 鼠标抬起
        window.addEventListener('mouseup', (e: MouseEventInit) => {
          e = e || window.event;
          console.log('hide');
          Util.instance.changeDisplay(this.menuElement, 'hide');
        }, {
          once: true
        });

        Util.instance.changeDisplay(this.menuElement, 'show');

        Util.instance.position(this.menuElement, e.clientX! - this.menuElement.clientWidth / 2, e.clientY! - 60);
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

  public add(options: Array<HotKeyMenuOption>): HKM {
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

    this.restructure();
    return this;
  }

  public removeWithKey(key: number) {

  }

  private show(test: any) {
    Util.instance.console(test);
  }

  private restructure() {
    // 获取第一个子元素 ul
    const optionsElement = this.menuElement.children[1];

    // 清空 HTML
    optionsElement.innerHTML = '';

    this.setHeightWithOptionsLength(this.options.length);
 
    this.options.forEach(option => {
      const optionElement = document.createElement('li');

      const optionKeyElement = document.createElement('span');
      const optionTitleElement = document.createElement('p');

      // key 和 标题
      optionKeyElement.innerText = String.fromCharCode(option.key);
      optionTitleElement.innerText = option.title;

      optionElement.addEventListener('mouseover', function() {
        optionElement.addClass('btools-hkm-option-selected');
      });
      optionElement.addEventListener('mouseout', function() {
        optionElement.removeClass('btools-hkm-option-selected');
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
