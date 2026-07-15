<template>
  <aside class="sidebar">
    <ul class="sidebar-menu">
      <li v-for="item in menuItems" :key="item.path">
        <router-link :to="item.path" active-class="active">
          {{ item.label }}
        </router-link>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth.store';

const authStore = useAuthStore();

const menuItems = computed(() => {
  const rol = authStore.rolUsuario;
  const menus = {
    administrador: [
      { path: '/admin/dashboard', label: 'Dashboard' },
      { path: '/admin/usuarios', label: 'Usuarios' },
      { path: '/admin/platillos', label: 'Platillos' }
    ],
    mesero: [
      { path: '/mesero/ordenes', label: 'Órdenes' }
    ],
    cocina: [
      { path: '/cocina', label: 'Cocina' }
    ]
  };
  return menus[rol] || [];
});
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: var(--color-card);
  min-height: calc(100vh - 70px);
  border-right: 1px solid var(--color-border);
  padding: 20px 0;
}

.sidebar-menu {
  list-style: none;
}

.sidebar-menu li {
  margin-bottom: 5px;
}

.sidebar-menu a {
  display: block;
  padding: 12px 25px;
  color: var(--color-text-primary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
}

.sidebar-menu a:hover,
.sidebar-menu a.active {
  background-color: var(--color-primary);
  color: white;
}
</style>
