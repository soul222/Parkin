<template>
  <div class="space-y-6">
    <div class="card">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-2xl font-bold">Vehicle Logs</h2>
          <p class="text-dark-muted text-sm">Filter dan lihat riwayat kendaraan</p>
        </div>
        
        <div class="flex flex-wrap gap-2">
          <select v-model="filters.jenis_kendaraan" class="input w-32">
            <option value="">Semua</option>
            <option value="mobil">Mobil</option>
            <option value="motor">Motor</option>
          </select>
          
          <select v-model="filters.status" class="input w-32">
            <option value="">Semua</option>
            <option value="in">IN</option>
            <option value="out">OUT</option>
          </select>
          
          <button @click="loadLogs" class="btn btn-ghost">
            🔄 Reload
          </button>
        </div>
      </div>

      <div class="overflow-x-auto border border-dark-border rounded-xl">
        <table class="table-auto">
          <thead class="bg-dark-bg">
            <tr>
              <th>ID</th>
              <th>Jenis Kendaraan</th>
              <th>Status</th>
              <th>Track ID</th>
              <th>Waktu</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="text-center py-8 text-dark-muted">
                Loading...
              </td>
            </tr>
            <tr v-else-if="logs.length === 0">
              <td colspan="5" class="text-center py-8 text-dark-muted">
                Tidak ada data
              </td>
            </tr>
            <tr v-else v-for="log in logs" :key="log.id">
              <td class="font-mono text-xs">{{ log.id.slice(0, 8) }}...</td>
              <td>
                <span class="capitalize">{{ log.jenis_kendaraan }}</span>
              </td>
              <td>
                <span 
                  :class="[
                    'badge border-0',
                    log.status === 'in' 
                      ? 'bg-status-ok/20 text-status-ok' 
                      : 'bg-status-danger/20 text-status-danger'
                  ]"
                >
                  {{ log.status.toUpperCase() }}
                </span>
              </td>
              <td>{{ log.track_id || '-' }}</td>
              <td>{{ formatTime(log.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
        <div class="text-sm text-dark-muted">
          Page {{ pagination.page }} of {{ pagination.totalPages }} • 
          Total {{ pagination.total }} logs
        </div>
        
        <div class="flex gap-2">
          <button 
            @click="prevPage" 
            :disabled="pagination.page <= 1"
            class="btn btn-ghost"
          >
            ← Prev
          </button>
          <button 
            @click="nextPage" 
            :disabled="pagination.page >= pagination.totalPages"
            class="btn btn-ghost"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { api } from '../utils/api'

const logs = ref([])
const loading = ref(false)
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

const filters = reactive({
  jenis_kendaraan: '',
  status: ''
})

async function loadLogs() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: pagination.page,
      limit: pagination.limit,
      ...(filters.jenis_kendaraan && { vehicle_type: filters.jenis_kendaraan }),
      ...(filters.status && { status: filters.status })
    })

    const res = await api.get(`/vehicles/logs?${params}`)
    logs.value = res.data.logs || []
    Object.assign(pagination, res.data.pagination)
  } catch (error) {
    console.error('Failed to load logs:', error)
  } finally {
    loading.value = false
  }
}

function prevPage() {
  if (pagination.page > 1) {
    pagination.page--
    loadLogs()
  }
}

function nextPage() {
  if (pagination.page < pagination.totalPages) {
    pagination.page++
    loadLogs()
  }
}

function formatTime(iso) {
  return new Date(iso).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

watch(filters, () => {
  pagination.page = 1
  loadLogs()
})

onMounted(loadLogs)
</script>