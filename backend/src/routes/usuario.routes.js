// Rutas de Usuario (Capa de presentación)
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { verificarRol } = require('../middlewares/role.middleware');

router.use(verificarToken);
router.use(verificarRol('administrador'));

router.get('/', usuarioController.findAll);
router.get('/:id', usuarioController.findById);
router.post('/', usuarioController.create);
router.put('/:id', usuarioController.update);
router.delete('/:id', usuarioController.delete);

module.exports = router;
