<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-dark-bg to-dark-card">
    <div class="card max-w-md w-full space-y-6">
      <div class="text-center">
        <h1 class="text-3xl font-bold">Register Admin</h1>
        <p class="text-dark-muted mt-2">Buat akun admin baru</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Nama Lengkap</label>
          <input v-model="form.nama" type="text" class="input" required />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Username</label>
          <input v-model="form.username" type="text" class="input" required />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Email</label>
          <input v-model="form.email" type="email" class="input" required />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Password</label>
          <input v-model="form.password" type="password" class="input" required />
        </div>

        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          {{ loading ? 'Loading...' : 'Register' }}
        </button>

        <p v-if="error" class="text-status-danger text-sm text-center">{{ error }}</p>
        <p v-if="success" class="text-status-ok text-sm text-center">{{ success }}</p>

        <p class="text-center text-dark-muted text-sm">
          Sudah punya akun? 
          <router-link to="/login" class="text-brand-primary hover:underline">
            Login disini
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

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  nama: '',
  username: '',
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')

async function handleRegister() {
  loading.value = true
  error.value = ''
  success.value = ''
  
  try {
    await authStore.register(form.value)
    success.value = 'Registrasi berhasil! Redirecting...'
    setTimeout(() => router.push('/login'), 2000)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>