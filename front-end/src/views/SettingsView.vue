<template>
  <div class="max-w-3xl mx-auto space-y-5">
    <div class="card">
      <div class="mb-5">
        <h2 class="text-xl font-bold" style="color: var(--surface-text);">System Settings</h2>
        <p class="text-xs mt-0.5" style="color: var(--surface-muted);">
          {{ isAdmin ? 'Konfigurasi kapasitas parkir, stream, dan notifikasi' : 'View Only (Admin access required)' }}
        </p>
      </div>

      <form @submit.prevent="handleSaveSettings" class="space-y-6">
        <!-- Parking Capacity -->
        <div class="space-y-3">
          <h3 class="font-bold text-sm flex items-center gap-2" style="color: var(--surface-text);">
            <font-awesome-icon :icon="['fas', 'car']" /> Kapasitas Parkir
          </h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--surface-muted);">Max Mobil</label>
              <input v-model.number="form.max_mobil" type="number" min="1" class="input" :disabled="!isAdmin" />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--surface-muted);">Max Motor</label>
              <input v-model.number="form.max_motor" type="number" min="1" class="input" :disabled="!isAdmin" />
            </div>
          </div>
        </div>

        <!-- Stream Configuration -->
        <div class="space-y-3 pt-4" style="border-top: 1px solid var(--surface-border);">
          <h3 class="font-bold text-sm flex items-center gap-2" style="color: var(--surface-text);">
            <font-awesome-icon :icon="['fas', 'sliders']" /> Stream Source
          </h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--surface-muted);">Stream Type</label>
              <select v-model="form.stream_type" class="input" :disabled="!isAdmin">
                <option value="youtube">YouTube Live</option>
                <option value="rtsp">RTSP Camera</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--surface-muted);">Line Position (0.1 - 0.9)</label>
              <input v-model.number="form.line_position" type="number" step="0.01" min="0.1" max="0.9" class="input" :disabled="!isAdmin" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--surface-muted);">Stream URL</label>
            <input v-model="form.stream_url" type="text" class="input" placeholder="https://youtube.com/... atau rtsp://..." :disabled="!isAdmin" />
            <p class="text-[10px] mt-1" style="color: var(--surface-muted);">
              YouTube: URL live stream | RTSP: rtsp://user:pass@ip:port/stream
            </p>
          </div>
        </div>

        <!-- Discord Notification -->
        <div class="space-y-3 pt-4" style="border-top: 1px solid var(--surface-border);">
          <h3 class="font-bold text-sm flex items-center gap-2" style="color: var(--surface-text);">
            <font-awesome-icon :icon="['fas', 'bell']" /> Notifikasi Discord
          </h3>
          
          <div>
            <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--surface-muted);">Discord Webhook URL</label>
            <input v-model="form.discord_webhook_url" type="url" class="input" placeholder="https://discord.com/api/webhooks/..." :disabled="!isAdmin" />
            <p class="text-[10px] mt-1" style="color: var(--surface-muted);">
              Notifikasi otomatis via Discord saat parkir penuh. Buat webhook di Server Settings → Integrations.
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-4">
          <button v-if="isAdmin" type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Menyimpan...' : 'Simpan Settings' }}
          </button>
          <button type="button" @click="loadSettings" class="btn btn-ghost">
            Reload
          </button>
        </div>

        <p v-if="error" class="text-status-danger text-sm bg-status-danger/10 rounded-lg p-2">{{ error }}</p>
        <p v-if="success" class="text-status-ok text-sm bg-status-ok/10 rounded-lg p-2">{{ success }}</p>
      </form>

      <div class="mt-5 p-3 rounded-xl" style="background: var(--surface-bg); border: 1px solid var(--surface-border);">
        <p class="text-xs" style="color: var(--surface-muted);">
          <font-awesome-icon :icon="['fas', 'circle-info']" class="mr-1.5" />
          <strong>Note:</strong> Setelah settings diubah, YOLO client akan otomatis reload stream jika menggunakan gRPC StreamSettingsUpdates.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { api } from '../utils/api'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)

const form = reactive({
  max_mobil: 30,
  max_motor: 30,
  stream_type: 'youtube',
  stream_url: '',
  line_position: 0.6,
  discord_webhook_url: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')

async function loadSettings() {
  try {
    const res = await api.get('/settings')
    Object.assign(form, res.data)
  } catch (err) {
    error.value = 'Failed to load settings'
  }
}

async function handleSaveSettings() {
  if (!isAdmin.value) return

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    await api.put('/settings', form)
    success.value = 'Settings berhasil disimpan!'
    await loadSettings()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(loadSettings)
</script>