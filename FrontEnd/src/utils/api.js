import { useAuthStore } from '../stores/auth'

const API_BASE = import.meta.env.DEV
  ? 'http://localhost:3000/api'
  : `${import.meta.env.VITE_API_URL || ''}/api`

class ApiClient {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token')
    const method = options.method || 'GET'
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    }

    const url = `${API_BASE}${endpoint}`

    try {
      const response = await fetch(url, config)
      const data = await response.json().catch(() => ({}))

      // ✅ Handle 401 Unauthorized (token expired/invalid)
      if (response.status === 401) {
        this.handleUnauthorized()
        throw new Error('Session expired. Please login again.')
      }

      // ✅ Handle 403 Forbidden
      if (response.status === 403) {
        throw new Error('Access forbidden')
      }

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`)
      }

      return data
    } catch (error) {
      // ✅ Handle network errors (backend down / offline)
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        console.warn('⚡ Network error, attempting cache fallback...')

        // For GET requests: try reading from Cache Storage
        if (method === 'GET') {
          const cached = await this.readFromCache(url)
          if (cached) {
            console.log('📦 Serving from cache:', endpoint)
            return cached
          }
        }

        // For mutations: they'll be queued by the Background Sync in service worker
        if (['POST', 'PUT', 'DELETE'].includes(method)) {
          console.log('📤 Request will be retried by Background Sync when online')
          throw new Error('Anda sedang offline. Perubahan akan disinkronkan saat koneksi kembali.')
        }

        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.')
      }
      throw error
    }
  }

  // Try to read a cached response from the service worker cache
  async readFromCache(url) {
    if (!('caches' in window)) return null
    
    try {
      const cache = await caches.open('api-cache')
      const response = await cache.match(url)
      if (response) {
        return await response.json()
      }
    } catch {
      // Cache read failed silently
    }
    return null
  }

  handleUnauthorized() {
    localStorage.removeItem('token')
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  get(endpoint) {
    return this.request(endpoint)
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    })
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    })
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }
}

export const api = new ApiClient()