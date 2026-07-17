// Capa 3 — Acceso a datos de platillos

const { Platillo, Categoria } = require('../models');

const platilloRepository = {

  listarTodos: async (soloDisponibles) => {
    const where = soloDisponibles ? { disponible: true } : {};
    return await Platillo.findAll({
      where,
      include: [{
        model: Categoria,
        as: 'categoria',
        attributes: ['id', 'nombre']
      }],
      order: [['categoria_id', 'ASC'], ['nombre', 'ASC']]
    });
  },

  buscarPorId: async (id) => {
    return await Platillo.findByPk(id, {
      include: [{
        model: Categoria,
        as: 'categoria',
        attributes: ['id', 'nombre']
      }]
    });
  },

  crear: async (datos) => {
    return await Platillo.create(datos);
  },

  actualizar: async (id, datos) => {
    return await Platillo.update(datos, { where: { id } });
  }
};

module.exports = platilloRepository;
