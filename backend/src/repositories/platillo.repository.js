// Repositorio de Platillo (Capa de acceso a datos)
const { Platillo, Categoria } = require('../models');

const platilloRepository = {
  listarTodos: async () => {
    return await Platillo.findAll({
      include: [{ model: Categoria, as: 'categoria' }]
    });
  },

  buscarPorId: async (id) => {
    return await Platillo.findByPk(id, {
      include: [{ model: Categoria, as: 'categoria' }]
    });
  },

  crear: async (platilloData) => {
    return await Platillo.create(platilloData);
  },

  actualizar: async (id, platilloData) => {
    const platillo = await Platillo.findByPk(id);
    if (!platillo) return null;
    return await platillo.update(platilloData);
  },

  desactivar: async (id) => {
    const platillo = await Platillo.findByPk(id);
    if (!platillo) return null;
    return await platillo.update({ disponible: false });
  }
};

module.exports = platilloRepository;
