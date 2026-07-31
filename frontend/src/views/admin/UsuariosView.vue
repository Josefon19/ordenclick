<template>
  <div class="layout">
    <AppNavbar />
    <div class="layout-content">
      <AppSidebar />
      <main class="main-content">
        <div class="page">

          <!-- Encabezado de página -->
          <div class="page-header">
            <div>
              <h1 class="page-title">Gestión de Usuarios</h1>
              <p class="page-subtitle">Administra las cuentas del personal del restaurante</p>
            </div>
            <button class="btn-primary" @click="abrirModalCrear">
              + Nuevo Usuario
            </button>
          </div>

          <!-- Mensaje de éxito o error global -->
          <div v-if="mensaje.texto" :class="['alert', `alert-${mensaje.tipo}`]">
            {{ mensaje.texto }}
          </div>

          <div class="filtros">
            <input
              v-model="busqueda"
              class="search-input"
              placeholder="Buscar por nombre o correo..."
            >
            <button
              v-for="rol in rolesFiltro"
              :key="rol"
              :class="['btn-filtro', filtroRol === rol ? 'btn-filtro--active' : '']"
              @click="filtroRol = rol"
            >
              {{ rol }}
            </button>
          </div>

          <!-- Tabla de usuarios -->
          <div class="card">
            <table class="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="cargando">
                  <td colspan="5" class="table-empty">Cargando usuarios...</td>
                </tr>
                <tr v-else-if="usuariosFiltrados.length === 0">
                  <td colspan="5" class="table-empty">No hay usuarios registrados.</td>
                </tr>
                <tr v-for="usuario in usuariosFiltrados" :key="usuario.id">
                  <td>{{ usuario.nombre_completo }}</td>
                  <td>{{ usuario.correo }}</td>
                  <td>
                    <span :class="['badge', `badge-${usuario.rol}`]">
                      {{ usuario.rol }}
                    </span>
                  </td>
                  <td>
                    <span :class="['badge', usuario.activo ? 'badge-activo' : 'badge-inactivo']">
                      {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="table-actions">
                    <button class="btn-action btn-edit" @click="abrirModalEditar(usuario)">
                      Editar
                    </button>
                    <button
                      :class="['btn-action', usuario.activo ? 'btn-delete' : 'btn-activate']"
                      @click="usuario.activo ? confirmarDesactivar(usuario) : confirmarActivar(usuario)"
                    >
                      {{ usuario.activo ? 'Desactivar' : 'Activar' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Modal crear/editar usuario -->
          <div v-if="modal.visible" class="modal-overlay" @click.self="cerrarModal">
            <div class="modal">

              <div class="modal-header">
                <h2 class="modal-title">{{ modal.modo === 'crear' ? 'Nuevo Usuario' : 'Editar Usuario' }}</h2>
                <button class="modal-close" @click="cerrarModal">✕</button>
              </div>

              <div class="modal-body">

                <!-- Mensaje de error del modal -->
                <div v-if="modal.error" class="alert alert-error">{{ modal.error }}</div>

                <div class="form-group">
                  <label class="form-label">Nombre completo</label>
                  <input v-model="form.nombre_completo" class="form-input" placeholder="Ej. Juan Pérez">
                  <span v-if="errores.nombre_completo" class="field-error">{{ errores.nombre_completo }}</span>
                </div>

                <div class="form-group">
                  <label class="form-label">Correo electrónico</label>
                  <input v-model="form.correo" type="email" class="form-input" placeholder="correo@ejemplo.com">
                  <span v-if="errores.correo" class="field-error">{{ errores.correo }}</span>
                </div>

                <!-- Contraseña solo al crear -->
                <div class="form-group" v-if="modal.modo === 'crear'">
                  <label class="form-label">Contraseña</label>
                  <input v-model="form.password" type="password" class="form-input" placeholder="Mínimo 6 caracteres">
                  <span v-if="errores.password" class="field-error">{{ errores.password }}</span>
                </div>

                <div class="form-group">
                  <label class="form-label">Rol</label>
                  <select v-model="form.rol" class="form-input">
                    <option value="">Selecciona un rol</option>
                    <option value="administrador">Administrador</option>
                    <option value="mesero">Mesero</option>
                    <option value="cocina">Cocina</option>
                  </select>
                  <span v-if="errores.rol" class="field-error">{{ errores.rol }}</span>
                </div>

              </div>

              <div class="modal-footer">
                <button class="btn-secondary" @click="cerrarModal">Cancelar</button>
                <button class="btn-primary" :disabled="modal.guardando" @click="guardarUsuario">
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
import usuarioService from '../../services/usuario.service';
import AppNavbar from '../../components/AppNavbar.vue';
import AppSidebar from '../../components/AppSidebar.vue';

// Estado principal
const usuarios = ref([]);
const cargando = ref(false);
const busqueda = ref('');
const filtroRol = ref('Todos');
const mensaje = reactive({ texto: '', tipo: '' });
const rolesFiltro = ['Todos', 'administrador', 'mesero', 'cocina'];

// Estado del modal
const modal = reactive({
  visible: false,
  modo: 'crear', // 'crear' | 'editar'
  error: '',
  guardando: false,
  usuarioId: null
});

// Formulario del modal
const form = reactive({
  nombre_completo: '',
  correo: '',
  password: '',
  rol: ''
});

// Errores por campo
const errores = reactive({
  nombre_completo: '',
  correo: '',
  password: '',
  rol: ''
});

const usuariosFiltrados = computed(() => {
  const termino = busqueda.value.trim().toLowerCase();

  return usuarios.value.filter((usuario) => {
    const coincideBusqueda = !termino
      || usuario.nombre_completo?.toLowerCase().includes(termino)
      || usuario.correo?.toLowerCase().includes(termino);
    const coincideRol = filtroRol.value === 'Todos' || usuario.rol === filtroRol.value;

    return coincideBusqueda && coincideRol;
  });
});

// Cargar usuarios al montar la vista
onMounted(async () => {
  await cargarUsuarios();
});

const cargarUsuarios = async () => {
  cargando.value = true;
  try {
    const { data } = await usuarioService.listar();
    usuarios.value = data.data;
  } catch (error) {
    mostrarMensaje('Error al cargar los usuarios.', 'error');
  } finally {
    cargando.value = false;
  }
};

// Mostrar mensaje global temporal
const mostrarMensaje = (texto, tipo = 'success') => {
  mensaje.texto = texto;
  mensaje.tipo = tipo;
  setTimeout(() => { mensaje.texto = ''; }, 3500);
};

// Validar formulario
const validarForm = () => {
  let valido = true;
  errores.nombre_completo = '';
  errores.correo = '';
  errores.password = '';
  errores.rol = '';

  if (!form.nombre_completo.trim()) {
    errores.nombre_completo = 'El nombre es obligatorio.';
    valido = false;
  }
  if (!form.correo.trim()) {
    errores.correo = 'El correo es obligatorio.';
    valido = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
    errores.correo = 'Ingresa un correo válido.';
    valido = false;
  }
  if (modal.modo === 'crear' && !form.password.trim()) {
    errores.password = 'La contraseña es obligatoria.';
    valido = false;
  } else if (modal.modo === 'crear' && form.password.length < 6) {
    errores.password = 'Mínimo 6 caracteres.';
    valido = false;
  }
  if (!form.rol) {
    errores.rol = 'Selecciona un rol.';
    valido = false;
  }

  return valido;
};

// Abrir modal para crear
const abrirModalCrear = () => {
  modal.modo = 'crear';
  modal.error = '';
  modal.usuarioId = null;
  form.nombre_completo = '';
  form.correo = '';
  form.password = '';
  form.rol = '';
  modal.visible = true;
};

// Abrir modal para editar
const abrirModalEditar = (usuario) => {
  modal.modo = 'editar';
  modal.error = '';
  modal.usuarioId = usuario.id;
  form.nombre_completo = usuario.nombre_completo;
  form.correo = usuario.correo;
  form.password = '';
  form.rol = usuario.rol;
  modal.visible = true;
};

// Cerrar modal
const cerrarModal = () => {
  modal.visible = false;
  modal.error = '';
};

// Guardar usuario (crear o editar)
const guardarUsuario = async () => {
  if (!validarForm()) return;
  modal.guardando = true;
  modal.error = '';

  try {
    if (modal.modo === 'crear') {
      await usuarioService.crear({
        nombre_completo: form.nombre_completo,
        correo: form.correo,
        password: form.password,
        rol: form.rol
      });
      mostrarMensaje('Usuario creado correctamente.');
    } else {
      await usuarioService.actualizar(modal.usuarioId, {
        nombre_completo: form.nombre_completo,
        correo: form.correo,
        rol: form.rol
      });
      mostrarMensaje('Usuario actualizado correctamente.');
    }
    cerrarModal();
    await cargarUsuarios();
  } catch (error) {
    modal.error = error.response?.data?.mensaje || 'Error al guardar el usuario.';
  } finally {
    modal.guardando = false;
  }
};

// Confirmar y desactivar usuario
const confirmarDesactivar = async (usuario) => {
  if (!confirm(`¿Desactivar la cuenta de ${usuario.nombre_completo}?`)) return;
  try {
    await usuarioService.desactivar(usuario.id);
    mostrarMensaje('Usuario desactivado correctamente.');
    await cargarUsuarios();
  } catch (error) {
    mostrarMensaje('Error al desactivar el usuario.', 'error');
  }
};

// Confirmar y activar usuario
const confirmarActivar = async (usuario) => {
  if (!confirm(`¿Activar la cuenta de ${usuario.nombre_completo}?`)) return;
  try {
    await usuarioService.activar(usuario.id);
    mostrarMensaje('Usuario activado correctamente.');
    await cargarUsuarios();
  } catch (error) {
    mostrarMensaje('Error al activar el usuario.', 'error');
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
  min-width: 260px;
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
  text-transform: capitalize;
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

/* Botones */
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
.btn-primary:hover:not(:disabled) { background-color: var(--color-primary-hover); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

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
.btn-secondary:hover { background-color: var(--color-bg); }

/* Alertas */
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

/* Tarjeta contenedora de tabla */
.card {
  background: var(--color-card);
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow: hidden;
}

/* Tabla */
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
.table tbody tr:last-child td { border-bottom: none; }
.table tbody tr:hover { background-color: #F8FAFC; }
.table-empty {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 32px !important;
}
.table-actions { display: flex; gap: 8px; }

/* Botones de acción en tabla */
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
.btn-action:hover { opacity: 0.85; }
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

/* Badges de rol y estado */
.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
}
.badge-administrador { background-color: #EDE9FE; color: #7C3AED; }
.badge-mesero       { background-color: #FFF7ED; color: #EA580C; }
.badge-cocina       { background-color: #ECFDF5; color: #059669; }
.badge-activo       { background-color: #ECFDF5; color: #059669; }
.badge-inactivo     { background-color: #F3F4F6; color: var(--color-finalizado); }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: var(--color-card);
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
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
.modal-body { padding: 24px; }
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
}

/* Formulario */
.form-group { margin-bottom: 18px; }
.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 6px;
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
.field-error {
  color: var(--color-pendiente);
  font-size: 12px;
  margin-top: 4px;
  display: block;
}
</style>
