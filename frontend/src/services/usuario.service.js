import api from './api';

export const getUsuarios = () => {
  return api.get('/usuarios');
};

export const getUsuario = (id) => {
  return api.get(`/usuarios/${id}`);
};

export const createUsuario = (usuario) => {
  return api.post('/usuarios', usuario);
};

export const updateUsuario = (id, usuario) => {
  return api.put(`/usuarios/${id}`, usuario);
};

export const deleteUsuario = (id) => {
  return api.delete(`/usuarios/${id}`);
};
