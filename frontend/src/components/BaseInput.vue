<template>
  <div class="form-group">
    <label v-if="label" :for="id">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      class="base-input"
    />
  </div>
</template>

<script setup>
defineProps(['id', 'label', 'type', 'modelValue', 'placeholder']);
defineEmits(['update:modelValue']);
</script>

<style scoped>
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.base-input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.base-input:focus {
  outline: none;
  border-color: var(--color-primary);
}
</style>
