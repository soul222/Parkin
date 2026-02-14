<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
       :style="{ background: 'var(--login-bg)' }">
    <!-- Background pattern -->
    <div class="absolute inset-0">
      <div class="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-brand-secondary/5"></div>
      <div class="absolute top-0 left-0 w-96 h-96 bg-brand-secondary/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-0 w-80 h-80 bg-brand-primary/5 rounded-full blur-3xl"></div>
    </div>

    <!-- Register Card -->
    <div class="card-glass max-w-md w-full space-y-5 animate-slide-up relative z-10">
      <!-- Theme Toggle -->
      <div class="flex justify-end">
        <button 
          @click="themeStore.toggle()"
          class="p-2 rounded-xl transition-all"
          style="background: var(--surface-bg);"
        >
          {{ themeStore.isDark ? '🌙' : '☀️' }}
        </button>
      </div>

      <div class="text-center">
        <img 
          src="../assets/Logo.png" 
          alt="PARKIN" 
          class="mx-auto w-40 h-auto object-contain mb-3"
        />
        <h2 class="text-xl font-bold" style="color: var(--surface-text);">Daftar Akun Baru</h2>
        <p class="text-sm mt-1" style="color: var(--surface-muted);">Buat akun untuk mengakses sistem</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-3.5">
        <div>
          <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--surface-muted);">Nama Lengkap</label>
          <input v-model="form.nama" type="text" class="input text-base py-3" placeholder="Masukkan nama lengkap" required />
        </div>

        <div>
          <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--surface-muted);">Username</label>
          <input v-model="form.username" type="text" class="input text-base py-3" placeholder="Masukkan username" required autocomplete="username" />
        </div>

        <div>
          <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--surface-muted);">Email</label>
          <input v-model="form.email" type="email" class="input text-base py-3" placeholder="email@contoh.com" required />
        </div>

        <div>
          <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--surface-muted);">No. Handphone</label>
          <input v-model="form.no_hp" type="tel" class="input text-base py-3" placeholder="08xxxxxxxxxx" />
        </div>

        <div>
          <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--surface-muted);">Password</label>
          <input v-model="form.password" type="password" class="input text-base py-3" placeholder="Minimal 6 karakter" required autocomplete="new-password" />
        </div>

        <button type="submit" class="btn btn-primary w-full py-3.5 text-base" :disabled="loading">
          {{ loading ? 'Memproses...' : 'Daftar' }}
        </button>

        <p v-if="error" class="text-status-danger text-sm text-center bg-status-danger/10 rounded-lg py-2 px-3">{{ error }}</p>
        <p v-if="success" class="text-status-ok text-sm text-center bg-status-ok/10 rounded-lg py-2 px-3">{{ success }}</p>

        <p class="text-center text-sm" style="color: var(--surface-muted);">
          Sudah punya akun? 
          <router-link to="/login" class="text-brand-primary-light hover:underline font-medium">
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
import { useThemeStore } from '../stores/theme'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const form = ref({
  nama: '',
  username: '',
  email: '',
  no_hp: '',
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