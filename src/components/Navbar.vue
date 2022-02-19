<style lang="scss" scoped>
@use "sass:color";
@import "~@/assets/styles/variables.scss";

.navbar-container {
  $scroll-bar-height: 5px;

  $navbar-height: 40px;

  padding-bottom: $scroll-bar-height;

  width: 450px;
  height: $navbar-height;

  overflow-y: hidden;
  overflow-x: scroll;

  &::-webkit-scrollbar {
    height: $scroll-bar-height;
  }
  &::-webkit-scrollbar-thumb {
    background-color: lighten($default-color, 20%);
  }
  &::-webkit-scrollbar-track {
    background-color: #f0f0f0;
  }

  .navbar-inner {
    min-width: 100%;
    height: $navbar-height;

    display: inline-block;

    white-space: nowrap;

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
          background-color: lighten($default-color, 10%);
        }
      }
    }
  }
}
</style>

<template>
  <div class="navbar-container">
    <div class="navbar-inner">
      <slot></slot>
    </div>
  </div>
</template>
