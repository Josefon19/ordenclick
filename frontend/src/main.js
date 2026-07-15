import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { OhVueIcon, addIcons } from 'oh-vue-icons';
import {
  MdRestaurant, MdVisibility, MdVisibilityoff, MdWarning
} from 'oh-vue-icons/icons/md';
import App from './App.vue';
import router from './router';
import './assets/main.css';

// Agregar íconos
addIcons(
  MdRestaurant, MdVisibility, MdVisibilityoff, MdWarning
);

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.component('v-icon', OhVueIcon);
app.mount('#app');
