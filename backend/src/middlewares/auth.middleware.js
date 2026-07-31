// Capa de middleware — Verificación de token JWT
// Valida firma Y existencia en tabla sesiones

const jwt = require('jsonwebtoken')
const { Sesion } = require('../models')

const verificarToken = async (req, res, next) => {
  try {
    // 1. Leer el header Authorization
    const authHeader = req.headers['authorization']
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Acceso denegado. Token no proporcionado.'
      })
    }

    const token = authHeader.split(' ')[1]

    // 2. Verificar firma y expiración del JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 3. Verificar que el token existe en la tabla sesiones
    // Si se hizo logout, ya no existirá aunque la firma sea válida
    const sesion = await Sesion.findOne({
      where: {
        usuario_id: decoded.id,
        token_hash: token
      }
    })

    if (!sesion) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Sesión inválida. Por favor inicia sesión nuevamente.'
      })
    }

    // 4. Verificar que la sesión no haya expirado en BD
    if (new Date() > new Date(sesion.expires_at)) {
      // Limpiar sesión expirada
      await sesion.destroy()
      return res.status(401).json({
        ok: false,
        mensaje: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.'
      })
    }

    // 5. Adjuntar datos del usuario y token a la request
    req.usuario = decoded // { id, nombre, rol }
    req.token = token

    next()
  } catch (error) {
    return res.status(401).json({
      ok: false,
      mensaje: 'Token inválido o expirado. Inicia sesión nuevamente.'
    })
  }
}

module.exports = { verificarToken }