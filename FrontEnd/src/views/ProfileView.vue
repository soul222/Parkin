<template>
  <div class="max-w-2xl mx-auto">
    <div class="card">
      <h2 class="text-2xl font-bold mb-6">My Profile</h2>
      
      <form @submit.prevent="handleUpdateProfile" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Nama Lengkap</label>
          <input v-model="form.nama" type="text" class="input" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Username</label>
          <input v-model="form.username" type="text" class="input" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Email</label>
          <input v-model="form.email" type="email" class="input" />
        </div>

        <div class="pt-4 border-t border-dark-border">
          <h3 class="font-bold mb-4">Change Password (Optional)</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Current Password</label>
              <input v-model="form.currentPassword" type="password" class="input" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">New Password</label>
              <input v-model="form.newPassword" type="password" class="input" />
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save Changes' }}
          </button>
          <button type="button" @click="resetForm" class="btn btn-ghost">
            Reset
          </button>
        </div>

        <p v-if="error" class="text-status-danger text-sm">{{ error }}</p>
        <p v-if="success" class="text-status-ok text-sm">{{ success }}</p>
      </form>

      <div class="mt-8 pt-6 border-t border-dark-border">
        <h3 class="font-bold mb-2">Account Info</h3>
        <div class="text-sm space-y-1 text-dark-muted">
          <p>Role: <span class="text-dark-text font-medium">{{ user?.role }}</span></p>
          <p>Status: <span class="text-dark-text font-medium">{{ user?.status }}</span></p>
          <p>Member since: <span class="text-dark-text font-medium">{{ formatTime(user?.created_at) }}</span></p>
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
      email: form.email
    }

    if (form.newPassword) {
      payload.currentPassword = form.currentPassword
      payload.newPassword = form.newPassword
    }

    await api.put('/users/profile', payload)
    await authStore.fetchProfile()
    success.value = 'Profile updated successfully!'
    form.currentPassword = ''
    form.newPassword = ''
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function formatTime(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long' })
}

onMounted(resetForm)
</script>