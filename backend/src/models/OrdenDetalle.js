// Modelo de OrdenDetalle (Capa de modelo)
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrdenDetalle = sequelize.define('OrdenDetalle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orden_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  platillo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'en_preparacion', 'listo'),
    allowNull: false,
    defaultValue: 'pendiente',
  },
}, {
  tableName: 'orden_detalle',
  timestamps: false,
  underscored: true,
});

module.exports = OrdenDetalle;
