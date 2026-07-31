// Capa 2 — Lógica de negocio de órdenes
// Define transiciones válidas de estado por rol

const ordenRepository = require('../repositories/orden.repository');
const ordenDetalleRepository = require('../repositories/ordenDetalle.repository');
const platilloRepository = require('../repositories/platillo.repository');
const { sequelize } = require('../config/database');

const transicionesValidas = {
  mesero: {
    pendiente: ['cancelada'],
    listo: ['entregada'],
    entregada: ['pagada']
  },
  cocina: {
    pendiente: ['en_preparacion'],
    en_preparacion: ['listo']
  },
  administrador: {
    pendiente: ['en_preparacion', 'cancelada'],
    en_preparacion: ['listo'],
    listo: ['entregada'],
    entregada: ['pagada']
  }
};

const ordenService = {

  listar: async (meseroId) => {
    return await ordenRepository.listar(meseroId);
  },

  listarActivas: async () => {
    return await ordenRepository.listarPorEstados(['pendiente', 'en_preparacion']);
  },

  obtenerPorId: async (id) => {
    const orden = await ordenRepository.buscarPorId(id);
    if (!orden) throw new Error('Orden no encontrada.');
    return orden;
  },

  crear: async ({ mesa_id, mesero_id, items, notas_generales }) => {
    const transaction = await sequelize.transaction();

    try {
      let total = 0;
      const detalles = [];

      for (const item of items) {
        const platillo = await platilloRepository.buscarPorId(item.platillo_id);
        if (!platillo) throw new Error(`Platillo ${item.platillo_id} no encontrado.`);
        if (!platillo.disponible) throw new Error(`"${platillo.nombre}" no está disponible.`);
        if (!item.cantidad || item.cantidad < 1) throw new Error('La cantidad debe ser mayor a 0.');

        const subtotal = Number(platillo.precio) * item.cantidad;
        total += subtotal;

        detalles.push({
          platillo_id: item.platillo_id,
          cantidad: item.cantidad,
          precio_unitario: platillo.precio,
          subtotal,
          notas: item.notas || null,
          estado: 'pendiente'
        });
      }

      const orden = await ordenRepository.crear({
        mesa_id,
        mesero_id,
        estado: 'pendiente',
        total,
        notas_generales: notas_generales || null
      }, transaction);

      await ordenDetalleRepository.crearMultiples(
        detalles.map((d) => ({ ...d, orden_id: orden.id })),
        transaction
      );

      await transaction.commit();
      return await ordenRepository.buscarPorId(orden.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    const orden = await ordenRepository.crear({
      mesa_id,
      mesero_id,
      estado: 'pendiente',
      total,
      notas_generales: notas_generales || null
    });

    await ordenDetalleRepository.crearMultiples(
      detalles.map((detalle) => ({ ...detalle, orden_id: orden.id }))
    );

    return ordenRepository.buscarPorId(orden.id);
  },

  actualizarEstado: async (id, nuevoEstado, rol) => {
    const orden = await ordenRepository.buscarPorId(id);
    if (!orden) throw new Error('Orden no encontrada.');
    if (nuevoEstado === 'pagada') {
      throw new Error('Para pagar una orden debes usar el endpoint de pago.');
    }

    const permitidos = transicionesValidas[rol]?.[orden.estado] || [];
    if (!permitidos.includes(nuevoEstado)) {
      throw new Error(`No puedes cambiar de "${orden.estado}" a "${nuevoEstado}".`);
    }

    await ordenRepository.actualizarEstado(id, nuevoEstado);
  },

  pagar: async (id, metodo_pago) => {
    const orden = await ordenRepository.buscarPorId(id);
    if (!orden) throw new Error('Orden no encontrada.');
    if (orden.estado !== 'entregada') {
      throw new Error('Solo se pueden pagar órdenes en estado "Entregada".');
    }
    if (!['efectivo', 'tarjeta'].includes(metodo_pago)) {
      throw new Error('Método de pago inválido.');
    }

    await ordenRepository.actualizarEstado(id, 'pagada', metodo_pago);
  }
};

module.exports = ordenService;
