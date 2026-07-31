// Capa 1 — Controlador de usuarios
// Recibe HTTP, delega al service, responde JSON

const usuarioService = require('../services/usuario.service');

const usuarioController = {

  // GET /api/usuarios — listar todos
  listar: async (req, res) => {
    try {
      const usuarios = await usuarioService.listarTodos();
      return res.status(200).json({ ok: true, data: usuarios });
    } catch (error) {
      return res.status(500).json({ ok: false, mensaje: error.message });
    }
  },

  // GET /api/usuarios/:id — obtener uno
  obtener: async (req, res) => {
    try {
      const usuario = await usuarioService.obtenerPorId(req.params.id);
      return res.status(200).json({ ok: true, data: usuario });
    } catch (error) {
      return res.status(404).json({ ok: false, mensaje: error.message });
    }
  },

  // POST /api/usuarios — crear nuevo
  crear: async (req, res) => {
    try {
      const { nombre_completo, correo, password, rol } = req.body;

      // Validación de campos obligatorios
      if (!nombre_completo || !correo || !password || !rol) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Todos los campos son obligatorios.'
        });
      }

      const nuevo = await usuarioService.crear({ nombre_completo, correo, password, rol });
      return res.status(201).json({
        ok: true,
        mensaje: 'Usuario creado correctamente.',
        data: nuevo
      });
    } catch (error) {
      return res.status(400).json({ ok: false, mensaje: error.message });
    }
  },

  // PUT /api/usuarios/:id — editar
  actualizar: async (req, res) => {
    try {
      const { nombre_completo, correo, rol } = req.body;
      await usuarioService.actualizar(req.params.id, { nombre_completo, correo, rol });
      return res.status(200).json({
        ok: true,
        mensaje: 'Usuario actualizado correctamente.'
      });
    } catch (error) {
      return res.status(400).json({ ok: false, mensaje: error.message });
    }
  },

  // PATCH /api/usuarios/:id/desactivar — desactivar cuenta
  desactivar: async (req, res) => {
    try {
      await usuarioService.desactivar(req.params.id);
      return res.status(200).json({
        ok: true,
        mensaje: 'Usuario desactivado correctamente.'
      });
    } catch (error) {
      return res.status(400).json({ ok: false, mensaje: error.message });
    }
  },

  // PATCH /api/usuarios/:id/activar — activar cuenta
  activar: async (req, res) => {
    try {
      await usuarioService.activar(req.params.id);
      return res.status(200).json({
        ok: true,
        mensaje: 'Usuario activado correctamente.'
      });
    } catch (error) {
      return res.status(400).json({ ok: false, mensaje: error.message });
    }
  }
};

module.exports = usuarioController;
