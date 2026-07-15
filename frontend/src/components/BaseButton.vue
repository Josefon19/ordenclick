<template>
  <button class="base-btn" :class="variant" :disabled="disabled">
    <slot></slot>
  </button>
</template>

<script setup>
defineProps(['variant', 'disabled']);
</script>

<style scoped>
.base-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s;
}

.base-btn.primary {
  background-color: var(--color-primary);
  color: white;
}

.base-btn.primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.base-btn.secondary {
  background-color: var(--color-border);
  color: var(--color-text-primary);
}

.base-btn.secondary:hover:not(:disabled) {
  background-color: #cbd5e1;
}

.base-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
