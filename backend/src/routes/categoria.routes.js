// Ruta para obtener categorias activas (usada en formularios)

const router = require('express').Router();
const { Categoria } = require('../models');
const { verificarToken } = require('../middlewares/auth.middleware');

router.use(verificarToken);

router.get('/', async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      where: { activo: true },
      order: [['nombre', 'ASC']]
    });
    return res.status(200).json({ ok: true, data: categorias });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: error.message });
  }
});

module.exports = router;
