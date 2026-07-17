// Archivo principal de la aplicación (Capa de infraestructura)
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { conectarDB } = require('./config/database');

const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const platilloRoutes = require('./routes/platillo.routes');
const categoriaRoutes = require('./routes/categoria.routes');
const ordenRoutes = require('./routes/orden.routes');
const reporteRoutes = require('./routes/reporte.routes');
const { verificarToken } = require('./middlewares/auth.middleware');

const app = express();

app.use(cors());
app.use(express.json());

// Asegurarse de montar las rutas de auth antes de las protegidas:
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/platillos', platilloRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/ordenes', verificarToken, ordenRoutes);
app.use('/api/reportes', verificarToken, reporteRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

conectarDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${process.env.PORT}`);
  });
});
