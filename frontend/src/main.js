import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { OhVueIcon, addIcons } from 'oh-vue-icons';
import {
  MdRestaurant, MdVisibility, MdVisibilityoff, MdWarning,
  MdRefresh, MdAccesstime, MdNotes, MdPerson, MdDone
} from 'oh-vue-icons/icons/md';
import { FaMoneyBillWaveAlt } from 'oh-vue-icons/icons/fa';
import { BiCreditCard } from 'oh-vue-icons/icons/bi';
import App from './App.vue';
import router from './router';
import './assets/main.css';

// Agregar íconos
addIcons(
  MdRestaurant, MdVisibility, MdVisibilityoff, MdWarning,
  MdRefresh, MdAccesstime, MdNotes, MdPerson, MdDone, FaMoneyBillWaveAlt, BiCreditCard
);

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.component('v-icon', OhVueIcon);
app.mount('#app');
