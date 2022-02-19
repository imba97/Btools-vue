import Singleton from '@/scripts/base/singletonBase/Singleton'

export default class Util extends Singleton {
  private bvTool = {
    table: [...'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF'],
    s: [11, 10, 3, 8, 4, 6],
    xor: 177451812,
    add: 8728348608
  }

  /**
   * AV号 转 BV号
   * @param av AV号
   * @param isLower 开头的 BV 是否小写，默认为 false
   * @returns BV 号
   */
  public av2bv(av: number, isLower = false): string {
    let num = NaN
    if (Object.prototype.toString.call(av) === '[object Number]') {
      num = av
    } else if (Object.prototype.toString.call(av) === '[object String]') {
      num = parseInt(av.toString().replace(/[^0-9]/gu, ''))
    }
    if (isNaN(num) || num <= 0) {
      throw new Error('¿你在想桃子?')
    }

    num = (num ^ this.bvTool.xor) + this.bvTool.add
    const result = [...`${isLower ? 'bv' : 'BV'}1  4 1 7  `]
    let i = 0
    while (i < 6) {
      result[this.bvTool.s[i]] =
        this.bvTool.table[Math.floor(num / 58 ** i) % 58]
      i += 1
    }
    return result.join('')
  }

  /**
   * BV号 转 AV号
   * @param bv AV号
   * @returns AV 号
   */
  public bv2av(bv: string): number {
    let str = ''
    if (bv.length === 12) {
      str = bv
    } else if (bv.length === 10) {
      str = `BV${bv}`
    } else if (bv.length === 9) {
      str = `BV1${bv}`
    } else {
      throw new Error('¿你在想桃子?')
    }
    if (
      !str.match(
        /[Bb][Vv][fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF]{10}/gu
      )
    ) {
      throw new Error('¿你在想桃子?')
    }

    let result = 0
    let i = 0
    while (i < 6) {
      result += this.bvTool.table.indexOf(str[this.bvTool.s[i]]) * 58 ** i
      i += 1
    }
    return (result - this.bvTool.add) ^ this.bvTool.xor
  }

  public getElement(selector: string): Promise<HTMLElement> {
    // 先获取一次
    let element: HTMLElement | null = document.querySelector(selector)

    if (element) return Promise.resolve(element)

    // 如果没获取到 开启计时器 循环获取
    return new Promise((resolve, reject) => {
      let timeout = 120

      const timer = setInterval(() => {
        element = document.querySelector(selector)

        // 成功获取
        if (element !== null) {
          resolve(element)
          clearInterval(timer)
        }

        // timeout
        if (timeout === 0) {
          reject(new Error('Empty Element'))
          clearInterval(timer)
        }

        timeout--
      }, 500)
    })
  }

  /**
   * 获取页面上的元素，一分钟内如果没获取到则停止获取
   * @param selector 选择器
   */
  public getElements(selector: string): Promise<NodeListOf<HTMLElement>> {
    let elements: NodeListOf<HTMLElement> = document.querySelectorAll(selector)

    if (elements.length > 0) return Promise.resolve(elements)

    return new Promise((resolve, reject) => {
      let timeout = 120
      const timer = setInterval(() => {
        elements = document.querySelectorAll(selector)

        // 成功获取
        if (elements.length !== 0) {
          resolve(elements)
          clearInterval(timer)
        }

        // timeout
        if (timeout === 0) {
          reject(new Error('Empty Element'))
          clearInterval(timer)
        }

        timeout--
      }, 500)
    })
  }

  public random(length = 8, type?: string): string {
    let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

    if (typeof type !== 'undefined') {
      switch (type) {
        case 'string':
          chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
          break

        case 'number':
          chars = '0123456789'
          break

        default:
          break
      }
    }

    let result = ''

    for (let i = length; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }

    return result
  }

  public inNodeList(
    element: HTMLElement,
    nodeList: NodeListOf<HTMLElement>
  ): number {
    let result = -1

    nodeList.forEach((nodeItem, index) => {
      if (element === nodeItem) {
        result = index
        return false
      }
    })

    return result
  }

  public position(element: HTMLElement, x: number, y: number) {
    element.style.top = y + 'px'
    element.style.left = x + 'px'
  }

  public console(
    message: any,
    type?: 'success' | 'waring' | 'error',
    prefix = 'Btools'
  ) {
    let css: string

    switch (type) {
      case 'success':
        prefix += ' Success:'
        css =
          'background-image: linear-gradient(to top, #0ba360 0%, #3cba92 100%);'
        break
      case 'waring':
        prefix += ' Waring:'
        css =
          'background-image: linear-gradient(to top, #e6b980 0%, #eacda3 100%);'
        break

      case 'error':
        prefix += ' Error:'
        css =
          'background-image: linear-gradient(to top, #ff0844 0%, #ffb199 100%);'
        break

      default:
        prefix += ' Info:'
        css =
          'background: linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.15) 100%), radial-gradient(at top center, rgba(255,255,255,0.40) 0%, rgba(0,0,0,0.40) 120%) #989898; background-blend-mode: multiply,multiply;'
    }

    css += 'color: #FFF; padding: 2px 3px; border-radius: 3px;'

    console.log('%c' + prefix, css, message)
  }

  /**
   * 时间格式化
   * @author meizz
   * @param date 时间
   * @param fmt
   * @returns
   */
  public dateFormat(timestamp: number, fmt: string) {
    const date = new Date(timestamp)

    const o = {
      'M+': date.getMonth() + 1, //月份
      'd+': date.getDate(), //日
      'h+': date.getHours(), //小时
      'm+': date.getMinutes(), //分
      's+': date.getSeconds(), //秒
      'q+': Math.floor((date.getMonth() + 3) / 3), //季度
      S: date.getMilliseconds() //毫秒
    }

    if (/(y+)/.test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        (date.getFullYear() + '').substr(4 - RegExp.$1.length)
      )
    for (let k in o)
      if (new RegExp('(' + k + ')').test(fmt))
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length == 1
            ? o[k]
            : ('00' + o[k]).substr(('' + o[k]).length)
        )

    return fmt
  }
}
