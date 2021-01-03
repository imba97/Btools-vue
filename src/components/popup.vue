<template>
  <div>
    <h1>{{ title }}</h1>
    <span>{{ message }}</span>
    <input type="text" v-model="uid" value="" placeholder="输入UID">
    <button @click="btn">请求数据测试</button>
  </div>
</template>

<script lang="ts">

import { Vue, Component } from 'vue-property-decorator';

// @Component 修饰符注明了此类为一个 Vue 组件
@Component
export default class Popup extends Vue {
  // 初始数据可以直接声明为实例的 property
  title = 'Popup';
  message = '';

  uid = '';

  public btn() {
    if (this.uid === '') {
      this.message = '未输入UID';
      return;
    }

    this.$chrome.runtime.sendMessage({
      type: 'get',
      url: `https://api.bilibili.com/x/web-interface/card?mid=${this.uid}&photo=1&jsonp=jsonp`
    }, (json) => {
      console.log(json);
      if (typeof json.data !== 'undefined') { this.message = `获取成功！昵称：${json.data.card.name}，当前粉丝数：${json.data.card.fans}`; }
    });
  }
}

</script>
