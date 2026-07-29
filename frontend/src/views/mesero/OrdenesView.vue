<template>
  <div class="layout">
    <AppNavbar />
    <div class="layout-content">
      <main class="main-content">
        <div class="mesero-page">

    <!-- Tabs -->
    <div class="tabs">
      <button :class="['tab', tabActivo==='nueva' ? 'tab--active':'']" @click="tabActivo='nueva'">
        + Nueva Orden
      </button>
      <button :class="['tab', tabActivo==='activas' ? 'tab--active':'']" @click="tabActivo='activas'">
        Mis Órdenes ({{ ordenes.length }})
      </button>
    </div>

    <div v-if="mensaje.texto" :class="['alert', `alert-${mensaje.tipo}`]">
      {{ mensaje.texto }}
    </div>

    <!-- TAB: NUEVA ORDEN -->
    <div v-if="tabActivo === 'nueva'" class="tab-content">
      <div class="orden-layout">

        <!-- Columna izquierda: menú -->
        <div class="menu-col">
          <h2 class="section-title">Menú disponible</h2>
          <div class="menu-filtros">
            <input v-model="busqueda" class="search-input" placeholder="Buscar platillo...">
            <select v-model="categoriaFiltro" class="select-input">
              <option value="">Todas</option>
              <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="platillos-grid">
            <div
              v-for="platillo in platillosFiltrados" :key="platillo.id"
              class="platillo-card" @click="agregarAlCarrito(platillo)"
            >
              <div class="platillo-info">
                <span class="platillo-nombre">{{ platillo.nombre }}</span>
                <span class="platillo-categoria">{{ platillo.categoria?.nombre }}</span>
              </div>
              <div class="platillo-footer">
                <span class="platillo-precio">${{ Number(platillo.precio).toFixed(2) }}</span>
                <span class="platillo-agregar">+</span>
              </div>
            </div>
            <p v-if="platillosFiltrados.length === 0" class="empty-text">
              No hay platillos disponibles.
            </p>
          </div>
        </div>

        <!-- Columna derecha: carrito -->
        <div class="carrito-col">
          <h2 class="section-title">Resumen de orden</h2>
          <div class="form-group">
            <label class="form-label">Mesa</label>
            <select v-model="nuevaOrden.mesa_id" class="select-input full">
              <option value="">Selecciona mesa</option>
              <option v-for="mesa in mesas" :key="mesa.id" :value="mesa.id">
                Mesa {{ mesa.numero }} · {{ mesa.ubicacion }}
              </option>
            </select>
            <span v-if="errores.mesa_id" class="field-error">{{ errores.mesa_id }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Notas <span class="optional">(opcional)</span></label>
            <input v-model="nuevaOrden.notas_generales" class="search-input full"
              placeholder="Ej. sin cebolla, alergia...">
          </div>
          <div class="carrito-items">
            <p v-if="nuevaOrden.items.length === 0" class="empty-text">
              Toca un platillo para agregarlo
            </p>
            <div v-for="(item, index) in nuevaOrden.items" :key="item.platillo_id" class="carrito-item">
              <div class="item-info">
                <span class="item-nombre">{{ item.nombre }}</span>
                <span class="item-precio">${{ (item.precio * item.cantidad).toFixed(2) }}</span>
              </div>
              <div class="item-controls">
                <button class="qty-btn" @click="decrementar(index)">−</button>
                <span class="qty-num">{{ item.cantidad }}</span>
                <button class="qty-btn" @click="incrementar(index)">+</button>
                <button class="remove-btn" @click="eliminarItem(index)">✕</button>
              </div>
              <input v-model="item.notas" class="item-notas" placeholder="Nota (opcional)">
            </div>
          </div>
          <div class="carrito-total">
            <span>Total</span>
            <span class="total-monto">${{ totalOrden.toFixed(2) }}</span>
          </div>
          <span v-if="errores.items" class="field-error">{{ errores.items }}</span>
          <button class="btn-enviar" :disabled="enviando" @click="enviarOrden">
            {{ enviando ? 'Enviando...' : 'Enviar orden a cocina' }}
          </button>
        </div>
      </div>
    </div>

    <!-- TAB: MIS ÓRDENES -->
    <div v-if="tabActivo === 'activas'" class="tab-content">
      <div class="ordenes-lista">
        <p v-if="ordenes.length === 0" class="empty-text">No tienes órdenes activas.</p>
        <div v-for="orden in ordenes" :key="orden.id" class="orden-card">
          <div class="orden-card-header">
            <div>
              <span class="orden-num">#{{ orden.id }}</span>
              <span class="orden-mesa">Mesa {{ orden.mesa?.numero }}</span>
            </div>
            <span :class="['badge-estado', `estado-${orden.estado}`]">
              {{ orden.estado.replace('_',' ') }}
            </span>
          </div>
          <div class="orden-items">
            <div v-for="det in orden.detalles" :key="det.id" class="orden-item-row">
              <span>{{ det.platillo?.nombre }}</span>
              <span>x{{ det.cantidad }}</span>
              <span>${{ Number(det.subtotal).toFixed(2) }}</span>
            </div>
          </div>
          <div class="orden-card-footer">
            <span class="orden-total">Total: ${{ Number(orden.total).toFixed(2) }}</span>
            <div class="orden-acciones">
              <button v-if="orden.estado==='listo'"
                class="btn-accion btn-entregar" @click="marcarEntregada(orden.id)"
              >
                Marcar entregada
              </button>
              <button v-if="orden.estado==='entregada'"
                class="btn-accion btn-pagar" @click="abrirModalPago(orden)"
              >
                Registrar pago
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pago -->
    <div v-if="modalPago.visible" class="modal-overlay" @click.self="modalPago.visible=false">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Pago — Orden #{{ modalPago.ordenId }}</h2>
          <button class="modal-close" @click="modalPago.visible=false">✕</button>
        </div>
        <div class="modal-body">
          <p class="pago-total">Total: <strong>${{ modalPago.total }}</strong></p>
          <div class="metodos-pago">
            <button :class="['metodo-btn', modalPago.metodo==='efectivo' ? 'metodo-btn--active':'']"
              @click="modalPago.metodo='efectivo'"
            >💵 Efectivo</button>
            <button :class="['metodo-btn', modalPago.metodo==='tarjeta' ? 'metodo-btn--active':'']"
              @click="modalPago.metodo='tarjeta'"
            >💳 Tarjeta</button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="modalPago.visible=false">Cancelar</button>
          <button class="btn-primary" @click="confirmarPago">Confirmar pago</button>
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
import ordenService from '../../services/orden.service';
import mesaService from '../../services/mesa.service';
import AppNavbar from '../../components/AppNavbar.vue';
import AppSidebar from '../../components/AppSidebar.vue';

const tabActivo = ref('nueva');
const platillos = ref([]);
const mesas = ref([]);
const ordenes = ref([]);
const busqueda = ref('');
const categoriaFiltro = ref('');
const enviando = ref(false);
const mensaje = reactive({ texto: '', tipo: '' });
const errores = reactive({ mesa_id: '', items: '' });

const nuevaOrden = reactive({
  mesa_id: '',
  notas_generales: '',
  items: []
});

const modalPago = reactive({
  visible: false,
  ordenId: null,
  total: 0,
  metodo: 'efectivo'
});

// Categorías únicas extraídas del menú
const categorias = computed(() => {
  const cats = platillos.value.map((p) => p.categoria?.nombre).filter(Boolean);
  return [...new Set(cats)];
});

// Filtrar por búsqueda y categoría seleccionada
const platillosFiltrados = computed(() => {
  return platillos.value.filter((p) => {
    const matchNombre = p.nombre.toLowerCase().includes(busqueda.value.toLowerCase());
    const matchCat = !categoriaFiltro.value || p.categoria?.nombre === categoriaFiltro.value;
    return matchNombre && matchCat;
  });
});

// Total acumulado del carrito
const totalOrden = computed(() => {
  return nuevaOrden.items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
});

onMounted(async () => {
  await Promise.all([cargarPlatillos(), cargarMesas(), cargarOrdenes()]);
});

const cargarPlatillos = async () => {
  try {
    const { data } = await platilloService.listar(true);
    platillos.value = data.data;
  } catch {
    mostrarMensaje('Error al cargar el menú.', 'error');
  }
};

const cargarMesas = async () => {
  try {
    const { data } = await mesaService.listar();
    mesas.value = data.data;
  } catch {
    console.error('Error al cargar mesas');
  }
};

const cargarOrdenes = async () => {
  try {
    const { data } = await ordenService.listar();
    // Solo mostrar órdenes que no estén finalizadas
    ordenes.value = data.data.filter((o) =>
      !['pagada', 'cancelada'].includes(o.estado)
    );
  } catch {
    mostrarMensaje('Error al cargar órdenes.', 'error');
  }
};

const mostrarMensaje = (texto, tipo = 'success') => {
  mensaje.texto = texto;
  mensaje.tipo = tipo;
  setTimeout(() => { mensaje.texto = ''; }, 3500);
};

// Agregar platillo al carrito o incrementar si ya existe
const agregarAlCarrito = (platillo) => {
  const existente = nuevaOrden.items.find((i) => i.platillo_id === platillo.id);
  if (existente) {
    existente.cantidad++;
  } else {
    nuevaOrden.items.push({
      platillo_id: platillo.id,
      nombre: platillo.nombre,
      precio: Number(platillo.precio),
      cantidad: 1,
      notas: ''
    });
  }
};

const incrementar = (index) => { nuevaOrden.items[index].cantidad++; };

const decrementar = (index) => {
  if (nuevaOrden.items[index].cantidad > 1) {
    nuevaOrden.items[index].cantidad--;
  } else {
    eliminarItem(index);
  }
};

const eliminarItem = (index) => { nuevaOrden.items.splice(index, 1); };

// Validar y enviar orden al backend
const enviarOrden = async () => {
  errores.mesa_id = '';
  errores.items = '';
  let valido = true;

  if (!nuevaOrden.mesa_id) {
    errores.mesa_id = 'Selecciona una mesa.';
    valido = false;
  }
  if (nuevaOrden.items.length === 0) {
    errores.items = 'Agrega al menos un platillo.';
    valido = false;
  }
  if (!valido) return;

  enviando.value = true;
  try {
    await ordenService.crear({
      mesa_id: nuevaOrden.mesa_id,
      notas_generales: nuevaOrden.notas_generales,
      items: nuevaOrden.items.map((i) => ({
        platillo_id: i.platillo_id,
        cantidad: i.cantidad,
        notas: i.notas
      }))
    });
    // Limpiar carrito tras envío exitoso
    nuevaOrden.mesa_id = '';
    nuevaOrden.notas_generales = '';
    nuevaOrden.items = [];
    mostrarMensaje('¡Orden enviada a cocina correctamente!');
    tabActivo.value = 'activas';
    await cargarOrdenes();
  } catch (error) {
    mostrarMensaje(
      error.response?.data?.mensaje || 'Error al crear la orden.',
      'error'
    );
  } finally {
    enviando.value = false;
  }
};

const marcarEntregada = async (id) => {
  try {
    await ordenService.actualizarEstado(id, 'entregada');
    mostrarMensaje('Orden marcada como entregada.');
    await cargarOrdenes();
  } catch {
    mostrarMensaje('Error al actualizar la orden.', 'error');
  }
};

const abrirModalPago = (orden) => {
  modalPago.ordenId = orden.id;
  modalPago.total = Number(orden.total).toFixed(2);
  modalPago.metodo = 'efectivo';
  modalPago.visible = true;
};

const confirmarPago = async () => {
  try {
    await ordenService.pagar(modalPago.ordenId, modalPago.metodo);
    modalPago.visible = false;
    mostrarMensaje('Pago registrado correctamente.');
    await cargarOrdenes();
  } catch {
    mostrarMensaje('Error al registrar el pago.', 'error');
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

.mesero-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  border-bottom: 2px solid var(--color-border);
}

.tab {
  padding: 10px 20px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  color: var(--color-text-secondary);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab--active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

/* Layout */
.orden-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 768px) {
  .orden-layout {
    grid-template-columns: 1fr;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 16px;
}

/* Inputs */
.menu-filtros {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.search-input,
.select-input {
  padding: 8px 12px;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
  color: var(--color-text-primary);
  background: white;
  outline: none;
  transition: border-color 0.2s;
}

.search-input {
  flex: 1;
}

.search-input:focus,
.select-input:focus {
  border-color: var(--color-primary);
}

.full {
  width: 100%;
  box-sizing: border-box;
}

/* Grid platillos */
.platillos-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  max-height: 480px;
  overflow-y: auto;
}

.platillo-card {
  background: white;
  border: 1.5px solid var(--color-border);
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.platillo-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(255, 111, 0, 0.12);
}

.platillo-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;
}

.platillo-nombre {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.platillo-categoria {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.platillo-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.platillo-precio {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary);
}

.platillo-agregar {
  width: 24px;
  height: 24px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
}

/* Carrito */
.carrito-col {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.form-group {
  margin-bottom: 14px;
}

.form-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 5px;
}

.optional {
  font-weight: 400;
  color: var(--color-text-secondary);
}

.carrito-items {
  min-height: 120px;
  max-height: 280px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.carrito-item {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 8px;
}

.item-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.item-nombre {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.item-precio {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-primary);
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.qty-btn {
  width: 24px;
  height: 24px;
  border: 1.5px solid var(--color-border);
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-num {
  font-size: 14px;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
}

.remove-btn {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-pendiente);
  font-size: 14px;
}

.item-notas {
  width: 100%;
  padding: 5px 8px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 12px;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
  outline: none;
}

.carrito-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-top: 2px solid var(--color-border);
  margin-bottom: 4px;
  font-size: 15px;
  font-weight: 600;
}

.total-monto {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
}

.btn-enviar {
  width: 100%;
  padding: 14px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  margin-top: 12px;
  transition: background-color 0.2s;
}

.btn-enviar:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-enviar:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Órdenes activas */
.ordenes-lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.orden-card {
  background: white;
  border-radius: 12px;
  border: 1.5px solid var(--color-border);
  overflow: hidden;
}

.orden-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
}

.orden-num {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-right: 8px;
}

.orden-mesa {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.orden-items {
  padding: 12px 16px;
}

.orden-item-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 4px 0;
  border-bottom: 1px solid var(--color-border);
}

.orden-item-row:last-child {
  border-bottom: none;
}

.orden-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid var(--color-border);
}

.orden-total {
  font-size: 14px;
  font-weight: 700;
}

.orden-acciones {
  display: flex;
  gap: 8px;
}

.btn-accion {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
}

.btn-entregar {
  background: #ECFDF5;
  color: var(--color-listo);
}

.btn-pagar {
  background: var(--color-primary);
  color: white;
}

/* Badges estado */
.badge-estado {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
}

.estado-pendiente {
  background: #FEF2F2;
  color: var(--color-pendiente);
}

.estado-en_preparacion {
  background: #FFFBEB;
  color: var(--color-en_preparacion);
}

.estado-listo {
  background: #ECFDF5;
  color: var(--color-listo);
}

.estado-entregada {
  background: #F3F4F6;
  color: var(--color-finalizado);
}

.estado-pagada {
  background: #F3F4F6;
  color: var(--color-finalizado);
}

/* Modal pago */
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
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: 16px;
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

.pago-total {
  font-size: 16px;
  margin: 0 0 16px;
}

.metodos-pago {
  display: flex;
  gap: 12px;
}

.metodo-btn {
  flex: 1;
  padding: 14px;
  border: 2px solid var(--color-border);
  border-radius: 10px;
  background: white;
  font-size: 15px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
}

.metodo-btn--active {
  border-color: var(--color-primary);
  background: #FFF7ED;
  color: var(--color-primary);
  font-weight: 700;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
}

.btn-secondary {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
}

/* Alertas y utilidades */
.alert {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 20px;
}

.alert-success {
  background: #ECFDF5;
  color: var(--color-listo);
  border: 1px solid #A7F3D0;
}

.alert-error {
  background: #FEF2F2;
  color: var(--color-pendiente);
  border: 1px solid #FECACA;
}

.field-error {
  display: block;
  font-size: 12px;
  color: var(--color-pendiente);
  margin-top: 4px;
}

.empty-text {
  color: var(--color-text-secondary);
  font-size: 13px;
  text-align: center;
  padding: 24px 0;
}
</style>
