// Middleware que verifica el token JWT en cada petición protegida
// Se ejecuta antes de llegar al controlador

const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  try {
    // Leer el header Authorization: Bearer <token>
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Acceso denegado. Token no proporcionado.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adjuntar datos del usuario y token a la request
    req.usuario = decoded; // { id, nombre, rol }
    req.token = token;

    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      mensaje: 'Token inválido o expirado. Inicia sesión nuevamente.'
    });
  }
};

module.exports = { verificarToken };
