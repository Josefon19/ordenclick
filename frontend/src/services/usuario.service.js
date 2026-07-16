// Servicio que consume los endpoints de usuarios

import api from './api';

const usuarioService = {
  listar: () => api.get('/usuarios'),
  obtener: (id) => api.get(`/usuarios/${id}`),
  crear: (datos) => api.post('/usuarios', datos),
  actualizar: (id, datos) => api.put(`/usuarios/${id}`, datos),
  desactivar: (id) => api.patch(`/usuarios/${id}/desactivar`)
};

export default usuarioService;
