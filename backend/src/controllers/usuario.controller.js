// Controlador de Usuario (Capa de presentación)
const usuarioService = require('../services/usuario.service');

const usuarioController = {
  findAll: async (req, res) => {
    try {
      const usuarios = await usuarioService.listarTodos();
      res.json({
        ok: true,
        data: usuarios
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener usuarios.'
      });
    }
  },

  findById: async (req, res) => {
    try {
      const usuario = await usuarioService.buscarPorId(req.params.id);
      if (!usuario) return res.status(404).json({
        ok: false,
        mensaje: 'Usuario no encontrado.'
      });
      res.json({
        ok: true,
        data: usuario
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener usuario.'
      });
    }
  },

  create: async (req, res) => {
    try {
      const usuario = await usuarioService.crear(req.body);
      res.status(201).json({
        ok: true,
        mensaje: 'Usuario creado exitosamente.',
        data: usuario
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        mensaje: error.message || 'Error al crear usuario.'
      });
    }
  },

  update: async (req, res) => {
    try {
      const usuario = await usuarioService.actualizar(req.params.id, req.body);
      if (!usuario) return res.status(404).json({
        ok: false,
        mensaje: 'Usuario no encontrado.'
      });
      res.json({
        ok: true,
        mensaje: 'Usuario actualizado exitosamente.',
        data: usuario
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        mensaje: 'Error al actualizar usuario.'
      });
    }
  },

  delete: async (req, res) => {
    try {
      await usuarioService.desactivar(req.params.id);
      res.json({
        ok: true,
        mensaje: 'Usuario desactivado correctamente.'
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        mensaje: 'Error al desactivar usuario.'
      });
    }
  }
};

module.exports = usuarioController;
