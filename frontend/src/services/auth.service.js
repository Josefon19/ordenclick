// Servicio que consume el endpoint de autenticación del backend

import api from './api'

const authService = {
  // POST /api/auth/login
  login: async (credenciales) => {
    const { data } = await api.post('/auth/login', credenciales)
    return data // { ok, mensaje, data: { token, usuario } }
  },

  // POST /api/auth/logout
  logout: async () => {
    const { data } = await api.post('/auth/logout')
    return data
  }
}

export default authService
