// Capa 3 — Acceso a datos de órdenes
const { Orden, OrdenDetalle, Platillo, Mesa, Usuario } = require('../models');
const { Op } = require('sequelize');

const include = [
  { model: Mesa, as: 'mesa', attributes: ['id', 'numero'] },
  { model: Usuario, as: 'mesero', attributes: ['id', 'nombre_completo'] },
  {
    model: OrdenDetalle,
    as: 'detalles',
    include: [{ model: Platillo, as: 'platillo', attributes: ['id', 'nombre', 'precio'] }]
  }
];

const ordenRepository = {

  listar: async (meseroId) => {
    const where = meseroId ? { mesero_id: meseroId } : {};
    return await Orden.findAll({
      where,
      include,
      order: [['created_at', 'DESC']]
    });
  },

  listarPorEstados: async (estados) => {
    return await Orden.findAll({
      where: { estado: { [Op.in]: estados } },
      include,
      order: [['created_at', 'ASC']]
    });
  },

  buscarPorId: async (id) => {
    return await Orden.findByPk(id, { include });
  },

  crear: async (datos, transaction = null) => {
    const options = transaction ? { transaction } : {};
    return await Orden.create(datos, options);
  },

  actualizarEstado: async (id, estado, metodo_pago = null) => {
    const datos = { estado };
    if (metodo_pago) datos.metodo_pago = metodo_pago;
    return await Orden.update(datos, { where: { id } });
  }
};

module.exports = ordenRepository;
