/**
 * 直播间助手
 */

import Util from '@/scripts/base/Util'
import { WatcherBase, HandleOptions } from '@/Watcher/WatcherBase'
import $ from 'jquery'
import _ from 'lodash'

export class HaiLinHappy extends WatcherBase {
  protected async init() {
    this.urls[HaiLinHappyEnum.Brackets] =
      /movie\.douban.com\/subject\/\d+\/(?!celebrities)/
    this.urls[HaiLinHappyEnum.WriterTopping] =
      /movie\.douban.com\/subject\/\d+\/celebrities/
  }

  protected handle(options: HandleOptions): void {
    Util.Instance().console('海林老师狂喜器', 'success')

    switch (options.index) {
      case HaiLinHappyEnum.Brackets:
        this.Brackets()
        break

      case HaiLinHappyEnum.WriterTopping:
        this.writerTopping()
        break
    }
  }

  private async Brackets() {
    await Util.Instance().getElement('#celebrities')

    const celebrities = $('#celebrities h2 .pl')

    if (celebrities.length === 0) return

    celebrities.html(celebrities.html().replace('(', '<').replace(')', '>'))
  }

  private async writerTopping() {
    await Util.Instance().getElement('#wrapper')
    $('.list-wrapper').each((_, element) => {
      const title = $(element).find('h2')
      if (title.text() === '编剧 Writer') {
        element.remove()
        $(element).css('zoom', 1.5)
        title.css({
          'font-size': '30px'
        })
        $('#celebrities').prepend(element)
      }
    })
  }
}

enum HaiLinHappyEnum {
  Brackets,
  WriterTopping
}
