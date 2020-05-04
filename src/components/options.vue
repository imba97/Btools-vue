<template>
  <div>
    <h1>{{ message }}</h1>
  </div>
</template>

<script lang="ts">

import { Vue, Component } from 'vue-property-decorator';

// @Component 修饰符注明了此类为一个 Vue 组件
@Component
export default class Options extends Vue {
  // 初始数据可以直接声明为实例的 property
  message = 'Hello!';
}

</script>
