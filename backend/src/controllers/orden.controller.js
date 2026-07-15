// Controlador de Orden (Capa de presentación)
const ordenService = require('../services/orden.service');

const ordenController = {
  findAll: async (req, res) => {
    try {
      const ordenes = await ordenService.listarTodos();
      res.json({
        ok: true,
        data: ordenes
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener órdenes.'
      });
    }
  },

  findById: async (req, res) => {
    try {
      const orden = await ordenService.buscarPorId(req.params.id);
      if (!orden) return res.status(404).json({
        ok: false,
        mensaje: 'Orden no encontrada.'
      });
      res.json({
        ok: true,
        data: orden
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener orden.'
      });
    }
  },

  create: async (req, res) => {
    try {
      const { orden, detalles } = req.body;
      const nuevaOrden = await ordenService.crear(orden, detalles);
      res.status(201).json({
        ok: true,
        mensaje: 'Orden creada exitosamente.',
        data: nuevaOrden
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        mensaje: 'Error al crear orden.'
      });
    }
  },

  update: async (req, res) => {
    try {
      const orden = await ordenService.actualizar(req.params.id, req.body);
      if (!orden) return res.status(404).json({
        ok: false,
        mensaje: 'Orden no encontrada.'
      });
      res.json({
        ok: true,
        mensaje: 'Orden actualizada exitosamente.',
        data: orden
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        mensaje: 'Error al actualizar orden.'
      });
    }
  },

  updateDetalle: async (req, res) => {
    try {
      const detalle = await ordenService.actualizarDetalle(req.params.id, req.body);
      if (!detalle) return res.status(404).json({
        ok: false,
        mensaje: 'Detalle no encontrado.'
      });
      res.json({
        ok: true,
        mensaje: 'Detalle actualizado exitosamente.',
        data: detalle
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        mensaje: 'Error al actualizar detalle.'
      });
    }
  }
};

module.exports = ordenController;
