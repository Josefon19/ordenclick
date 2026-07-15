<template>
  <div v-if="show" class="alert" :class="type">
    {{ mensaje }}
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps(['mensaje', 'type']);
const show = ref(true);

watch(() => props.mensaje, () => {
  show.value = true;
  setTimeout(() => {
    show.value = false;
  }, 3000);
});
</script>

<style scoped>
.alert {
  padding: 12px 20px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-weight: 500;
}

.alert.error {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.alert.success {
  background-color: #d1fae5;
  color: #059669;
  border: 1px solid #a7f3d0;
}
</style>
