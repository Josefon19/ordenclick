// Capa 1 — Rutas de autenticación
// Solo expone un endpoint público: POST /api/auth/login
// Todos los demás endpoints del sistema requieren token

const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// POST /api/auth/login → autenticar usuario y devolver token JWT
router.post('/login', authController.login);

// POST /api/auth/logout → invalidar token en tabla sesiones
// Requiere estar autenticado
router.post('/logout', verificarToken, authController.logout);

module.exports = router;
