import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import axios from 'axios';

import '@styles/global';

import '@/scripts/viv';

Vue.prototype.$http = axios;
Vue.use(VueRouter);
Vue.use(Vuex);
