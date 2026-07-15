import api from './api';

export const getReporteVentas = (fechaInicio, fechaFin) => {
  return api.get('/reportes/ventas', { params: { fechaInicio, fechaFin } });
};
