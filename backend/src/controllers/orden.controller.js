// Capa 1 — Controlador de órdenes

const ordenService = require('../services/orden.service');

const ordenController = {

  // GET /api/ordenes — admin ve todas, mesero solo las suyas
  listar: async (req, res) => {
    try {
      const meseroId = req.usuario.rol === 'mesero' ? req.usuario.id : null;
      const ordenes = await ordenService.listar(meseroId);
      return res.status(200).json({ ok: true, data: ordenes });
    } catch (error) {
      return res.status(500).json({ ok: false, mensaje: error.message });
    }
  },

  // GET /api/ordenes/cocina/activas
  listarActivas: async (req, res) => {
    try {
      const ordenes = await ordenService.listarActivas();
      return res.status(200).json({ ok: true, data: ordenes });
    } catch (error) {
      return res.status(500).json({ ok: false, mensaje: error.message });
    }
  },

  // GET /api/ordenes/:id
  obtener: async (req, res) => {
    try {
      const orden = await ordenService.obtenerPorId(req.params.id);
      return res.status(200).json({ ok: true, data: orden });
    } catch (error) {
      return res.status(404).json({ ok: false, mensaje: error.message });
    }
  },

  // POST /api/ordenes — crear nueva orden
  crear: async (req, res) => {
    try {
      const { mesa_id, items, notas_generales } = req.body;
      if (!mesa_id || !items || items.length === 0) {
        return res.status(400).json({
          ok: false,
          mensaje: 'La mesa y al menos un platillo son obligatorios.'
        });
      }
      const orden = await ordenService.crear({
        mesa_id,
        mesero_id: req.usuario.id,
        items,
        notas_generales
      });
      return res.status(201).json({
        ok: true,
        mensaje: 'Orden creada correctamente.',
        data: orden
      });
    } catch (error) {
      return res.status(400).json({ ok: false, mensaje: error.message });
    }
  },

  // PATCH /api/ordenes/:id/estado
  actualizarEstado: async (req, res) => {
    try {
      const { estado } = req.body;
      if (!estado) {
        return res.status(400).json({ ok: false, mensaje: 'El estado es obligatorio.' });
      }
      await ordenService.actualizarEstado(req.params.id, estado, req.usuario.rol);
      return res.status(200).json({ ok: true, mensaje: 'Estado actualizado correctamente.' });
    } catch (error) {
      return res.status(400).json({ ok: false, mensaje: error.message });
    }
  },

  // PATCH /api/ordenes/:id/pagar
  pagar: async (req, res) => {
    try {
      const { metodo_pago } = req.body;
      if (!metodo_pago) {
        return res.status(400).json({ ok: false, mensaje: 'El método de pago es obligatorio.' });
      }
      await ordenService.pagar(req.params.id, metodo_pago);
      return res.status(200).json({ ok: true, mensaje: 'Orden pagada correctamente.' });
    } catch (error) {
      return res.status(400).json({ ok: false, mensaje: error.message });
    }
  }
};

module.exports = ordenController;
