// Capa 3 — Acceso a datos de usuarios
// Única capa que habla directamente con la base de datos

const { Usuario } = require('../models');

const usuarioRepository = {

  // Buscar usuario por correo para el login
  buscarPorCorreo: async (correo) => {
    return await Usuario.findOne({
      where: { correo }
    });
  },

  // Buscar usuario por ID
  buscarPorId: async (id) => {
    return await Usuario.findByPk(id, {
      attributes: { exclude: ['password_hash'] } // nunca exponer el hash
    });
  },

  // Listar todos los usuarios (sin password_hash)
  listarTodos: async () => {
    return await Usuario.findAll({
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']]
    });
  },

  // Crear nuevo usuario
  crear: async (datos) => {
    return await Usuario.create(datos);
  },

  // Actualizar usuario por ID
  actualizar: async (id, datos) => {
    return await Usuario.update(datos, { where: { id } });
  },

  // Desactivar cuenta (soft delete)
  desactivar: async (id) => {
    return await Usuario.update({ activo: false }, { where: { id } });
  }
};

module.exports = usuarioRepository;
