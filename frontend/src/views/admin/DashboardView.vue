<template>
  <div class="layout">
    <AppNavbar />
    <div class="layout-content">
      <AppSidebar />
      <main class="main-content">
        <div class="container">
          <h1>Dashboard</h1>
          <p>Bienvenido al panel de administración.</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import AppNavbar from '../../components/AppNavbar.vue';
import AppSidebar from '../../components/AppSidebar.vue';
</script>

<style scoped>
.layout-content {
  display: flex;
}

.main-content {
  flex: 1;
  padding: 30px;
}
</style>
