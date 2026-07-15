// Rutas de Reporte (Capa de presentación)
const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporte.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { verificarRol } = require('../middlewares/role.middleware');

router.get('/ventas', verificarToken, verificarRol('administrador'), reporteController.getReporteVentas);

module.exports = router;
