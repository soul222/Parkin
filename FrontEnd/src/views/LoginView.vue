<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-dark-bg to-dark-card">
    <div class="card max-w-md w-full space-y-6">
      <div class="text-center">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary 
                    flex items-center justify-center text-2xl font-black">
          SP
        </div>
        <h1 class="text-3xl font-bold">Smart Parking</h1>
        <p class="text-dark-muted mt-2">Login untuk melanjutkan</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Username</label>
          <input 
            v-model="form.username" 
            type="text" 
            class="input" 
            placeholder="Masukkan username"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Password</label>
          <input 
            v-model="form.password" 
            type="password" 
            class="input" 
            placeholder="Masukkan password"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          {{ loading ? 'Loading...' : 'Login' }}
        </button>

        <p v-if="error" class="text-status-danger text-sm text-center">{{ error }}</p>

        <p class="text-center text-dark-muted text-sm">
          Belum punya akun? 
          <router-link to="/register" class="text-brand-primary hover:underline">
            Daftar disini
          </router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useParkingStore } from '../stores/parking'

const router = useRouter()
const authStore = useAuthStore()
const parkingStore = useParkingStore()

const form = ref({ username: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  
  try {
    await authStore.login(form.value)
    await authStore.fetchProfile()
    parkingStore.connectWebSocket(authStore.token)
    router.push('/dashboard/home')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>