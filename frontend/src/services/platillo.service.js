import api from './api';

export const getPlatillos = () => {
  return api.get('/platillos');
};

export const getPlatillo = (id) => {
  return api.get(`/platillos/${id}`);
};

export const createPlatillo = (platillo) => {
  return api.post('/platillos', platillo);
};

export const updatePlatillo = (id, platillo) => {
  return api.put(`/platillos/${id}`, platillo);
};

export const deletePlatillo = (id) => {
  return api.delete(`/platillos/${id}`);
};
