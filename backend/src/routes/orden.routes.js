const router = require('express').Router();
const ordenController = require('../controllers/orden.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { verificarRol } = require('../middlewares/role.middleware');

router.use(verificarToken);

// Mesero: crear y gestionar sus órdenes
router.get('/', verificarRol('administrador', 'mesero'), ordenController.listar);
router.get('/cocina/activas', verificarRol('cocina', 'administrador'), ordenController.listarActivas);
router.get('/:id', verificarRol('administrador', 'mesero', 'cocina'), ordenController.obtener);
router.post('/', verificarRol('mesero'), ordenController.crear);
router.patch('/:id/estado', verificarRol('mesero', 'cocina'), ordenController.actualizarEstado);
router.patch('/:id/pagar', verificarRol('mesero'), ordenController.pagar);

module.exports = router;
