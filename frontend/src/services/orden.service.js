import api from './api';

const ordenService = {
  listar: () => api.get('/ordenes'),
  obtener: (id) => api.get(`/ordenes/${id}`),
  crear: (datos) => api.post('/ordenes', datos),
  actualizarEstado: (id, estado) =>
    api.patch(`/ordenes/${id}/estado`, { estado }),
  pagar: (id, metodo_pago) =>
    api.patch(`/ordenes/${id}/pagar`, { metodo_pago }),
  listarActivas: () => api.get('/ordenes/cocina/activas')
};

export default ordenService;
