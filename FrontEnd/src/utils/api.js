// const API_BASE = import.meta.env.DEV ? 'http://localhost:3000/api' : '/api'

// class ApiClient {
//   async request(endpoint, options = {}) {
//     const token = localStorage.getItem('token')
    
//     const config = {
//       ...options,
//       headers: {
//         'Content-Type': 'application/json',
//         ...(token && { Authorization: `Bearer ${token}` }),
//         ...options.headers
//       }
//     }

//     const response = await fetch(`${API_BASE}${endpoint}`, config)
//     const data = await response.json()

//     if (!response.ok) {
//       throw new Error(data.message || 'Request failed')
//     }

//     return data
//   }

//   get(endpoint) {
//     return this.request(endpoint)
//   }

//   post(endpoint, body) {
//     return this.request(endpoint, {
//       method: 'POST',
//       body: JSON.stringify(body)
//     })
//   }

//   put(endpoint, body) {
//     return this.request(endpoint, {
//       method: 'PUT',
//       body: JSON.stringify(body)
//     })
//   }

//   delete(endpoint) {
//     return this.request(endpoint, { method: 'DELETE' })
//   }
// }

// export const api = new ApiClient()


import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000/api' : '/api'

class ApiClient {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token')
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config)
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
      // ✅ Handle network errors (backend down)
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        console.error('❌ Backend connection failed')
        throw new Error('Cannot connect to server. Please check your connection.')
      }
      throw error
    }
  }

  handleUnauthorized() {
    // Clear auth state
    localStorage.removeItem('token')
    
    // Redirect to login
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