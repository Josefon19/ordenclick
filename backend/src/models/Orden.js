// Modelo de Orden (Capa de modelo)
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Orden = sequelize.define('Orden', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  mesa_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mesero_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'en_preparacion', 'listo', 'finalizado'),
    allowNull: false,
    defaultValue: 'pendiente',
  },
  metodo_pago: {
    type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia'),
    allowNull: true,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  notas_generales: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'ordenes',
  timestamps: true,
  underscored: true,
});

module.exports = Orden;
