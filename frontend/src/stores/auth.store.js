import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '../services/auth.service'

// Función auxiliar para leer de localStorage de forma segura
const leerLocalStorage = (clave) => {
  try {
    const valor = localStorage.getItem(clave)
    if (!valor) return null
    return JSON.parse(valor)
  } catch (e) {
    console.warn(`Error al leer ${clave} de localStorage:`, e)
    localStorage.removeItem(clave)
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {

  // Estado — leer de localStorage de forma segura
  const token = ref(localStorage.getItem('token') || null)
  const usuario = ref(leerLocalStorage('usuario'))

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const rolUsuario = computed(() => usuario.value?.rol || null)
  const nombreUsuario = computed(() => usuario.value?.nombre || '')

  // Acción: login
  const login = async (credenciales) => {
    const respuesta = await authService.login(credenciales)
    if (!respuesta.ok) throw new Error(respuesta.mensaje)

    // Guardar token y usuario en estado y localStorage
    token.value = respuesta.data.token
    usuario.value = respuesta.data.usuario
    localStorage.setItem('token', respuesta.data.token)
    localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario))
  }

  // Acción: logout
  const logout = async () => {
    try {
      await authService.logout()
    } catch (_) {
      // Si falla el logout en backend, limpiar igual en frontend
    } finally {
      token.value = null
      usuario.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/login'
    }
  }

  // Acción: restaurar sesión al recargar la página
  const cargarSesion = () => {
    const tokenGuardado = localStorage.getItem('token') || null
    const usuarioGuardado = leerLocalStorage('usuario')
    token.value = tokenGuardado
    usuario.value = usuarioGuardado
  }

  return {
    token, usuario,
    isAuthenticated, rolUsuario, nombreUsuario,
    login, logout, cargarSesion
  }
})
