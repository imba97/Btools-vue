import Util from '@base/Util'
import $ from 'jquery'
import _ from 'lodash'

export default class HKM {
  // 宿主元素，添加快捷键菜单的元素
  private overlordElement?: NodeListOf<HTMLElement> | HTMLElement
  // 菜单 DIV
  private menuElement: HTMLElement = document.createElement('div')
  private $menuElement: JQuery<HTMLElement> = $(this.menuElement)

  // 所有选项
  private options: Array<HotKeyMenuOption> = []
  // 当前选择的选项
  private selectedItem = -1
  // 键盘
  private keys: Array<string> = []

  private _height = 100

  private onKeyDownFunc: any
  private onMouseUpFunc: any

  constructor(elements: NodeListOf<HTMLElement> | HTMLElement) {
    // 生成快捷键菜单ID，每个快捷键菜单对应一个，与宿主元素绑定
    const hotKeyMenuID = Util.Instance().random()

    this.overlordElement = elements

    if (typeof elements['length'] !== 'undefined') {
      if (elements['length'] === 0) return this
      ;(this.overlordElement as NodeListOf<HTMLElement>).forEach(
        (overlordElement) => {
          this.setOverlordElement(overlordElement, hotKeyMenuID)
        }
      )
    } else {
      this.setOverlordElement(elements as HTMLElement, hotKeyMenuID)
    }

    this.menuElement.setAttribute('class', 'Btools-hot-key-menu')
    this.menuElement.setAttribute('btools-hkm-id', hotKeyMenuID)

    // 标题
    const titleElement = document.createElement('p')
    titleElement.setAttribute('class', 'title')
    titleElement.innerText = '快捷键菜单'

    // 选项列表
    const optionsElement = document.createElement('ul')
    optionsElement.setAttribute('class', 'options')

    // 背景
    const backgroundElement = document.createElement('div')
    backgroundElement.setAttribute('class', 'background')

    // 加到菜单中
    this.menuElement.appendChild(titleElement)
    this.menuElement.appendChild(optionsElement)
    this.menuElement.appendChild(backgroundElement)

    document.body.appendChild(this.menuElement)
  }

  private setOverlordElement(
    overlordElement: HTMLElement,
    hotKeyMenuID: string
  ) {
    overlordElement.setAttribute('btools-bind-hkm-id', hotKeyMenuID)

    // 鼠标按下
    overlordElement.addEventListener(
      'mousedown',
      (e: MouseEvent) => {
        e = e || window.event

        if (e.button !== 0) return false

        this.onMouseUpFunc = this.onMouseUp.bind(this, overlordElement)
        this.onKeyDownFunc = this.onKeyDown.bind(this, overlordElement)

        // 显示菜单
        this.$menuElement.show()

        let top = e.screenY - 160
        let left = e.screenX - this.menuElement.clientWidth / 2

        // 修正 top left 防止超出页面
        if (top < 0) top = 0
        if (top > document.body.clientHeight - this.menuElement.clientHeight)
          top = document.body.clientHeight - this.menuElement.clientHeight

        if (left < 0) left = 0
        if (left > document.body.clientWidth - this.menuElement.clientWidth)
          left = document.body.clientWidth - this.menuElement.clientWidth

        // 设置位移 X 中心在鼠标位置 Y 鼠标位置 - 60 也就是默认选中第一个
        this.$menuElement.css({
          top,
          left
        })

        // 监听鼠标抬起
        window.addEventListener('mouseup', this.onMouseUpFunc)

        // 监听键盘事件
        window.addEventListener('keydown', this.onKeyDownFunc)
      },
      true
    )
  }

  private onMouseUp() {
    // 获取参数
    const args: Array<any> = Array.prototype.slice.call(arguments)
    const overlordElement = args[0]
    // 隐藏菜单
    this.menuElement.style.display = 'none'
    // 有 被选中的选项 并且 有 action 函数 则执行
    if (
      this.selectedItem !== -1 &&
      typeof this.options[this.selectedItem].action === 'function'
    ) {
      this.options[this.selectedItem].action(overlordElement)
    }
    // 删除事件监听
    this.removeEventListener()
  }

  private onKeyDown() {
    // 获取参数
    const args: Array<any> = Array.prototype.slice.call(arguments)
    const overlordElement = args[0]
    const e = args[1] || window.event
    // 获取按键对应的数组 index
    const index: number = this.keys.indexOf(e.key.toUpperCase())
    // 如果这个按键不在快捷键菜单内 直接 return
    if (index === -1) return
    // 隐藏菜单
    this.menuElement.style.display = 'none'
    // 有 action 函数 则执行
    if (typeof this.options[index].action === 'function') {
      this.options[index].action(overlordElement)
    }
    // 删除事件监听
    this.removeEventListener()
  }

  private removeEventListener() {
    // 删除键盘事件
    if (this.onKeyDownFunc !== null) {
      window.removeEventListener('keydown', this.onKeyDownFunc)
      this.onKeyDownFunc = null
    }

    // 删除鼠标事件
    if (this.onMouseUpFunc !== null) {
      window.removeEventListener('mouseup', this.onMouseUpFunc)
      this.onMouseUpFunc = null
    }
  }

  /**
   * 添加按键
   * @param options 快捷键菜单选项
   * @returns 当前类
   */
  public add(options: Array<HotKeyMenuOption>): this {
    options.forEach((option) => {
      // 如果没设置 position 则默认 push 到数组末尾
      if (typeof option.position === 'undefined') {
        this.options.push(option)
        this.keys.push(option.key)
        return true
      }

      // 有的话如果是 first 则用 unshift 放在数组开头
      switch (option.position) {
        case 'first':
          this.options.unshift(option)
          this.keys.unshift(option.key)
          break

        default:
          this.options.push(option)
          this.keys.push(option.key)
          break
      }
    })

    this.restructure()
    return this
  }

  /**
   * 根据 keyCode 删除选项
   * @param key 按键值
   */
  public removeWithKey(key: string): this {
    const index = _.findIndex(this.keys, key)

    // 根据 index 删除选项 和 keys
    this.options.splice(index, 1)
    this.keys.splice(index, 1)

    // 重新构建菜单
    this.restructure()

    return this
  }

  /**
   * 设置元素 CSS
   * @param target 目标元素
   * @param css CSS
   */
  public setCss(target: SetCssTarget, css: any) {
    switch (target) {
      case SetCssTarget.OverlordElements:
        $(this.overlordElement!).css(css)
        break
      case SetCssTarget.MenuElement:
        this.$menuElement.css(css)
        break
    }
  }

  private restructure() {
    // 获取第一个子元素 ul
    const optionsElement = this.menuElement.children[1]

    // 清空 HTML
    optionsElement.innerHTML = ''

    this.setHeightWithOptionsLength(this.options.length)

    this.options.forEach((option, index) => {
      const optionElement = document.createElement('li')

      const optionKeyElement = document.createElement('span')
      const optionTitleElement = document.createElement('p')

      // key 和 标题
      optionKeyElement.innerText = option.key.toUpperCase()
      optionTitleElement.innerText = option.title

      optionElement.addEventListener('mouseover', () => {
        optionElement.classList.add('btools-hkm-option-selected')
        // 设置当前被选中的元素
        this.selectedItem = index
      })
      optionElement.addEventListener('mouseout', () => {
        optionElement.classList.remove('btools-hkm-option-selected')
        // 设置当前被选中的元素为空
        this.selectedItem = -1
      })

      optionElement.appendChild(optionKeyElement)
      optionElement.appendChild(optionTitleElement)

      // 将选项 li 放入 ul
      optionsElement.appendChild(optionElement)
    })
  }

  private setHeightWithOptionsLength(optionsLength: number) {
    const optionsTitleElementStyleHeight = 40
    const optionsElementStylePadding = optionsLength * 10
    const optionsElementStyleHeight = optionsLength * 30
    this.height =
      optionsTitleElementStyleHeight +
      optionsElementStylePadding +
      optionsElementStyleHeight
  }

  private set height(setHeight: number) {
    this._height = setHeight
    this.$menuElement.height(setHeight)
  }

  private get height() {
    return this._height
  }
}

export enum SetCssTarget {
  OverlordElements,
  MenuElement
}
