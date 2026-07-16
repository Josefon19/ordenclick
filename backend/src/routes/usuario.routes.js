// Capa 1 — Rutas de usuarios
// Todas protegidas: requieren token + rol administrador

const router = require('express').Router();
const usuarioController = require('../controllers/usuario.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { verificarRol } = require('../middlewares/role.middleware');

// Proteger todas las rutas con token y rol administrador
router.use(verificarToken);
router.use(verificarRol('administrador'));

router.get('/',        usuarioController.listar);    // GET    /api/usuarios
router.get('/:id',     usuarioController.obtener);   // GET    /api/usuarios/:id
router.post('/',       usuarioController.crear);     // POST   /api/usuarios
router.put('/:id',     usuarioController.actualizar);// PUT    /api/usuarios/:id
router.patch('/:id/desactivar', usuarioController.desactivar); // PATCH /api/usuarios/:id/desactivar

module.exports = router;
