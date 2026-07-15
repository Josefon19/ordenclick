// Archivo de inicialización de modelos (Capa de modelo)
const { sequelize } = require('../config/database');

const Usuario = require('./Usuario');
const Categoria = require('./Categoria');
const Platillo = require('./Platillo');
const Mesa = require('./Mesa');
const Orden = require('./Orden');
const OrdenDetalle = require('./OrdenDetalle');
const Sesion = require('./Sesion');

// Definir relaciones entre modelos
Platillo.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });
Categoria.hasMany(Platillo, { foreignKey: 'categoria_id', as: 'platillos' });

Orden.belongsTo(Mesa, { foreignKey: 'mesa_id', as: 'mesa' });
Mesa.hasMany(Orden, { foreignKey: 'mesa_id', as: 'ordenes' });

Orden.belongsTo(Usuario, { foreignKey: 'mesero_id', as: 'mesero' });
Usuario.hasMany(Orden, { foreignKey: 'mesero_id', as: 'ordenes' });

OrdenDetalle.belongsTo(Orden, { foreignKey: 'orden_id', as: 'orden' });
Orden.hasMany(OrdenDetalle, { foreignKey: 'orden_id', as: 'detalles' });

OrdenDetalle.belongsTo(Platillo, { foreignKey: 'platillo_id', as: 'platillo' });
Platillo.hasMany(OrdenDetalle, { foreignKey: 'platillo_id', as: 'detalles' });

Sesion.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Usuario.hasMany(Sesion, { foreignKey: 'usuario_id', as: 'sesiones' });

module.exports = {
  sequelize,
  Usuario,
  Categoria,
  Platillo,
  Mesa,
  Orden,
  OrdenDetalle,
  Sesion
};
