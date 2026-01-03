<!-- <template>
  <div class="max-w-3xl mx-auto">
    <div class="card">
      <div class="mb-6">
        <h2 class="text-2xl font-bold">System Settings</h2>
        <p class="text-dark-muted text-sm">
          {{
            isAdmin
              ? "Configure parking capacity and stream source"
              : "View Only (Admin access required)"
          }}
        </p>
      </div>

      <form @submit.prevent="handleSaveSettings" class="space-y-6">
        <div class="space-y-4">
          <h3 class="font-bold text-lg">Parking Capacity</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Max Mobil</label>
              <input
                v-model.number="form.max_mobil"
                type="number"
                min="1"
                class="input"
                :disabled="!isAdmin"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Max Motor</label>
              <input
                v-model.number="form.max_motor"
                type="number"
                min="1"
                class="input"
                :disabled="!isAdmin"
              />
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="font-bold text-lg">Stream Source</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Stream URL</label>
              <input
                v-model="form.stream_url"
                type="text"
                class="input"
                :disabled="!isAdmin"
              />
            </div>
          </div>
        </div>

        <div class="flex items-end gap-2">
          <button type="submit" class="btn btn-primary flex-1">Save</button>
          <button
            type="button"
            @click="loadSettings"
            class="btn btn-ghost flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template> -->

<!-- <script setup>
import { onMounted, reactive } from "vue";
import { useStore } from "vuex";
import { api } from "../utils/api";

const store = useStore();

const form = reactive({
  max_mobil: 0,
  max_motor: 0,
  stream_url: "",
});

const isAdmin = computed(() => store.getters["auth/isAdmin"]);

onMounted(() => {
  loadSettings();
});

const loadSettings = async () => {
  const { data } = await api.get("/settings");
  form.max_mobil = data.max_mobil;
  form.max_motor = data.max_motor;
  form.stream_url = data.stream_url;
};

const handleSaveSettings = async () => {
  await api.put("/settings", form);
  loadSettings();
};
</script> -->



<template>
  <div class="max-w-3xl mx-auto">
    <div class="card">
      <div class="mb-6">
        <h2 class="text-2xl font-bold">System Settings</h2>
        <p class="text-dark-muted text-sm">
          {{ isAdmin ? 'Configure parking capacity and stream source' : 'View Only (Admin access required)' }}
        </p>
      </div>

      <form @submit.prevent="handleSaveSettings" class="space-y-6">
        <!-- Parking Capacity -->
        <div class="space-y-4">
          <h3 class="font-bold text-lg">Parking Capacity</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Max Mobil</label>
              <input 
                v-model.number="form.max_mobil" 
                type="number" 
                min="1" 
                class="input" 
                :disabled="!isAdmin"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Max Motor</label>
              <input 
                v-model.number="form.max_motor" 
                type="number" 
                min="1" 
                class="input" 
                :disabled="!isAdmin"
              />
            </div>
          </div>
        </div>

        <!-- Stream Configuration -->
        <div class="space-y-4">
          <h3 class="font-bold text-lg">Stream Source</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Stream Type</label>
              <select v-model="form.stream_type" class="input" :disabled="!isAdmin">
                <option value="youtube">YouTube Live</option>
                <option value="rtsp">RTSP Camera</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Line Position (0.1 - 0.9)</label>
              <input 
                v-model.number="form.line_position" 
                type="number" 
                step="0.01" 
                min="0.1" 
                max="0.9" 
                class="input" 
                :disabled="!isAdmin"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Stream URL</label>
            <input 
              v-model="form.stream_url" 
              type="text" 
              class="input" 
              placeholder="https://youtube.com/... or rtsp://..."
              :disabled="!isAdmin"
            />
            <p class="text-xs text-dark-muted mt-1">
              YouTube: Paste live stream URL | RTSP: rtsp://username:password@ip:port/stream
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-4">
          <button v-if="isAdmin" type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save Settings' }}
          </button>
          <button type="button" @click="loadSettings" class="btn btn-ghost">
            Reload
          </button>
        </div>

        <p v-if="error" class="text-status-danger text-sm">{{ error }}</p>
        <p v-if="success" class="text-status-ok text-sm">{{ success }}</p>
      </form>

      <div class="mt-6 p-4 bg-dark-bg rounded-xl border border-dark-border">
        <p class="text-sm text-dark-muted">
          💡 <strong>Note:</strong> Setelah settings diubah, YOLO client akan otomatis reload stream jika menggunakan StreamSettingsUpdates gRPC.
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
  line_position: 0.6
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
    success.value = 'Settings saved successfully! YOLO will reload stream.'
    await loadSettings()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(loadSettings)
</script>