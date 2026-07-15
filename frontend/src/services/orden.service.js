import api from './api';

export const getOrdenes = () => {
  return api.get('/ordenes');
};

export const getOrden = (id) => {
  return api.get(`/ordenes/${id}`);
};

export const createOrden = (orden, detalles) => {
  return api.post('/ordenes', { orden, detalles });
};

export const updateOrden = (id, orden) => {
  return api.put(`/ordenes/${id}`, orden);
};

export const updateDetalle = (id, detalle) => {
  return api.put(`/ordenes/detalles/${id}`, detalle);
};
