// Rutas de Platillo (Capa de presentación)
const express = require('express');
const router = express.Router();
const platilloController = require('../controllers/platillo.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { verificarRol } = require('../middlewares/role.middleware');

router.get('/', verificarToken, platilloController.findAll);
router.get('/:id', verificarToken, platilloController.findById);
router.post('/', verificarToken, verificarRol('administrador'), platilloController.create);
router.put('/:id', verificarToken, verificarRol('administrador'), platilloController.update);
router.delete('/:id', verificarToken, verificarRol('administrador'), platilloController.delete);

module.exports = router;
