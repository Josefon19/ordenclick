// Repositorio de OrdenDetalle (Capa de acceso a datos)
const { OrdenDetalle, Platillo } = require('../models');

const ordenDetalleRepository = {
  buscarPorOrdenId: async (ordenId) => {
    return await OrdenDetalle.findAll({
      where: { orden_id: ordenId },
      include: [{ model: Platillo, as: 'platillo' }]
    });
  },

  crear: async (detalleData, transaction) => {
    return await OrdenDetalle.create(detalleData, { transaction });
  },

  actualizar: async (id, detalleData) => {
    const detalle = await OrdenDetalle.findByPk(id);
    if (!detalle) return null;
    return await detalle.update(detalleData);
  }
};

module.exports = ordenDetalleRepository;
