const router = require('express').Router();
const reporteController = require('../controllers/reporte.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { verificarRol } = require('../middlewares/role.middleware');

router.use(verificarToken);
router.use(verificarRol('administrador'));

// Métricas del día actual
router.get('/hoy', reporteController.resumenHoy);

// Top 3 platillos más pedidos hoy
router.get('/top-platillos', reporteController.topPlatillos);

// Historial filtrable por día, mes o año
router.get('/historial', reporteController.historial);

// Buscador de órdenes
router.get('/buscar', reporteController.buscar);

module.exports = router;
