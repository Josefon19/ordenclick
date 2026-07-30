const reporteService = require('../services/reporte.service');

const reporteController = {
  // GET /api/reportes/hoy
  resumenHoy: async (req, res) => {
    try {
      const resumen = await reporteService.resumenHoy();
      return res.status(200).json({ ok: true, data: resumen });
    } catch (error) {
      return res.status(500).json({ ok: false, mensaje: error.message });
    }
  },

  // GET /api/reportes/top-platillos
  topPlatillos: async (req, res) => {
    try {
      const top = await reporteService.topPlatillos();
      return res.status(200).json({ ok: true, data: top });
    } catch (error) {
      return res.status(500).json({ ok: false, mensaje: error.message });
    }
  },

  // GET /api/reportes/historial?tipo=dia&valor=2025-01-15
  // GET /api/reportes/historial?tipo=mes&valor=2025-01
  // GET /api/reportes/historial?tipo=anio&valor=2025
  historial: async (req, res) => {
    try {
      const { tipo, valor } = req.query;
      if (!tipo || !valor) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Los parámetros tipo y valor son obligatorios.'
        });
      }
      const data = await reporteService.historial(tipo, valor);
      return res.status(200).json({ ok: true, data });
    } catch (error) {
      return res.status(400).json({ ok: false, mensaje: error.message });
    }
  },

  // GET /api/reportes/buscar?q=termino
  buscar: async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || q.trim().length < 1) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Ingresa un término de búsqueda.'
        });
      }
      const resultados = await reporteService.buscar(q.trim());
      return res.status(200).json({ ok: true, data: resultados });
    } catch (error) {
      return res.status(500).json({ ok: false, mensaje: error.message });
    }
  }
};

module.exports = reporteController;
