import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getOrdenes, createOrden, updateOrden, updateDetalle } from '../services/orden.service';

export const useOrdenStore = defineStore('orden', () => {
  const ordenes = ref([]);
  const ordenActual = ref(null);

  const fetchOrdenes = async () => {
    const response = await getOrdenes();
    ordenes.value = response.data;
  };

  const fetchOrden = async (id) => {
    const response = await getOrden(id);
    ordenActual.value = response.data;
  };

  const addOrden = async (orden, detalles) => {
    const response = await createOrden(orden, detalles);
    ordenes.value.unshift(response.data);
  };

  const editOrden = async (id, orden) => {
    const response = await updateOrden(id, orden);
    const index = ordenes.value.findIndex(o => o.id === id);
    if (index !== -1) {
      ordenes.value[index] = response.data;
    }
  };

  const editDetalle = async (id, detalle) => {
    await updateDetalle(id, detalle);
    await fetchOrdenes();
  };

  return {
    ordenes,
    ordenActual,
    fetchOrdenes,
    fetchOrden,
    addOrden,
    editOrden,
    editDetalle
  };
});
