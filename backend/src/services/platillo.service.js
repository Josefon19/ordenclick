// Capa 2 — Logica de negocio de platillos

const platilloRepository = require('../repositories/platillo.repository');

const platilloService = {

  listarTodos: async (soloDisponibles = false) => {
    return await platilloRepository.listarTodos(soloDisponibles);
  },

  obtenerPorId: async (id) => {
    const platillo = await platilloRepository.buscarPorId(id);
    if (!platillo) throw new Error('Platillo no encontrado.');
    return platillo;
  },

  crear: async ({ nombre, descripcion, precio, categoria_id, disponible }) => {
    if (isNaN(precio) || Number(precio) <= 0) {
      throw new Error('El precio debe ser un numero mayor a 0.');
    }
    return await platilloRepository.crear({
      nombre,
      descripcion: descripcion || null,
      precio: Number(precio),
      categoria_id,
      disponible: disponible !== undefined ? disponible : true
    });
  },

  actualizar: async (id, datos) => {
    const platillo = await platilloRepository.buscarPorId(id);
    if (!platillo) throw new Error('Platillo no encontrado.');
    if (datos.precio && (isNaN(datos.precio) || Number(datos.precio) <= 0)) {
      throw new Error('El precio debe ser un numero mayor a 0.');
    }
    await platilloRepository.actualizar(id, datos);
  },

  toggleDisponibilidad: async (id) => {
    const platillo = await platilloRepository.buscarPorId(id);
    if (!platillo) throw new Error('Platillo no encontrado.');
    await platilloRepository.actualizar(id, { disponible: !platillo.disponible });
    return { ...platillo.toJSON(), disponible: !platillo.disponible };
  }
};

module.exports = platilloService;
