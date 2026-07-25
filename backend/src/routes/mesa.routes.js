const router = require('express').Router();
const { Mesa } = require('../models');
const { verificarToken } = require('../middlewares/auth.middleware');
const { verificarRol } = require('../middlewares/role.middleware');

router.use(verificarToken);

router.get('/', verificarRol('administrador', 'mesero'), async (req, res) => {
  try {
    const mesas = await Mesa.findAll({
      where: { activo: true },
      order: [['numero', 'ASC']]
    });
    return res.status(200).json({ ok: true, data: mesas });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: error.message });
  }
});

module.exports = router;
