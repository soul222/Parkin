// import { defineStore } from 'pinia'
// import { ref, computed } from 'vue'
// import { api } from '../utils/api'

// export const useAuthStore = defineStore('auth', () => {
//   const token = ref(localStorage.getItem('token') || '')
//   const user = ref(null)

//   const isAuthenticated = computed(() => !!token.value)
//   const isAdmin = computed(() => user.value?.role === 'admin')

//   async function login(credentials) {
//     const res = await api.post('/auth/login', credentials)
//     token.value = res.token
//     user.value = res.user
//     localStorage.setItem('token', res.token)
//   }

//   async function register(data) {
//     await api.post('/auth/register', data)
//   }

//   async function logout() {
//     await api.post('/auth/logout')
//     token.value = ''
//     user.value = null
//     localStorage.removeItem('token')
//   }

//   async function fetchProfile() {
//     const res = await api.get('/users/profile')
//     user.value = res.data
//   }

//   return {
//     token,
//     user,
//     isAuthenticated,
//     isAdmin,
//     login,
//     register,
//     logout,
//     fetchProfile
//   }
// })


import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../utils/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(credentials) {
    const res = await api.post('/auth/login', credentials)
    token.value = res.token
    user.value = res.user
    localStorage.setItem('token', res.token)
  }

  async function register(data) {
    const response = await fetch(`${import.meta.env.DEV ? 'http://localhost:3000' : ''}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Registration failed')
    }
    
    return result
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      token.value = ''
      user.value = null
      localStorage.removeItem('token')
    }
  }

  async function fetchProfile() {
    const res = await api.get('/users/profile')
    user.value = res.data
  }

  // ✅ Validate token on app load
  async function validateToken() {
    if (!token.value) return false
    
    try {
      await fetchProfile()
      return true
    } catch (error) {
      // Token invalid/expired
      token.value = ''
      user.value = null
      localStorage.removeItem('token')
      return false
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchProfile,
    validateToken
  }
})