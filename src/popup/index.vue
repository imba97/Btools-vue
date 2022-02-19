<style lang="scss" scoped>
@use "sass:color";
@import "~@/assets/styles/variables.scss";

.popup-container {
  width: 320px;
  height: 500px;

  display: flex;
  flex-direction: column;

  .popup-navbar {
    $navbar-height: 40px;

    width: 100%;
    height: $navbar-height;
    background-color: $default-color;

    ::v-deep {
      a {
        position: relative;

        padding: 0 10px;

        height: $navbar-height;
        line-height: $navbar-height;

        cursor: pointer;
        display: inline-block;

        font-size: 16px;
        color: #fff;

        text-decoration: none;

        &.active {
          background-color: darken($default-color, 5%);

          &::before {
            content: " ";

            position: absolute;
            left: 0;
            bottom: 0;

            width: 100%;
            height: 3px;
            background-color: lighten($default-color, 10%);

            border-radius: 3px 3px 0 0;

            display: block;
          }
        }
      }
    }
  }

  .popup-view {
    flex: 1;
  }
}
</style>


<template>
  <div class="popup-container">
    <div class="popup-navbar">
      <router-link to="/SubscribeChannel">订阅频道</router-link>
      <router-link to="/MultipleAccounts">多帐号</router-link>
    </div>

    <div class="popup-view">
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </div>
  </div>
</template>

<script lang="ts">
import ExtStorage from '@/scripts/base/storage/ExtStorage'
import { IPopup, TPopup } from '@/scripts/base/storage/template/TPopup'
import { Vue, Component, Watch } from 'vue-property-decorator'

@Component
export default class Popup extends Vue {

  private _localData: IPopup = {}

  // 监听路由 path
  @Watch('$route.path')
  onRouterChanged(path: string) {
    this._localData.routePath = path
    this.save()
  }

  async created() {
    // 加载配置
    this._localData = await ExtStorage.Instance().getStorage<
      TPopup,
      IPopup
    >(new TPopup({
      routePath: ''
    }))

    // 如果不为空 则跳转
    if (this._localData.routePath !== '') {
      this.$router.push(this._localData.routePath!)
    }
  }

  /**
   * 保存配置
   */
  save() {
    ExtStorage.Instance().setStorage<
      TPopup,
      IPopup
    >(
      new TPopup(this._localData)
    )
  }

}
</script>
