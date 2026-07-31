// Capa 3 — Acceso a datos de detalles de órdenes
const { OrdenDetalle } = require('../models');

const ordenDetalleRepository = {

  crearMultiples: async (detalles) => {
    return await OrdenDetalle.bulkCreate(detalles);
  },

  listarPorOrden: async (orden_id) => {
    return await OrdenDetalle.findAll({ where: { orden_id } });
  }
};

module.exports = ordenDetalleRepository;
