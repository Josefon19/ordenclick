<template>
  <span class="badge" :class="estado">{{ texto }}</span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps(['estado']);

const texto = computed(() => {
  const textos = {
    pendiente: 'Pendiente',
    en_preparacion: 'En Preparación',
    listo: 'Listo',
    finalizado: 'Finalizado'
  };
  return textos[props.estado] || props.estado;
});
</script>

<style scoped>
.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.badge.pendiente {
  background-color: var(--color-pendiente);
}

.badge.en_preparacion {
  background-color: var(--color-en_preparacion);
}

.badge.listo {
  background-color: var(--color-listo);
}

.badge.finalizado {
  background-color: var(--color-finalizado);
}
</style>
