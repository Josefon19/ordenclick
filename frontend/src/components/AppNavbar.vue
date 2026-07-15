<template>
  <nav class="navbar">
    <div class="navbar-content">
      <h1 class="navbar-title">OrdenClick</h1>
      <div class="navbar-user">
        <span>{{ nombreUsuario }}</span>
        <button class="logout-btn" @click="logout">Cerrar Sesión</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/auth.store';

const authStore = useAuthStore();
const { nombreUsuario, logout } = authStore;
</script>

<style scoped>
.navbar {
  background-color: var(--color-navbar);
  color: var(--color-navbar-text);
  padding: 15px 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.navbar-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-title {
  color: var(--color-primary);
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logout-btn {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: var(--color-primary-hover);
}
</style>
