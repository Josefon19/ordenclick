// Servicio de Reporte (Capa de lógica de negocio)
const { Orden, OrdenDetalle, Platillo, Usuario, Mesa } = require('../models');
const { Op } = require('sequelize');

const reporteService = {
  obtenerReporteVentas: async (fechaInicio, fechaFin) => {
    const where = {};
    if (fechaInicio && fechaFin) {
      where.createdAt = {
        [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
      };
    }
    where.estado = 'finalizado';

    return await Orden.findAll({
      where,
      include: [
        { model: Mesa, as: 'mesa' },
        { model: Usuario, as: 'mesero' },
        { model: OrdenDetalle, as: 'detalles', include: [{ model: Platillo, as: 'platillo' }] }
      ],
      order: [['created_at', 'DESC']]
    });
  }
};

module.exports = reporteService;
