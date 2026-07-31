<template>
  <div class="cocina-view">
    <AppNavbar />
    <div class="cocina-page">
    

    <!-- Header -->
    <div class="cocina-header">
      <div>
        <h1 class="cocina-title">Vista de Cocina</h1>
        <p class="cocina-subtitle">
          Órdenes activas: <strong>{{ ordenes.length }}</strong>
        </p>
      </div>
      <div class="header-acciones">
        <!-- Contador regresivo del refresco automático -->
        <span class="contador">
          <v-icon name="md-refresh" class="inline-icon" />
          Actualizando en {{ contador }}s
        </span>
        <button class="btn-refrescar" @click="refrescar">
          Actualizar ahora
        </button>
      </div>
    </div>

    <!-- Alerta global -->
    <div v-if="mensaje.texto" :class="['alert', `alert-${mensaje.tipo}`]">
      {{ mensaje.texto }}
    </div>

    <!-- Estado de carga -->
    <div v-if="cargando" class="loading-text">Cargando órdenes...</div>

    <!-- Sin órdenes -->
    <div v-else-if="ordenes.length === 0" class="empty-state">
      <div class="empty-icon">
        <v-icon name="md-restaurant" />
      </div>
      <p class="empty-title">Sin órdenes activas</p>
      <p class="empty-sub">Las nuevas órdenes aparecerán aquí automáticamente</p>
    </div>

    <!-- Grid de tarjetas de órdenes -->
    <div v-else class="ordenes-grid">
      <div
        v-for="orden in ordenes"
        :key="orden.id"
        :class="['orden-card', `card-${orden.estado}`]"
      >
        <!-- Header de tarjeta -->
        <div class="card-header">
          <div class="card-header-left">
            <span class="card-num">#{{ orden.id }}</span>
            <span class="card-mesa">Mesa {{ orden.mesa?.numero }}</span>
          </div>
          <span :class="['badge-estado', `estado-${orden.estado}`]">
            {{ orden.estado === 'en_preparacion' ? 'En preparación' : 'Pendiente' }}
          </span>
        </div>

        <!-- Hora de la orden -->
        <div class="card-hora">
          <v-icon name="md-accesstime" class="inline-icon" />
          {{ formatearHora(orden) }}
          <span class="card-tiempo">{{ tiempoTranscurrido(orden) }}</span>
        </div>

        <!-- Lista de platillos -->
        <div class="card-items">
          <div
            v-for="det in orden.detalles"
            :key="det.id"
            class="card-item"
          >
            <span class="item-cantidad">x{{ det.cantidad }}</span>
            <span class="item-nombre">{{ det.platillo?.nombre }}</span>
            <span v-if="det.notas" class="item-nota">
              <v-icon name="md-notes" class="inline-icon" />
              {{ det.notas }}
            </span>
          </div>
        </div>

        <!-- Notas generales -->
        <div v-if="orden.notas_generales" class="card-notas">
          <span class="notas-label">Nota mesa:</span>
          {{ orden.notas_generales }}
        </div>

        <!-- Mesero asignado -->
        <div class="card-mesero">
          <v-icon name="md-person" class="inline-icon" />
          {{ orden.mesero?.nombre_completo }}
        </div>

        <!-- Botones de acción -->
        <div class="card-acciones">
          <button
            v-if="orden.estado === 'pendiente'"
            class="btn-preparar"
            @click="cambiarEstado(orden.id, 'en_preparacion')"
          >
            Iniciar preparación
          </button>
          <button
            v-if="orden.estado === 'en_preparacion'"
            class="btn-listo"
            @click="cambiarEstado(orden.id, 'listo')"
          >
            <v-icon name="md-done" class="inline-icon" />
            Marcar como listo
          </button>
        </div>

      </div>
    </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import AppNavbar from '../../components/AppNavbar.vue';
import ordenService from '../../services/orden.service';

const ordenes = ref([]);
const cargando = ref(false);
const contador = ref(30);
const mensaje = reactive({ texto: '', tipo: '' });

let intervaloRefresco = null;
let intervaloContador = null;

onMounted(async () => {
  await cargarOrdenes();
  iniciarRefresco();
});

// Limpiar intervalos al salir de la vista
onUnmounted(() => {
  clearInterval(intervaloRefresco);
  clearInterval(intervaloContador);
});

const cargarOrdenes = async () => {
  cargando.value = true;
  try {
    const { data } = await ordenService.listarActivas();
    ordenes.value = data.data;
  } catch {
    mostrarMensaje('Error al cargar las órdenes.', 'error');
  } finally {
    cargando.value = false;
  }
};

const refrescar = async () => {
  // Resetear contador y recargar
  contador.value = 30;
  await cargarOrdenes();
};

// Iniciar refresco automático cada 30 segundos
const iniciarRefresco = () => {
  // Countdown visual cada segundo
  intervaloContador = setInterval(() => {
    contador.value--;
    if (contador.value <= 0) contador.value = 30;
  }, 1000);

  // Recarga real cada 30 segundos
  intervaloRefresco = setInterval(async () => {
    contador.value = 30;
    await cargarOrdenes();
  }, 30000);
};

// Cambiar estado de la orden desde cocina
const cambiarEstado = async (id, nuevoEstado) => {
  try {
    await ordenService.actualizarEstado(id, nuevoEstado);
    const etiqueta = nuevoEstado === 'en_preparacion'
      ? 'En preparación'
      : 'Listo';
    mostrarMensaje(`Orden #${id} marcada como "${etiqueta}".`);
    await cargarOrdenes();
  } catch (error) {
    mostrarMensaje(
      error.response?.data?.mensaje || 'Error al actualizar la orden.',
      'error'
    );
  }
};

const mostrarMensaje = (texto, tipo = 'success') => {
  mensaje.texto = texto;
  mensaje.tipo = tipo;
  setTimeout(() => { mensaje.texto = ''; }, 3500);
};

const obtenerFechaOrden = (orden) => {
  const valor = orden?.created_at || orden?.createdAt || orden?.fecha || null;
  if (!valor) return null;

  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

// Formatear hora legible desde timestamp
const formatearHora = (orden) => {
  const fecha = obtenerFechaOrden(orden);
  if (!fecha) return '--:--';

  return fecha.toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit'
  });
};

// Calcular tiempo transcurrido desde la orden
const tiempoTranscurrido = (orden) => {
  const fecha = obtenerFechaOrden(orden);
  if (!fecha) return 'Hora no disponible';

  const diff = Math.floor((Date.now() - fecha.getTime()) / 60000);
  if (diff < 1) return 'Hace un momento';
  if (diff === 1) return 'Hace 1 min';
  return `Hace ${diff} min`;
};
</script>

<style scoped>
.cocina-view {
  min-height: 100vh;
  background: var(--color-bg);
}

.cocina-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.cocina-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.cocina-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}

.cocina-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.header-acciones {
  display: flex;
  align-items: center;
  gap: 12px;
}

.contador {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-refrescar {
  padding: 8px 16px;
  background: white;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  color: var(--color-text-primary);
  transition: all 0.2s;
}

.btn-refrescar:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Estados vacío y carga */
.loading-text {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 48px;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 80px 24px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--color-primary);
}

.empty-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.empty-sub {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

/* Grid de tarjetas */
.ordenes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* Tarjeta de orden */
.orden-card {
  background: var(--color-card);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  border-top: 4px solid var(--color-border);
  display: flex;
  flex-direction: column;
}

/* Color del borde superior según estado */
.card-pendiente {
  border-top-color: var(--color-pendiente);
}

.card-en_preparacion {
  border-top-color: var(--color-en_preparacion);
}

/* Header tarjeta */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px 8px;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-num {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.card-mesa {
  font-size: 13px;
  color: var(--color-text-secondary);
  background: var(--color-bg);
  padding: 2px 8px;
  border-radius: 20px;
}

/* Hora y tiempo */
.card-hora {
  padding: 0 16px 10px;
  font-size: 12px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--color-border);
}

.card-tiempo {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

/* Lista de platillos */
.card-items {
  padding: 12px 16px;
  flex: 1;
}

.card-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.card-item:last-child {
  border-bottom: none;
}

.item-cantidad {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-primary);
  min-width: 28px;
}

.item-nombre {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  flex: 1;
}

.item-nota {
  width: 100%;
  font-size: 11px;
  color: var(--color-text-secondary);
  padding-left: 36px;
  font-style: italic;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* Notas generales */
.card-notas {
  margin: 0 16px 10px;
  padding: 8px 12px;
  background: #FFFBEB;
  border-radius: 8px;
  font-size: 12px;
  color: #92400E;
  border: 1px solid #FDE68A;
}

.notas-label {
  font-weight: 700;
  margin-right: 4px;
}

/* Mesero */
.card-mesero {
  padding: 8px 16px;
  font-size: 12px;
  color: var(--color-text-secondary);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Botones de acción */
.card-acciones {
  padding: 12px 16px;
}

.btn-preparar {
  width: 100%;
  padding: 12px;
  background: #FFFBEB;
  color: #92400E;
  border: 2px solid var(--color-en_preparacion);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-preparar:hover {
  background: var(--color-en_preparacion);
  color: white;
}

.btn-listo {
  width: 100%;
  padding: 12px;
  background: var(--color-listo);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-listo:hover {
  opacity: 0.9;
}

.inline-icon {
  flex-shrink: 0;
}

/* Badges de estado */
.badge-estado {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}

.estado-pendiente {
  background: #FEF2F2;
  color: var(--color-pendiente);
}

.estado-en_preparacion {
  background: #FFFBEB;
  color: #92400E;
}

/* Alertas */
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
</style>
