export default class HKM {
  private menuElement: Element = document.createElement('div');
  private overlordDocument: Element|null = null;

  private items: [] = [];
  private selectedItem = -1;

  constructor(dom: Element) {
    this.overlordDocument = dom;
    this.menuElement.setAttribute('class', 'Btools-hot-key-menu');

    if (this.overlordDocument === null) return this;
    this.overlordDocument.addEventListener('mousedown', function(e) {
      e.preventDefault();
      alert('test2333');
    });
  }

  public add(items: [object]) {
    items.map(item => {
      console.log(item);
    });
  }

  public removeWithKey(key: number) {

  }
}
