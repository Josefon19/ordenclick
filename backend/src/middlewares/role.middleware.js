// Middleware de control de acceso por rol
// Se usa después de verificarToken en las rutas que lo requieran
// Uso: verificarRol('administrador') o verificarRol('administrador', 'mesero')

const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        ok: false,
        mensaje: 'No autenticado.'
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        ok: false,
        mensaje: 'No tienes permisos para acceder a este recurso.'
      });
    }

    next();
  };
};

module.exports = { verificarRol };
