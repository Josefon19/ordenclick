// Repositorio de Orden (Capa de acceso a datos)
const { Orden, Mesa, Usuario, OrdenDetalle, Platillo } = require('../models');

const ordenRepository = {
  listarTodos: async () => {
    return await Orden.findAll({
      include: [
        { model: Mesa, as: 'mesa' },
        { model: Usuario, as: 'mesero' },
        { model: OrdenDetalle, as: 'detalles', include: [{ model: Platillo, as: 'platillo' }] }
      ],
      order: [['created_at', 'DESC']]
    });
  },

  buscarPorId: async (id) => {
    return await Orden.findByPk(id, {
      include: [
        { model: Mesa, as: 'mesa' },
        { model: Usuario, as: 'mesero' },
        { model: OrdenDetalle, as: 'detalles', include: [{ model: Platillo, as: 'platillo' }] }
      ]
    });
  },

  crear: async (ordenData, transaction) => {
    return await Orden.create(ordenData, { transaction });
  },

  actualizar: async (id, ordenData) => {
    const orden = await Orden.findByPk(id);
    if (!orden) return null;
    return await orden.update(ordenData);
  }
};

module.exports = ordenRepository;
