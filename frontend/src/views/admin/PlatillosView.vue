<template>
  <div class="layout">
    <AppNavbar />
    <div class="layout-content">
      <AppSidebar />
      <main class="main-content">
        <div class="page">
          <div class="page-header">
            <div>
              <h1 class="page-title">Gestión de Platillos</h1>
              <p class="page-subtitle">Administra el catálogo del menú del restaurante</p>
            </div>
            <button class="btn-primary" @click="abrirModalCrear">+ Nuevo Platillo</button>
          </div>

          <div v-if="mensaje.texto" :class="['alert', `alert-${mensaje.tipo}`]">
            {{ mensaje.texto }}
          </div>

          <div class="filtros">
            <input
              v-model="busqueda"
              class="search-input"
              placeholder="Buscar por nombre o descripción..."
            >
            <button
              v-for="cat in ['Todos', ...categorias.map(c => c.nombre)]"
              :key="cat"
              :class="['btn-filtro', filtroActivo === cat ? 'btn-filtro--active' : '']"
              @click="filtroActivo = cat"
            >
              {{ cat }}
            </button>
          </div>

          <div class="card">
            <table class="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th>Precio</th>
                  <th>Disponible</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="cargando">
                  <td colspan="6" class="table-empty">Cargando platillos...</td>
                </tr>
                <tr v-else-if="platillosFiltrados.length === 0">
                  <td colspan="6" class="table-empty">No hay platillos registrados.</td>
                </tr>
                <tr v-for="platillo in platillosFiltrados" :key="platillo.id">
                  <td class="td-nombre">{{ platillo.nombre }}</td>
                  <td>
                    <span class="badge badge-categoria">
                      {{ platillo.categoria?.nombre || '—' }}
                    </span>
                  </td>
                  <td class="td-desc">{{ platillo.descripcion || '—' }}</td>
                  <td class="td-precio">${{ Number(platillo.precio).toFixed(2) }}</td>
                  <td>
                    <span :class="['badge', platillo.disponible ? 'badge-activo' : 'badge-inactivo']">
                      {{ platillo.disponible ? 'Disponible' : 'No disponible' }}
                    </span>
                  </td>
                  <td class="table-actions">
                    <button class="btn-action btn-edit" @click="abrirModalEditar(platillo)">
                      Editar
                    </button>
                    <button
                      :class="['btn-action', platillo.disponible ? 'btn-delete' : 'btn-activate']"
                      @click="cambiarDisponibilidad(platillo)"
                    >
                      {{ platillo.disponible ? 'Desactivar' : 'Activar' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="modal.visible" class="modal-overlay" @click.self="cerrarModal">
            <div class="modal">
              <div class="modal-header">
                <h2 class="modal-title">
                  {{ modal.modo === 'crear' ? 'Nuevo Platillo' : 'Editar Platillo' }}
                </h2>
                <button class="modal-close" @click="cerrarModal">✕</button>
              </div>
              <div class="modal-body">
                <div v-if="modal.error" class="alert alert-error">{{ modal.error }}</div>

                <div class="form-group">
                  <label class="form-label">Nombre del platillo</label>
                  <input v-model="form.nombre" class="form-input" placeholder="Ej. Tacos de Birria">
                  <span v-if="errores.nombre" class="field-error">{{ errores.nombre }}</span>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Categoría</label>
                    <select v-model="form.categoria_id" class="form-input">
                      <option value="">Selecciona categoría</option>
                      <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                        {{ cat.nombre }}
                      </option>
                    </select>
                    <span v-if="errores.categoria_id" class="field-error">{{ errores.categoria_id }}</span>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Precio ($)</label>
                    <input
                      v-model="form.precio"
                      type="number"
                      min="0"
                      step="0.01"
                      class="form-input"
                      placeholder="0.00"
                    >
                    <span v-if="errores.precio" class="field-error">{{ errores.precio }}</span>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Descripción <span class="optional">(opcional)</span>
                  </label>
                  <textarea
                    v-model="form.descripcion"
                    class="form-input form-textarea"
                    placeholder="Describe brevemente el platillo..."
                    rows="3"
                  ></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-secondary" @click="cerrarModal">Cancelar</button>
                <button class="btn-primary" :disabled="modal.guardando" @click="guardarPlatillo">
                  {{ modal.guardando ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import platilloService from '../../services/platillo.service';
import categoriaService from '../../services/categoria.service';
import AppNavbar from '../../components/AppNavbar.vue';
import AppSidebar from '../../components/AppSidebar.vue';

const platillos = ref([]);
const categorias = ref([]);
const cargando = ref(false);
const busqueda = ref('');
const filtroActivo = ref('Todos');
const mensaje = reactive({ texto: '', tipo: '' });
const modal = reactive({
  visible: false,
  modo: 'crear',
  error: '',
  guardando: false,
  platilloId: null
});
const form = reactive({
  nombre: '',
  descripcion: '',
  precio: '',
  categoria_id: ''
});
const errores = reactive({
  nombre: '',
  precio: '',
  categoria_id: ''
});

const platillosFiltrados = computed(() => {
  const termino = busqueda.value.trim().toLowerCase();

  return platillos.value.filter((platillo) => {
    const coincideCategoria = filtroActivo.value === 'Todos'
      || platillo.categoria?.nombre === filtroActivo.value;
    const coincideBusqueda = !termino
      || platillo.nombre?.toLowerCase().includes(termino)
      || platillo.descripcion?.toLowerCase().includes(termino);

    return coincideCategoria && coincideBusqueda;
  });
});

onMounted(async () => {
  await Promise.all([cargarPlatillos(), cargarCategorias()]);
});

const cargarPlatillos = async () => {
  cargando.value = true;
  try {
    const { data } = await platilloService.listar();
    platillos.value = data.data;
  } catch {
    mostrarMensaje('Error al cargar los platillos.', 'error');
  } finally {
    cargando.value = false;
  }
};

const cargarCategorias = async () => {
  try {
    const { data } = await categoriaService.listar();
    categorias.value = data.data;
  } catch {
    console.error('Error al cargar categorías');
  }
};

const mostrarMensaje = (texto, tipo = 'success') => {
  mensaje.texto = texto;
  mensaje.tipo = tipo;
  setTimeout(() => { mensaje.texto = ''; }, 3500);
};

const validarForm = () => {
  let valido = true;
  errores.nombre = '';
  errores.precio = '';
  errores.categoria_id = '';

  if (!form.nombre.trim()) {
    errores.nombre = 'El nombre es obligatorio.';
    valido = false;
  }
  if (!form.precio || isNaN(form.precio) || Number(form.precio) <= 0) {
    errores.precio = 'Ingresa un precio válido mayor a 0.';
    valido = false;
  }
  if (!form.categoria_id) {
    errores.categoria_id = 'Selecciona una categoría.';
    valido = false;
  }
  return valido;
};

const abrirModalCrear = () => {
  modal.modo = 'crear';
  modal.error = '';
  modal.platilloId = null;
  form.nombre = '';
  form.descripcion = '';
  form.precio = '';
  form.categoria_id = '';
  modal.visible = true;
};

const abrirModalEditar = (platillo) => {
  modal.modo = 'editar';
  modal.error = '';
  modal.platilloId = platillo.id;
  form.nombre = platillo.nombre;
  form.descripcion = platillo.descripcion || '';
  form.precio = platillo.precio;
  form.categoria_id = platillo.categoria_id;
  modal.visible = true;
};

const cerrarModal = () => {
  modal.visible = false;
  modal.error = '';
};

const guardarPlatillo = async () => {
  if (!validarForm()) return;
  modal.guardando = true;
  modal.error = '';

  try {
    if (modal.modo === 'crear') {
      await platilloService.crear(form);
      mostrarMensaje('Platillo creado correctamente.');
    } else {
      await platilloService.actualizar(modal.platilloId, form);
      mostrarMensaje('Platillo actualizado correctamente.');
    }
    cerrarModal();
    await cargarPlatillos();
  } catch (error) {
    modal.error = error.response?.data?.mensaje || 'Error al guardar el platillo.';
  } finally {
    modal.guardando = false;
  }
};

const cambiarDisponibilidad = async (platillo) => {
  const accion = platillo.disponible ? 'desactivar' : 'activar';
  if (!confirm(`¿Deseas ${accion} "${platillo.nombre}"?`)) return;

  try {
    await platilloService.toggleDisponibilidad(platillo.id);
    mostrarMensaje(`Platillo ${accion === 'activar' ? 'activado' : 'desactivado'} correctamente.`);
    await cargarPlatillos();
  } catch {
    mostrarMensaje('Error al cambiar la disponibilidad.', 'error');
  }
};
</script>

<style scoped>
.layout-content {
  display: flex;
}

.main-content {
  flex: 1;
}

.page {
  padding: 32px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}

.page-subtitle {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

.filtros {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.search-input {
  min-width: 280px;
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: var(--color-text-primary);
  background: white;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--color-primary);
}

.btn-filtro {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1.5px solid var(--color-border);
  background: white;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.2s;
}

.btn-filtro:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-filtro--active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: var(--color-bg);
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 20px;
}

.alert-success {
  background-color: #ECFDF5;
  color: var(--color-listo);
  border: 1px solid #A7F3D0;
}

.alert-error {
  background-color: #FEF2F2;
  color: var(--color-pendiente);
  border: 1px solid #FECACA;
}

.card {
  background: var(--color-card);
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table thead tr {
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
}

.table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.table tbody tr:hover {
  background-color: #F8FAFC;
}

.table-empty {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 32px !important;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.td-nombre {
  font-weight: 600;
}

.td-desc {
  color: var(--color-text-secondary);
  font-size: 13px;
  max-width: 180px;
}

.td-precio {
  font-weight: 700;
  color: var(--color-primary);
}

.btn-action {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
}

.btn-action:hover {
  opacity: 0.85;
}

.btn-edit {
  background-color: #EFF6FF;
  color: #2563EB;
}

.btn-delete {
  background-color: #FEF2F2;
  color: var(--color-pendiente);
}

.btn-activate {
  background-color: #ECFDF5;
  color: var(--color-listo);
}

.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.badge-categoria {
  background-color: #F0F9FF;
  color: #0369A1;
}

.badge-activo {
  background-color: #ECFDF5;
  color: #059669;
}

.badge-inactivo {
  background-color: #F3F4F6;
  color: var(--color-finalizado);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: var(--color-card);
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  margin-bottom: 18px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.optional {
  font-weight: 400;
  color: var(--color-text-secondary);
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: var(--color-text-primary);
  background: var(--color-bg);
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: var(--color-primary);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.field-error {
  display: block;
  font-size: 12px;
  color: var(--color-pendiente);
  margin-top: 4px;
}
</style>
