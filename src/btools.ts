import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import axios from 'axios';

import '@styles/global';

import '@/scripts/viv';

Vue.config.productionTip = false;

Vue.chrome = Vue.prototype.$chrome = chrome || browser;
Vue.use(VueRouter);
Vue.use(Vuex);
