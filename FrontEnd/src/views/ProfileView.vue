<template>
  <div class="max-w-2xl mx-auto space-y-5">
    <div class="card">
      <h2 class="text-xl font-bold mb-5" style="color: var(--surface-text);">Profil Saya</h2>
      
      <form @submit.prevent="handleUpdateProfile" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--surface-muted);">Nama Lengkap</label>
            <input v-model="form.nama" type="text" class="input" />
          </div>
          <div>
            <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--surface-muted);">Username</label>
            <input v-model="form.username" type="text" class="input" />
          </div>
          <div>
            <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--surface-muted);">Email</label>
            <input v-model="form.email" type="email" class="input" />
          </div>
          <div>
            <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--surface-muted);">No. Handphone</label>
            <input v-model="form.no_hp" type="tel" class="input" placeholder="08xxxxxxxxxx" />
          </div>
        </div>

        <div class="pt-4" style="border-top: 1px solid var(--surface-border);">
          <h3 class="font-bold text-sm mb-3" style="color: var(--surface-text);">Ubah Password (Opsional)</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--surface-muted);">Password Lama</label>
              <input v-model="form.currentPassword" type="password" class="input" />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--surface-muted);">Password Baru</label>
              <input v-model="form.newPassword" type="password" class="input" />
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
          <button type="button" @click="resetForm" class="btn btn-ghost">
            Reset
          </button>
        </div>

        <p v-if="error" class="text-status-danger text-sm bg-status-danger/10 rounded-lg p-2">{{ error }}</p>
        <p v-if="success" class="text-status-ok text-sm bg-status-ok/10 rounded-lg p-2">{{ success }}</p>
      </form>
    </div>

    <!-- Account Info Card -->
    <div class="card">
      <h3 class="font-bold text-sm mb-3" style="color: var(--surface-text);">Info Akun</h3>
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p class="text-xs uppercase tracking-wider" style="color: var(--surface-muted);">Role</p>
          <span :class="['badge mt-1', user?.role === 'admin' ? 'bg-brand-primary/15 text-brand-primary-light' : '']"
                :style="user?.role !== 'admin' ? { background: 'var(--surface-border)', color: 'var(--surface-muted)' } : {}">
            {{ user?.role }}
          </span>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wider" style="color: var(--surface-muted);">Status</p>
          <span :class="['badge mt-1', user?.status === 'online' ? 'bg-status-ok/15 text-status-ok' : '']"
                :style="user?.status !== 'online' ? { background: 'var(--surface-border)', color: 'var(--surface-muted)' } : {}">
            {{ user?.status }}
          </span>
        </div>
        <div class="col-span-2">
          <p class="text-xs uppercase tracking-wider" style="color: var(--surface-muted);">Member Sejak</p>
          <p class="font-medium mt-1" style="color: var(--surface-text);">{{ formatTime(user?.created_at) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { api } from '../utils/api'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const form = reactive({
  nama: '',
  username: '',
  email: '',
  no_hp: '',
  currentPassword: '',
  newPassword: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')

function resetForm() {
  form.nama = user.value?.nama || ''
  form.username = user.value?.username || ''
  form.email = user.value?.email || ''
  form.no_hp = user.value?.no_hp || ''
  form.currentPassword = ''
  form.newPassword = ''
}

async function handleUpdateProfile() {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const payload = {
      nama: form.nama,
      username: form.username,
      email: form.email,
      no_hp: form.no_hp
    }

    if (form.newPassword) {
      payload.currentPassword = form.currentPassword
      payload.newPassword = form.newPassword
    }

    await api.put('/users/profile', payload)
    await authStore.fetchProfile()
    success.value = 'Profil berhasil diupdate!'
    form.currentPassword = ''
    form.newPassword = ''
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function formatTime(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long' })
}

onMounted(resetForm)
</script>