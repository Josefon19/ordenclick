// Capa 2 — Lógica de negocio de usuarios
// Validaciones profundas y reglas del sistema

const bcrypt = require('bcrypt');
const usuarioRepository = require('../repositories/usuario.repository');

const usuarioService = {

  listarTodos: async () => {
    return await usuarioRepository.listarTodos();
  },

  obtenerPorId: async (id) => {
    const usuario = await usuarioRepository.buscarPorId(id);
    if (!usuario) throw new Error('Usuario no encontrado.');
    return usuario;
  },

  crear: async ({ nombre_completo, correo, password, rol }) => {
    // Verificar que el correo no esté registrado
    const existe = await usuarioRepository.buscarPorCorreo(correo);
    if (existe) throw new Error('Ya existe un usuario con ese correo.');

    // Validar rol permitido
    const rolesValidos = ['administrador', 'mesero', 'cocina'];
    if (!rolesValidos.includes(rol)) throw new Error('Rol no válido.');

    // Hashear contraseña antes de guardar
    const password_hash = await bcrypt.hash(password, 10);

    const nuevo = await usuarioRepository.crear({
      nombre_completo,
      correo,
      password_hash,
      rol,
      activo: true
    });

    // Nunca devolver el hash
    const { password_hash: _, ...usuarioSinHash } = nuevo.toJSON();
    return usuarioSinHash;
  },

  actualizar: async (id, datos) => {
    const usuario = await usuarioRepository.buscarPorId(id);
    if (!usuario) throw new Error('Usuario no encontrado.');

    // Si cambió el correo verificar que no esté en uso
    if (datos.correo && datos.correo !== usuario.correo) {
      const existe = await usuarioRepository.buscarPorCorreo(datos.correo);
      if (existe) throw new Error('Ese correo ya está en uso.');
    }

    await usuarioRepository.actualizar(id, datos);
  },

  desactivar: async (id) => {
    const usuario = await usuarioRepository.buscarPorId(id);
    if (!usuario) throw new Error('Usuario no encontrado.');
    await usuarioRepository.desactivar(id);
  }
};

module.exports = usuarioService;
