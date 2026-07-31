<template>
  <div class="layout">
    <AppNavbar />
    <div class="layout-content">
      <AppSidebar />
      <main class="main-content">
        <div class="dashboard-page">

          <!-- Encabezado -->
          <div class="page-header">
            <div>
              <h1 class="page-title">Dashboard</h1>
              <p class="page-subtitle">Resumen del día — {{ fechaHoy }}</p>
            </div>
            <button class="btn-refrescar" @click="cargarTodo">↻ Actualizar</button>
          </div>

          <!-- ══ TARJETAS DE MÉTRICAS ══ -->
          <div class="metricas-grid">

      <div class="metrica-card">
        <p class="metrica-label">Total ventas del día</p>
        <p class="metrica-valor naranja">${{ resumen.totalVentas }}</p>
        <p class="metrica-sub">Órdenes pagadas hoy</p>
      </div>

      <div class="metrica-card">
        <p class="metrica-label">Órdenes del día</p>
        <p class="metrica-valor">{{ resumen.ordenesHoy }}</p>
        <p class="metrica-sub">Creadas hoy</p>
      </div>

      <div class="metrica-card">
        <p class="metrica-label">Órdenes activas</p>
        <p class="metrica-valor naranja">{{ resumen.ordenesActivas }}</p>
        <p class="metrica-sub">En proceso ahora</p>
      </div>

          </div>

          <!-- ══ TOP PLATILLOS ══ -->
          <div class="section-card">
      <h2 class="section-title"> <v-icon name="la-trophy-solid" class="icon" /> Top 3 platillos del día</h2>
      <div v-if="topPlatillos.length === 0" class="empty-text">
        Sin datos por el momento.
      </div>
      <div v-else class="top-lista">
        <div
          v-for="(platillo, index) in topPlatillos"
          :key="index"
          class="top-item"
        >
          <div class="top-item-info">
            <span class="top-pos">#{{ index + 1 }}</span>
            <span class="top-nombre">{{ platillo.nombre }}</span>
            <span class="top-cantidad">{{ platillo.total }} pedidos</span>
          </div>
          <!-- Barra visual en naranja -->
          <div class="barra-contenedor">
            <div
              class="barra-fill"
              :style="{ width: `${(platillo.total / topPlatillos[0].total) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
          </div>

          <!-- ══ BUSCADOR DE ÓRDENES ══ -->
          <div class="section-card">
      <h2 class="section-title"> <v-icon name="co-search" class="icon" /> Buscar órdenes</h2>
      <div class="buscador-row">
        <input
          v-model="terminoBusqueda"
          class="search-input"
          placeholder="Busca por # orden, # mesa o nombre del mesero..."
          @input="buscarOrdenes"
        >
        <button
          v-if="terminoBusqueda"
          class="btn-limpiar"
          @click="limpiarBusqueda"
        >✕ Limpiar</button>
      </div>

      <!-- Resultados del buscador -->
      <div v-if="terminoBusqueda" class="resultados">
        <p v-if="buscando" class="empty-text">Buscando...</p>
        <p v-else-if="resultados.length === 0" class="empty-text">
          Sin resultados para "{{ terminoBusqueda }}"
        </p>
        <table v-else class="table">
          <thead>
            <tr>
              <th># Orden</th>
              <th>Mesa</th>
              <th>Mesero</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="orden in resultados" :key="orden.id">
              <td class="td-bold">#{{ orden.id }}</td>
              <td>Mesa {{ orden.mesa?.numero }}</td>
              <td>{{ orden.mesero?.nombre_completo }}</td>
              <td class="td-naranja">${{ Number(orden.total).toFixed(2) }}</td>
              <td>
                <span :class="['badge-estado', `estado-${orden.estado}`]">
                  {{ orden.estado.replace('_',' ') }}
                </span>
              </td>
              <td>{{ formatearFecha(orden.created_at || orden.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
          </div>

          <!-- ══ HISTORIAL DE ÓRDENES ══ -->
          <div class="section-card">
      <h2 class="section-title"> <v-icon name="hi-document-search" class="icon" /> Historial de órdenes</h2>

      <!-- Filtros -->
      <div class="historial-filtros">
        <div class="filtro-tabs">
          <button
            v-for="t in ['dia','mes','anio']"
            :key="t"
            :class="['filtro-tab', historial.tipo === t ? 'filtro-tab--active' : '']"
            @click="historial.tipo = t"
          >
            {{ t === 'dia' ? 'Por día' : t === 'mes' ? 'Por mes' : 'Por año' }}
          </button>
        </div>

        <!-- Input de fecha según tipo -->
        <div class="filtro-fecha">
          <input
            v-if="historial.tipo === 'dia'"
            v-model="historial.valor"
            type="date"
            class="date-input"
          >
          <input
            v-if="historial.tipo === 'mes'"
            v-model="historial.valor"
            type="month"
            class="date-input"
          >
          <input
            v-if="historial.tipo === 'anio'"
            v-model="historial.valor"
            type="number"
            class="date-input"
            placeholder="Ej. 2025"
            min="2024"
            :max="anioActual"
          >
          <button class="btn-filtrar" @click="cargarHistorial">
            Consultar
          </button>
        </div>
      </div>

      <!-- Resumen del período -->
      <div v-if="historial.datos" class="historial-resumen">
        <div class="resumen-pill">
          <span class="resumen-label">Total del período</span>
          <span class="resumen-valor naranja">
            ${{ historial.datos.totalPeriodo }}
          </span>
        </div>
        <div class="resumen-pill">
          <span class="resumen-label">Órdenes pagadas</span>
          <span class="resumen-valor">{{ historial.datos.cantidadOrdenes }}</span>
        </div>
      </div>

      <!-- Tabla historial -->
      <div v-if="historial.cargando" class="empty-text">Cargando historial...</div>
      <div v-else-if="historial.datos && historial.datos.ordenes.length === 0" class="empty-text">
        No hay órdenes pagadas en este período.
      </div>
      <table v-else-if="historial.datos" class="table">
        <thead>
          <tr>
            <th># Orden</th>
            <th>Mesa</th>
            <th>Mesero</th>
            <th>Método pago</th>
            <th>Total</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="orden in historial.datos.ordenes" :key="orden.id">
            <td class="td-bold">#{{ orden.id }}</td>
            <td>Mesa {{ orden.mesa?.numero }}</td>
            <td>{{ orden.mesero?.nombre_completo }}</td>
            <td class="td-capitalize">{{ orden.metodo_pago || '—' }}</td>
            <td class="td-naranja">${{ Number(orden.total).toFixed(2) }}</td>
            <td>{{ formatearFecha(orden.created_at || orden.createdAt) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Placeholder inicial -->
      <div v-else class="empty-text">
        Selecciona un período y presiona Consultar.
      </div>

          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import AppNavbar from '../../components/AppNavbar.vue';
import AppSidebar from '../../components/AppSidebar.vue';
import reporteService from '../../services/reporte.service';

// ── Estado principal ──
const resumen = reactive({
  totalVentas: '0.00',
  ordenesHoy: 0,
  ordenesActivas: 0
});

const topPlatillos = ref([]);
const terminoBusqueda = ref('');
const resultados = ref([]);
const buscando = ref(false);
let timeoutBusqueda = null;

const historial = reactive({
  tipo: 'dia',
  valor: '',
  datos: null,
  cargando: false
});

// Fecha legible del día actual
const fechaHoy = computed(() => {
  return new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric',
    month: 'long', day: 'numeric'
  });
});

const anioActual = computed(() => new Date().getFullYear());

onMounted(async () => {
  // Valor por defecto del historial: día de hoy
  const hoy = new Date();
  historial.valor = hoy.toISOString().split('T')[0];
  await cargarTodo();
});

onUnmounted(() => {
  clearTimeout(timeoutBusqueda);
});

// Cargar todas las secciones del dashboard
const cargarTodo = async () => {
  await Promise.all([cargarResumen(), cargarTopPlatillos()]);
};

const cargarResumen = async () => {
  try {
    const { data } = await reporteService.resumenHoy();
    resumen.totalVentas = data.data.totalVentas;
    resumen.ordenesHoy = data.data.ordenesHoy;
    resumen.ordenesActivas = data.data.ordenesActivas;
  } catch {
    console.error('Error al cargar resumen del día');
  }
};

const cargarTopPlatillos = async () => {
  try {
    const { data } = await reporteService.topPlatillos();
    topPlatillos.value = data.data;
  } catch {
    console.error('Error al cargar top platillos');
  }
};

// Buscador con debounce de 400ms para no saturar el backend
const buscarOrdenes = () => {
  clearTimeout(timeoutBusqueda);
  if (!terminoBusqueda.value.trim()) {
    resultados.value = [];
    buscando.value = false;
    return;
  }
  buscando.value = true;
  timeoutBusqueda = setTimeout(async () => {
    try {
      const { data } = await reporteService.buscar(terminoBusqueda.value);
      resultados.value = data.data;
    } catch {
      resultados.value = [];
    } finally {
      buscando.value = false;
    }
  }, 400);
};

const limpiarBusqueda = () => {
  clearTimeout(timeoutBusqueda);
  terminoBusqueda.value = '';
  resultados.value = [];
  buscando.value = false;
};

// Cargar historial según filtro seleccionado
const cargarHistorial = async () => {
  if (!historial.valor) return;
  historial.cargando = true;
  historial.datos = null;
  try {
    const { data } = await reporteService.historial(
      historial.tipo,
      historial.valor
    );
    historial.datos = data.data;
  } catch {
    console.error('Error al cargar historial');
  } finally {
    historial.cargando = false;
  }
};

// Formatear fecha legible en tabla
const formatearFecha = (fecha) => {
  const fechaNormalizada = new Date(fecha);
  if (Number.isNaN(fechaNormalizada.getTime())) return '--';

  return fechaNormalizada.toLocaleDateString('es-MX', {
    day: '2-digit', month: '2-digit',
    year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};
</script>

<style scoped>
.layout-content {
  display: flex;
}

.main-content {
  flex: 1;
}

.dashboard-page { padding: 32px; }

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
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
  text-transform: capitalize;
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

/* Tarjetas de métricas */
.metricas-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
@media (max-width: 768px) {
  .metricas-grid { grid-template-columns: 1fr; }
}
.metrica-card {
  background: var(--color-card);
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.metrica-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 8px;
}
.metrica-valor {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}
.metrica-valor.naranja { color: var(--color-primary); }
.metrica-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0;
}

/* Secciones genéricas */
.section-card {
  background: var(--color-card);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  margin-bottom: 24px;
}
.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 20px;
}

/* Top platillos */
.top-lista { display: flex; flex-direction: column; gap: 14px; }
.top-item { display: flex; flex-direction: column; gap: 6px; }
.top-item-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.top-pos {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-primary);
  min-width: 28px;
}
.top-nombre {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  flex: 1;
}
.top-cantidad {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-secondary);
}
.barra-contenedor {
  height: 8px;
  background: var(--color-bg);
  border-radius: 4px;
  overflow: hidden;
}
.barra-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 4px;
  transition: width 0.4s ease;
}

/* Buscador */
.buscador-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.search-input {
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: var(--color-text-primary);
  background: var(--color-bg);
  outline: none;
  transition: border-color 0.2s;
}
.search-input:focus { border-color: var(--color-primary); }
.btn-limpiar {
  padding: 10px 14px;
  background: #FEF2F2;
  color: var(--color-pendiente);
  border: 1.5px solid #FECACA;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
}

/* Historial filtros */
.historial-filtros {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}
.filtro-tabs { display: flex; gap: 6px; }
.filtro-tab {
  padding: 6px 16px;
  border-radius: 20px;
  border: 1.5px solid var(--color-border);
  background: white;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.2s;
}
.filtro-tab:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.filtro-tab--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}
.filtro-fecha { display: flex; gap: 10px; align-items: center; }
.date-input {
  padding: 8px 12px;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
  color: var(--color-text-primary);
  background: white;
  outline: none;
}
.date-input:focus { border-color: var(--color-primary); }
.btn-filtrar {
  padding: 8px 18px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-filtrar:hover { background: var(--color-primary-hover); }

/* Resumen del período */
.historial-resumen {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.resumen-pill {
  background: var(--color-bg);
  border-radius: 10px;
  padding: 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 160px;
}
.resumen-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.resumen-valor {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
}
.resumen-valor.naranja { color: var(--color-primary); }

/* Tabla compartida */
.table { width: 100%; border-collapse: collapse; font-size: 14px; }
.table thead tr {
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
}
.table th {
  padding: 10px 14px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
}
.table tbody tr:last-child td { border-bottom: none; }
.table tbody tr:hover { background: #F8FAFC; }
.td-bold { font-weight: 700; }
.td-naranja { font-weight: 700; color: var(--color-primary); }
.td-capitalize { text-transform: capitalize; }

/* Badges de estado */
.badge-estado {
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
}
.estado-pendiente { background: #FEF2F2; color: var(--color-pendiente); }
.estado-en_preparacion { background: #FFFBEB; color: var(--color-en_preparacion); }
.estado-listo { background: #ECFDF5; color: var(--color-listo); }
.estado-entregada { background: #F3F4F6; color: var(--color-finalizado); }
.estado-pagada { background: #F3F4F6; color: var(--color-finalizado); }
.estado-cancelada { background: #FEF2F2; color: var(--color-pendiente); }

/* Utilidades */
.empty-text {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 13px;
  padding: 24px 0;
}
.resultados { margin-top: 8px; }
</style>
