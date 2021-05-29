import HKM from './hotKeyMenu';
import Util from './util';
import Vue from 'vue';

export default class Viv {
  constructor() {
    console.log('Viv')
    const videoList = Util.Instance.getElements('.fav-video-list>li.disabled')
    videoList.then(elements => {
      new HKM(elements).add([
        {
          key: 'S',
          title: '用百度搜索',
          action: (element) => {
            window.open(`https://www.baidu.com/s?ie=UTF-8&wd=${element}`)
          }
        }
      ])
    })
  }
}

/*

const nodeListOfElement = Util.Instance.getElements('#app');

nodeListOfElement.then(elements => {
  new HKM(elements).add([
    {
      key: 'S',
      title: '控制台输出“1”',
      action: function() {
        console.log('1');
      }
    },
    {
      key: 'R',
      title: '控制台输出“2”',
      action: function() {
        console.log(2);
      }
    }
  ]);
})
  .catch(error => {
    Util.Instance.console(error, 'error');
  });

*/
