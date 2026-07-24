// Servicio que consume el endpoint de autenticación del backend

import api from './api'

const authService = {
  // POST /api/auth/login
  login: async (credenciales) => {
    try {
      const { data } = await api.post('/auth/login', credenciales)
      return data // { ok, mensaje, data: { token, usuario } }
    } catch (error) {
      throw new Error(
        error.response?.data?.mensaje || 'Credenciales incorrectas. Intenta de nuevo.'
      )
    }
  },

  // POST /api/auth/logout
  logout: async () => {
    const { data } = await api.post('/auth/logout')
    return data
  }
}

export default authService
