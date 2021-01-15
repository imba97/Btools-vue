declare module "@components/*" {
  import Vue from "vue";
  export default Vue;
}

declare module "*.vue$" {
  import Vue from "vue";
  export default Vue;
}