// Controlador de Platillo (Capa de presentación)
const platilloService = require('../services/platillo.service');

const platilloController = {
  findAll: async (req, res) => {
    try {
      const platillos = await platilloService.listarTodos();
      res.json({
        ok: true,
        data: platillos
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener platillos.'
      });
    }
  },

  findById: async (req, res) => {
    try {
      const platillo = await platilloService.buscarPorId(req.params.id);
      if (!platillo) return res.status(404).json({
        ok: false,
        mensaje: 'Platillo no encontrado.'
      });
      res.json({
        ok: true,
        data: platillo
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener platillo.'
      });
    }
  },

  create: async (req, res) => {
    try {
      const platillo = await platilloService.crear(req.body);
      res.status(201).json({
        ok: true,
        mensaje: 'Platillo creado exitosamente.',
        data: platillo
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        mensaje: 'Error al crear platillo.'
      });
    }
  },

  update: async (req, res) => {
    try {
      const platillo = await platilloService.actualizar(req.params.id, req.body);
      if (!platillo) return res.status(404).json({
        ok: false,
        mensaje: 'Platillo no encontrado.'
      });
      res.json({
        ok: true,
        mensaje: 'Platillo actualizado exitosamente.',
        data: platillo
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        mensaje: 'Error al actualizar platillo.'
      });
    }
  },

  delete: async (req, res) => {
    try {
      await platilloService.desactivar(req.params.id);
      res.json({
        ok: true,
        mensaje: 'Platillo desactivado correctamente.'
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        mensaje: 'Error al desactivar platillo.'
      });
    }
  }
};

module.exports = platilloController;
