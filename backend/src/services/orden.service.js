// Servicio de Orden (Capa de lógica de negocio)
const ordenRepository = require('../repositories/orden.repository');
const ordenDetalleRepository = require('../repositories/ordenDetalle.repository');
const { sequelize } = require('../config/database');

const ordenService = {
  listarTodos: async () => {
    return await ordenRepository.listarTodos();
  },

  buscarPorId: async (id) => {
    return await ordenRepository.buscarPorId(id);
  },

  crear: async (ordenData, detalles) => {
    const transaction = await sequelize.transaction();
    try {
      const total = detalles.reduce((sum, det) => sum + (det.precio_unitario * det.cantidad), 0);
      const orden = await ordenRepository.crear({ ...ordenData, total }, transaction);

      for (const detalle of detalles) {
        const subtotal = detalle.precio_unitario * detalle.cantidad;
        await ordenDetalleRepository.crear({
          ...detalle,
          orden_id: orden.id,
          subtotal
        }, transaction);
      }

      await transaction.commit();
      return await ordenRepository.buscarPorId(orden.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  actualizar: async (id, ordenData) => {
    return await ordenRepository.actualizar(id, ordenData);
  },

  actualizarDetalle: async (id, detalleData) => {
    return await ordenDetalleRepository.actualizar(id, detalleData);
  }
};

module.exports = ordenService;
