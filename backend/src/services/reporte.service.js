// Capa 2 — Lógica de reportes y consultas agregadas

const { Op, fn, col, literal } = require('sequelize');
const { Orden, OrdenDetalle, Platillo, Mesa, Usuario } = require('../models');

// Incluir relaciones comunes en consultas de órdenes
const includeOrdenes = [
  { model: Mesa, as: 'mesa', attributes: ['id', 'numero'] },
  { model: Usuario, as: 'mesero', attributes: ['id', 'nombre_completo'] }
];

// Obtener inicio y fin del día actual
const rangoDia = (fecha) => {
  const inicio = new Date(fecha);
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date(fecha);
  fin.setHours(23, 59, 59, 999);
  return { inicio, fin };
};

const fechaValida = (fecha) => !Number.isNaN(fecha.getTime());

const construirRangoHistorial = (tipo, valor) => {
  let inicio;
  let fin;

  if (tipo === 'dia') {
    const partes = valor.split('-').map(Number);
    if (partes.length !== 3 || partes.some(Number.isNaN)) {
      throw new Error('Valor inválido para filtro por día. Usa YYYY-MM-DD.');
    }
    inicio = new Date(partes[0], partes[1] - 1, partes[2], 0, 0, 0, 0);
    fin = new Date(partes[0], partes[1] - 1, partes[2], 23, 59, 59, 999);
  } else if (tipo === 'mes') {
    const partes = valor.split('-').map(Number);
    if (partes.length !== 2 || partes.some(Number.isNaN)) {
      throw new Error('Valor inválido para filtro por mes. Usa YYYY-MM.');
    }
    inicio = new Date(partes[0], partes[1] - 1, 1, 0, 0, 0, 0);
    fin = new Date(partes[0], partes[1], 0, 23, 59, 59, 999);
  } else if (tipo === 'anio' || tipo === 'año') {
    const anio = Number(valor);
    if (Number.isNaN(anio)) {
      throw new Error('Valor inválido para filtro por año. Usa YYYY.');
    }
    inicio = new Date(anio, 0, 1, 0, 0, 0, 0);
    fin = new Date(anio, 11, 31, 23, 59, 59, 999);
  } else {
    throw new Error('Tipo de filtro inválido. Usa: dia, mes o anio.');
  }

  if (!fechaValida(inicio) || !fechaValida(fin)) {
    throw new Error('No se pudo interpretar la fecha del filtro.');
  }

  return { inicio, fin };
};

const reporteService = {

  // Resumen del día: ventas totales, órdenes totales, órdenes activas
  resumenHoy: async () => {
    const hoy = new Date();
    const { inicio, fin } = rangoDia(hoy);

    // Órdenes pagadas hoy para calcular ventas
    const ordenesPagadas = await Orden.findAll({
      where: {
        estado: 'pagada',
        createdAt: { [Op.between]: [inicio, fin] }
      }
    });

    // Todas las órdenes de hoy
    const ordenesHoy = await Orden.count({
      where: { createdAt: { [Op.between]: [inicio, fin] } }
    });

    // Órdenes activas ahora
    const ordenesActivas = await Orden.count({
      where: {
        estado: { [Op.in]: ['pendiente', 'en_preparacion', 'listo', 'entregada'] }
      }
    });

    const totalVentas = ordenesPagadas.reduce(
      (sum, orden) => sum + Number(orden.total), 0
    );

    return {
      totalVentas: totalVentas.toFixed(2),
      ordenesHoy,
      ordenesActivas
    };
  },

  // Top 3 platillos más pedidos hoy
  topPlatillos: async () => {
    const hoy = new Date();
    const { inicio, fin } = rangoDia(hoy);

    const top = await OrdenDetalle.findAll({
      attributes: [
        'platillo_id',
        [fn('SUM', col('cantidad')), 'total_pedidos']
      ],
      include: [
        {
          model: Orden,
          as: 'orden',
          attributes: [],
          where: { createdAt: { [Op.between]: [inicio, fin] } }
        },
        {
          model: Platillo,
          as: 'platillo',
          attributes: ['id', 'nombre']
        }
      ],
      group: ['platillo_id', 'platillo.id', 'platillo.nombre'],
      order: [[literal('total_pedidos'), 'DESC']],
      limit: 3
    });

    return top.map((item) => ({
      nombre: item.platillo?.nombre || '—',
      total: parseInt(item.get('total_pedidos'), 10)
    }));
  },

  // Historial filtrable por día, mes o año
  historial: async (tipo, valor) => {
    const { inicio, fin } = construirRangoHistorial(tipo, valor);

    const ordenes = await Orden.findAll({
      where: {
        estado: 'pagada',
        createdAt: { [Op.between]: [inicio, fin] }
      },
      include: includeOrdenes,
      order: [['created_at', 'DESC']]
    });

    const totalPeriodo = ordenes.reduce(
      (sum, orden) => sum + Number(orden.total), 0
    );

    return {
      totalPeriodo: totalPeriodo.toFixed(2),
      cantidadOrdenes: ordenes.length,
      ordenes
    };
  },

  // Buscador por número de orden, mesa o mesero
  buscar: async (q) => {
    const termino = q.trim();
    const terminoLower = termino.toLowerCase();
    const esNumero = !Number.isNaN(Number(termino));
    const numeroBusqueda = Number(termino);

    const where = esNumero
      ? {
          [Op.or]: [
            { id: numeroBusqueda }
          ]
        }
      : {};

    const ordenes = await Orden.findAll({
      where,
      include: [
        {
          model: Mesa,
          as: 'mesa',
          attributes: ['id', 'numero'],
          where: esNumero ? { numero: numeroBusqueda } : undefined,
          required: false
        },
        {
          model: Usuario,
          as: 'mesero',
          attributes: ['id', 'nombre_completo'],
          where: !esNumero
            ? { nombre_completo: { [Op.like]: `%${termino}%` } }
            : undefined,
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 20
    });

    // Filtrar resultados relevantes
    return ordenes.filter((orden) => (
      esNumero
        ? (orden.id === numeroBusqueda || Number(orden.mesa?.numero) === numeroBusqueda)
        : orden.mesero?.nombre_completo?.toLowerCase().includes(terminoLower)
    ));
  }
};

module.exports = reporteService;
