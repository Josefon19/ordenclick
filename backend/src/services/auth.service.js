// Capa 2 — Lógica de negocio de autenticación
// Aquí viven las reglas: validar credenciales, generar token, registrar sesión

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuario.repository');
const { Sesion } = require('../models');

const authService = {

  login: async (correo, password) => {

    // 1. Buscar usuario por correo
    const usuario = await usuarioRepository.buscarPorCorreo(correo);
    if (!usuario) {
      throw new Error('Correo o contraseña incorrectos.');
    }

    // 2. Verificar que la cuenta esté activa
    if (!usuario.activo) {
      throw new Error('Tu cuenta está desactivada. Contacta al administrador.');
    }

    // 3. Comparar contraseña con el hash almacenado
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      throw new Error('Correo o contraseña incorrectos.');
    }

    // 4. Generar token JWT con datos mínimos del usuario
    const payload = {
      id: usuario.id,
      nombre: usuario.nombre_completo,
      rol: usuario.rol
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN // 8h
    });

    // 5. Registrar sesión en la tabla sesiones
    const expiracion = new Date();
    expiracion.setHours(expiracion.getHours() + 8);

    await Sesion.create({
      usuario_id: usuario.id,
      token_hash: token,
      expires_at: expiracion
    });

    // 6. Devolver token y datos básicos del usuario (nunca el password_hash)
    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre_completo,
        rol: usuario.rol
      }
    };
  },

  logout: async (usuarioId, token) => {
    // Eliminar la sesión activa de la tabla sesiones
    await Sesion.destroy({
      where: {
        usuario_id: usuarioId,
        token_hash: token
      }
    });
  }
};

module.exports = authService;
