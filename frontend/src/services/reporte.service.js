import api from './api';

const reporteService = {
  resumenHoy: () => api.get('/reportes/hoy'),
  topPlatillos: () => api.get('/reportes/top-platillos'),
  historial: (tipo, valor) =>
    api.get('/reportes/historial', { params: { tipo, valor } }),
  buscar: (q) => api.get('/reportes/buscar', { params: { q } })
};

export default reporteService;
