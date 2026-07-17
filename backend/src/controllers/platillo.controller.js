// Capa 1 — Controlador de platillos

const platilloService = require('../services/platillo.service');

const platilloController = {

  listar: async (req, res) => {
    try {
      const soloDisponibles = req.query.soloDisponibles === 'true';
      const platillos = await platilloService.listarTodos(soloDisponibles);
      return res.status(200).json({ ok: true, data: platillos });
    } catch (error) {
      return res.status(500).json({ ok: false, mensaje: error.message });
    }
  },

  obtener: async (req, res) => {
    try {
      const platillo = await platilloService.obtenerPorId(req.params.id);
      return res.status(200).json({ ok: true, data: platillo });
    } catch (error) {
      return res.status(404).json({ ok: false, mensaje: error.message });
    }
  },

  crear: async (req, res) => {
    try {
      const { nombre, descripcion, precio, categoria_id, disponible } = req.body;
      if (!nombre || !precio || !categoria_id) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Nombre, precio y categoria son obligatorios.'
        });
      }
      const nuevo = await platilloService.crear({
        nombre, descripcion, precio, categoria_id, disponible
      });
      return res.status(201).json({
        ok: true,
        mensaje: 'Platillo creado correctamente.',
        data: nuevo
      });
    } catch (error) {
      return res.status(400).json({ ok: false, mensaje: error.message });
    }
  },

  actualizar: async (req, res) => {
    try {
      const { nombre, descripcion, precio, categoria_id } = req.body;
      await platilloService.actualizar(req.params.id, {
        nombre, descripcion, precio, categoria_id
      });
      return res.status(200).json({
        ok: true,
        mensaje: 'Platillo actualizado correctamente.'
      });
    } catch (error) {
      return res.status(400).json({ ok: false, mensaje: error.message });
    }
  },

  toggleDisponibilidad: async (req, res) => {
    try {
      const platillo = await platilloService.toggleDisponibilidad(req.params.id);
      return res.status(200).json({
        ok: true,
        mensaje: `Platillo ${platillo.disponible ? 'activado' : 'desactivado'} correctamente.`,
        data: platillo
      });
    } catch (error) {
      return res.status(400).json({ ok: false, mensaje: error.message });
    }
  }
};

module.exports = platilloController;
