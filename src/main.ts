import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import router from '@/router'
import { createPinia } from 'pinia'
import axios from "axios";
import ElementPlus from 'element-plus';

import IconButton from "./components/IconButton.vue";

import { getMenuRouter } from '@/net'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import 'element-plus/theme-chalk/dark/css-vars.css'

axios.defaults.baseURL = 'http://mieriki.net/mugen/api/'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.component('IconButton', IconButton)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')


