// Servicio de Platillo (Capa de lógica de negocio)
const platilloRepository = require('../repositories/platillo.repository');

const platilloService = {
  listarTodos: async () => {
    return await platilloRepository.listarTodos();
  },

  buscarPorId: async (id) => {
    return await platilloRepository.buscarPorId(id);
  },

  crear: async (platilloData) => {
    return await platilloRepository.crear(platilloData);
  },

  actualizar: async (id, platilloData) => {
    return await platilloRepository.actualizar(id, platilloData);
  },

  desactivar: async (id) => {
    return await platilloRepository.desactivar(id);
  }
};

module.exports = platilloService;
