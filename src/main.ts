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

axios.defaults.baseURL = 'http://localhost:8000/mugen/api'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')


