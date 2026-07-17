const router = require('express').Router();
const platilloController = require('../controllers/platillo.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { verificarRol } = require('../middlewares/role.middleware');

router.use(verificarToken);

// Consultar menu: administrador y mesero
router.get('/', verificarRol('administrador', 'mesero'), platilloController.listar);
router.get('/:id', verificarRol('administrador', 'mesero'), platilloController.obtener);

// Gestion: solo administrador
router.post('/', verificarRol('administrador'), platilloController.crear);
router.put('/:id', verificarRol('administrador'), platilloController.actualizar);
router.patch('/:id/disponibilidad', verificarRol('administrador'), platilloController.toggleDisponibilidad);

module.exports = router;
