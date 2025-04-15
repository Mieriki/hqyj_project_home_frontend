import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import router from '@/router'
import { createPinia } from 'pinia'
import axios from "axios";
import ElementPlus from 'element-plus';

import { getMenuRouter } from '@/net'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import 'element-plus/theme-chalk/dark/css-vars.css'

import Mondai from "./components/MondaiCard.vue";

axios.defaults.baseURL = 'http://192.168.189.209:8000/mugen/api'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.component('Mondai', Mondai)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')


