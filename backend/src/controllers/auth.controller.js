// Capa 1 — Controlador de autenticación
// Recibe la petición HTTP, delega al service y responde JSON
// No contiene lógica de negocio

const authService = require('../services/auth.service');

const authController = {

  // POST /api/auth/login
  login: async (req, res) => {
    try {
      const { correo, password } = req.body;

      // Validación básica de campos vacíos
      if (!correo || !password) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El correo y la contraseña son obligatorios.'
        });
      }

      // Delegar lógica al service
      const resultado = await authService.login(correo, password);

      return res.status(200).json({
        ok: true,
        mensaje: 'Inicio de sesión exitoso.',
        data: resultado // { token, usuario: { id, nombre, rol } }
      });

    } catch (error) {
      // Errores controlados lanzados desde el service
      return res.status(401).json({
        ok: false,
        mensaje: error.message || 'Credenciales incorrectas.'
      });
    }
  },

  // POST /api/auth/logout
  logout: async (req, res) => {
    try {
      // req.usuario viene del middleware verificarToken
      await authService.logout(req.usuario.id, req.token);
      return res.status(200).json({
        ok: true,
        mensaje: 'Sesión cerrada correctamente.'
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al cerrar sesión.'
      });
    }
  }
};

module.exports = authController;
