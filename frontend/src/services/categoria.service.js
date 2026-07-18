import api from './api';

const categoriaService = {
  listar: () => api.get('/categorias')
};

export default categoriaService;
