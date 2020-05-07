import HKM from './hotKeyMenu';
import Util from './util';

const UtilInstance = Util.instance();

console.log('start');
console.error('error');

const btn = UtilInstance.getElements('.avatar123');
const span = UtilInstance.getElements('#primaryChannelMenu>span');

Promise.all([btn, span]).then(nodeLists => {
  nodeLists.map(elements => {
    elements.forEach((element) => {
      new HKM(element).add([
        {
          key: 83,
          title: '测试',
          action: function() {
            alert('测试');
          }
        }
      ]);
    });
  });
})
  .catch(error => {
    UtilInstance.console(error, 'error');
  });
