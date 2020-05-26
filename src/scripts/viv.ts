import HKM from './hotKeyMenu';
import Util from './util';

console.log('start');

const banner = Util.instance.getElements('.bili-banner');

banner.then(elements => {
  new HKM(elements).add([
    {
      key: 83,
      title: '测试',
      action: function() {
        alert('测试');
      }
    },
    {
      key: 82,
      title: '测试2',
      action: function() {
        alert('测试2');
      }
    }
  ]);
})
  .catch(error => {
    Util.instance.console(error, 'error');
  });

chrome.runtime.sendMessage({
  url: ''
});
