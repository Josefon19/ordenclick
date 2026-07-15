// Servicio de Usuario (Capa de lógica de negocio)
const bcrypt = require('bcrypt');
const usuarioRepository = require('../repositories/usuario.repository');

const usuarioService = {
  listarTodos: async () => {
    return await usuarioRepository.listarTodos();
  },

  buscarPorId: async (id) => {
    return await usuarioRepository.buscarPorId(id);
  },

  crear: async (usuarioData) => {
    const existeUsuario = await usuarioRepository.buscarPorCorreo(usuarioData.correo);
    if (existeUsuario) {
      throw new Error('El correo ya está registrado.');
    }

    const passwordHash = await bcrypt.hash(usuarioData.password, 10);
    const usuario = await usuarioRepository.crear({
      ...usuarioData,
      password_hash: passwordHash
    });

    // Eliminar el password_hash de la respuesta
    const { password_hash, ...usuarioSinPassword } = usuario.toJSON();
    return usuarioSinPassword;
  },

  actualizar: async (id, usuarioData) => {
    if (usuarioData.password) {
      usuarioData.password_hash = await bcrypt.hash(usuarioData.password, 10);
      delete usuarioData.password;
    }
    return await usuarioRepository.actualizar(id, usuarioData);
  },

  desactivar: async (id) => {
    return await usuarioRepository.desactivar(id);
  }
};

module.exports = usuarioService;
