// Controlador de Reporte (Capa de presentación)
const reporteService = require('../services/reporte.service');

const reporteController = {
  getReporteVentas: async (req, res) => {
    try {
      const { fechaInicio, fechaFin } = req.query;
      const reporte = await reporteService.obtenerReporteVentas(fechaInicio, fechaFin);
      res.json({
        ok: true,
        data: reporte
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener reporte de ventas.'
      });
    }
  }
};

module.exports = reporteController;
