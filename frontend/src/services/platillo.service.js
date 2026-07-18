import api from './api';

const platilloService = {
  listar: (soloDisponibles = false) =>
    api.get('/platillos', { params: { soloDisponibles } }),
  obtener: (id) => api.get(`/platillos/${id}`),
  crear: (datos) => api.post('/platillos', datos),
  actualizar: (id, datos) => api.put(`/platillos/${id}`, datos),
  toggleDisponibilidad: (id) => api.patch(`/platillos/${id}/disponibilidad`)
};

export default platilloService;
