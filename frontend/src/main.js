import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { OhVueIcon, addIcons } from 'oh-vue-icons';
import {
  MdRestaurant, MdVisibility, MdVisibilityoff, MdWarning, 
} from 'oh-vue-icons/icons/md';
import {LaTrophySolid } from 'oh-vue-icons/icons/la';
import { CoSearch } from "oh-vue-icons/icons/co";
import { HiDocumentSearch } from "oh-vue-icons/icons/hi";
import App from './App.vue';
import router from './router';
import './assets/main.css';

// Agregar íconos
addIcons(
  MdRestaurant, MdVisibility, MdVisibilityoff, MdWarning, LaTrophySolid, CoSearch, HiDocumentSearch
);

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.component('v-icon', OhVueIcon);
app.mount('#app');
