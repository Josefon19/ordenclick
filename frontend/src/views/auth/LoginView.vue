
<template>
  <div class="login-page">

    <!-- Contenedor centrado de la tarjeta -->
    <div class="login-card">

      <!-- Logo y nombre del sistema -->
      <div class="login-header">
        <div class="login-logo">
          <v-icon name="md-restaurant" class="logo-icon" />
        </div>
        <h1 class="login-title">OrdenClick</h1>
        <p class="login-subtitle">Sistema de gestión de restaurante</p>
      </div>

      <!-- Formulario -->
      <div class="login-form">

        <!-- Mensaje de error global -->
        <div v-if="error" class="alert alert-error">
          <v-icon name="md-warning" class="alert-icon" />
          <span>{{ error }}</span>
        </div>

        <!-- Campo correo -->
        <div class="form-group">
          <label class="form-label">Correo electrónico</label>
          <input
            v-model="form.correo"
            type="email"
            class="form-input"
            :class="{ 'input-error': errores.correo }"
            placeholder="correo@ejemplo.com"
            @keyup.enter="handleLogin"
          />
          <span v-if="errores.correo" class="field-error">{{ errores.correo }}</span>
        </div>

        <!-- Campo contraseña -->
        <div class="form-group">
          <label class="form-label">Contraseña</label>
          <div class="input-wrapper">
            <input
              v-model="form.password"
              :type="mostrarPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ 'input-error': errores.password }"
              placeholder="••••••••"
              @keyup.enter="handleLogin"
            />
            <!-- Toggle mostrar/ocultar contraseña -->
            <button
              type="button"
              class="toggle-password"
              @click="mostrarPassword = !mostrarPassword"
            >
              <v-icon name="md-visibility" v-if="!mostrarPassword" />
              <v-icon name="md-visibilityoff" v-else />
            </button>
          </div>
          <span v-if="errores.password" class="field-error">{{ errores.password }}</span>
        </div>

        <!-- Botón de ingreso -->
        <button
          class="btn-login"
          :disabled="cargando"
          @click="handleLogin"
        >
          <span v-if="cargando" class="spinner"></span>
          <span v-else>Iniciar sesión</span>
        </button>

      </div>

      <!-- Footer de la tarjeta -->
      <p class="login-footer">Solo personal autorizado</p>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

// Estado del formulario
const form = reactive({
  correo: '',
  password: ''
})

// Errores por campo
const errores = reactive({
  correo: '',
  password: ''
})

const error = ref('')        // Error global del servidor
const cargando = ref(false)  // Estado del botón
const mostrarPassword = ref(false)

// Validación del formulario antes de enviar
const validarFormulario = () => {
  let valido = true
  errores.correo = ''
  errores.password = ''

  if (!form.correo.trim()) {
    errores.correo = 'El correo es obligatorio.'
    valido = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
    errores.correo = 'Ingresa un correo válido.'
    valido = false
  }

  if (!form.password.trim()) {
    errores.password = 'La contraseña es obligatoria.'
    valido = false
  }

  return valido
}

// Redirigir al usuario según su rol después del login
const redirigirPorRol = (rol) => {
  const rutas = {
    administrador: '/admin/dashboard',
    mesero: '/mesero/ordenes',
    cocina: '/cocina'
  }
  router.push(rutas[rol] || '/login')
}

// Manejar el submit del login
const handleLogin = async () => {
  error.value = ''
  if (!validarFormulario()) return

  cargando.value = true
  try {
    await authStore.login({
      correo: form.correo,
      password: form.password
    })
    // Si el login fue exitoso, redirigir según rol
    redirigirPorRol(authStore.rolUsuario)
  } catch (err) {
    // Mostrar mensaje de error del servidor
    error.value = err.message || 'Credenciales incorrectas. Intenta de nuevo.'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
/* Pantalla completa centrada verticalmente */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg);
}

/* Tarjeta principal */
.login-card {
  background: var(--color-card);
  border-radius: 16px;
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

/* Header con logo */
.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  width: 72px;
  height: 72px;
  background-color: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.logo-icon {
  color: white;
  font-size: 36px;
}

.login-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 6px;
}

.login-subtitle {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

/* Grupos de campos */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.input-wrapper {
  position: relative;
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
  transition: border-color 0.2s;
  box-sizing: border-box;
  outline: none;
}

.form-input:focus {
  border-color: var(--color-primary);
}

.input-error {
  border-color: var(--color-pendiente) !important;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  padding: 0;
  color: var(--color-text-secondary);
  transition: color 0.2s;
}

.toggle-password:hover {
  color: var(--color-text-primary);
}

/* Mensajes de error por campo */
.field-error {
  display: block;
  font-size: 12px;
  color: var(--color-pendiente);
  margin-top: 4px;
}

/* Alerta de error global */
.alert {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-error {
  background-color: #FEF2F2;
  color: var(--color-pendiente);
  border: 1px solid #FECACA;
}

.alert-icon {
  font-size: 18px;
  flex-shrink: 0;
}

/* Botón principal */
.btn-login {
  width: 100%;
  padding: 12px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.btn-login:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Spinner de carga */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Footer */
.login-footer {
  text-align: center;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 24px;
  margin-bottom: 0;
}
</style>
