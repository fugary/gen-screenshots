import { createApp } from 'vue';
import App from './App.vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import './assets/styles/main.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import store from './store';
import i18n from './i18n';

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(store);
app.use(i18n);
app.use(ElementPlus);
app.mount('#app');
