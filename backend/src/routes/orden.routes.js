// Rutas de Orden (Capa de presentación)
const express = require('express');
const router = express.Router();
const ordenController = require('../controllers/orden.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.use(verificarToken);

router.get('/', ordenController.findAll);
router.get('/:id', ordenController.findById);
router.post('/', ordenController.create);
router.put('/:id', ordenController.update);
router.put('/detalles/:id', ordenController.updateDetalle);

module.exports = router;
