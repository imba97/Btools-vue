import HKM from './hotKeyMenu';
import Util from './util';

const nodeListOfElement = Util.instance.getElements('.h-forbid');

nodeListOfElement.then(elements => {
  new HKM(elements).add([
    {
      key: 83,
      title: '解封（bushi）',
      action: function() {
        const element = <HTMLElement>document.querySelector('.h-forbid');
        element.style.opacity = '0';
      }
    },
    {
      key: 82,
      title: '封禁',
      action: function(overlordElement) {
        overlordElement.style.opacity = '1';
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
