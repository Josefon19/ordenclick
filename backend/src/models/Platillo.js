// Modelo de Platillo (Capa de modelo)
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Platillo = sequelize.define('Platillo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  disponible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  imagen_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'platillos',
  timestamps: true,
  underscored: true,
});

module.exports = Platillo;
