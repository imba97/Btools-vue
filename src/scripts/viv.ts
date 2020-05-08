import HKM from './hotKeyMenu';
import Util from './util';

const UtilInstance = Util.instance();

console.log('start');

const btn = UtilInstance.getElements('.avatar,#primaryChannelMenu>span');

btn.then(elements => {
  new HKM(elements).add([
    {
      key: 83,
      title: '测试',
      action: function() {
        alert('测试');
      }
    }
  ]);
})
  .catch(error => {
    UtilInstance.console(error, 'error');
  });
