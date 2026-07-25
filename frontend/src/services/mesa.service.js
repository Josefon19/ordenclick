import api from './api';

const mesaService = {
  listar: () => api.get('/mesas')
};

export default mesaService;
