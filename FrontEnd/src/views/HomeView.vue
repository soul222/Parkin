<template>
  <div class="space-y-6">
    <!-- Alert Status -->
    <div :class="['card p-6 text-center font-bold text-xl', alertClass]">
      {{ alertMessage }}
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card">
        <div class="text-dark-muted text-sm mb-2">🚗 Mobil</div>
        <div class="text-4xl font-black mb-2">{{ stats.mobil.terisi }}/{{ stats.mobil.max_capacity }}</div>
        <div class="text-sm text-dark-muted">
          Tersedia: {{ stats.mobil.tersedia }} • IN {{ stats.mobil.count_in }} / OUT {{ stats.mobil.count_out }}
        </div>
      </div>

      <div class="card">
        <div class="text-dark-muted text-sm mb-2">🏍️ Motor</div>
        <div class="text-4xl font-black mb-2">{{ stats.motor.terisi }}/{{ stats.motor.max_capacity }}</div>
        <div class="text-sm text-dark-muted">
          Tersedia: {{ stats.motor.tersedia }} • IN {{ stats.motor.count_in }} / OUT {{ stats.motor.count_out }}
        </div>
      </div>

      <div class="card">
        <div class="text-dark-muted text-sm mb-2">📊 Total</div>
        <div class="text-4xl font-black mb-2">{{ stats.total.terisi }}/{{ stats.total.max_capacity }}</div>
        <div class="text-sm text-dark-muted">
          Tersedia: {{ stats.total.tersedia }}
        </div>
      </div>
    </div>

    <!-- Historical Chart -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-bold">Occupancy Trend (Last 30 Logs)</h2>
          <p class="text-sm text-dark-muted">Real-time vehicle count over time</p>
        </div>
        <button @click="loadHistoricalData" class="btn btn-ghost btn-sm">
          🔄 Reload
        </button>
      </div>
      <canvas ref="chartCanvas" class="w-full"></canvas>
    </div>

    <!-- Recent Logs Table -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">Log Terbaru (10 Recent)</h2>
        <button @click="loadLogs" class="btn btn-ghost btn-sm">🔄 Reload</button>
      </div>

      <div class="overflow-x-auto border border-dark-border rounded-xl">
        <table class="table-auto">
          <thead class="bg-dark-bg">
            <tr>
              <th>ID</th>
              <th>Jenis</th>
              <th>Status</th>
              <th>Track</th>
              <th>Waktu</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="logs.length === 0">
              <td colspan="5" class="text-center py-8 text-dark-muted">Belum ada log</td>
            </tr>
            <tr v-else v-for="log in logs" :key="log.id">
              <td class="font-mono text-xs">{{ log.id.slice(0, 8) }}</td>
              <td>{{ log.jenis_kendaraan }}</td>
              <td>
                <span :class="['badge border-0', log.status === 'in' ? 'bg-status-ok/20 text-status-ok' : 'bg-status-danger/20 text-status-danger']">
                  {{ log.status.toUpperCase() }}
                </span>
              </td>
              <td>{{ log.track_id || '-' }}</td>
              <td>{{ formatTime(log.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useParkingStore } from '../stores/parking'
import { api } from '../utils/api'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const parkingStore = useParkingStore()
const logs = ref([])
const chartCanvas = ref(null)
let chartInstance = null

const stats = computed(() => parkingStore.stats)

const alertClass = computed(() => {
  if (stats.value.total.is_full) return 'bg-status-danger/20 border-2 border-status-danger'
  if (stats.value.mobil.is_full || stats.value.motor.is_full) return 'bg-status-warn/20 border-2 border-status-warn'
  return 'bg-status-ok/20 border-2 border-status-ok'
})

const alertMessage = computed(() => {
  if (stats.value.total.is_full) return '🚨 PARKIR PENUH!'
  if (stats.value.mobil.is_full) return '⚠️ Parkir Mobil Penuh'
  if (stats.value.motor.is_full) return '⚠️ Parkir Motor Penuh'
  return '✅ Parkir Tersedia'
})

async function loadLogs() {
  try {
    const res = await api.get('/vehicles/logs?page=1&limit=10')
    logs.value = res.data.logs || []
  } catch (error) {
    console.error('Failed to load logs:', error)
  }
}

async function loadHistoricalData() {
  try {
    // Ambil 30 log terakhir untuk menghitung trend
    const res = await api.get('/vehicles/logs?page=1&limit=30')
    const allLogs = res.data.logs || []
    
    createHistoricalChart(allLogs)
  } catch (error) {
    console.error('Failed to load historical data:', error)
  }
}

function createHistoricalChart(logsData) {
  if (!chartCanvas.value) return
  
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Process logs to calculate occupancy over time
  const timestamps = []
  const mobilCount = []
  const motorCount = []
  const totalCount = []
  
  let currentMobil = 0
  let currentMotor = 0
  
  // Process logs in reverse (oldest to newest)
  const reversedLogs = [...logsData].reverse()
  
  reversedLogs.forEach(log => {
    // Update counts based on status
    if (log.jenis_kendaraan === 'mobil') {
      currentMobil += log.status === 'in' ? 1 : -1
    } else if (log.jenis_kendaraan === 'motor') {
      currentMotor += log.status === 'in' ? 1 : -1
    }
    
    // Prevent negative counts
    currentMobil = Math.max(0, currentMobil)
    currentMotor = Math.max(0, currentMotor)
    
    // Store data point
    const time = new Date(log.created_at)
    timestamps.push(time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }))
    mobilCount.push(currentMobil)
    motorCount.push(currentMotor)
    totalCount.push(currentMobil + currentMotor)
  })

  const ctx = chartCanvas.value.getContext('2d')
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: timestamps,
      datasets: [
        {
          label: 'Mobil',
          data: mobilCount,
          borderColor: '#4b8cff',
          backgroundColor: 'rgba(75, 140, 255, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5
        },
        {
          label: 'Motor',
          data: motorCount,
          borderColor: '#7a5cff',
          backgroundColor: 'rgba(122, 92, 255, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5
        },
        {
          label: 'Total',
          data: totalCount,
          borderColor: '#2bd67b',
          backgroundColor: 'rgba(43, 214, 123, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          labels: { color: '#e9eef7', padding: 15 }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 18, 24, 0.9)',
          titleColor: '#e9eef7',
          bodyColor: '#a7b0c0',
          borderColor: '#263043',
          borderWidth: 1,
          padding: 12,
          displayColors: true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#263043' },
          ticks: { 
            color: '#a7b0c0',
            stepSize: 1
          },
          title: {
            display: true,
            text: 'Vehicle Count',
            color: '#a7b0c0'
          }
        },
        x: {
          grid: { display: false },
          ticks: { 
            color: '#a7b0c0',
            maxRotation: 45,
            minRotation: 45
          },
          title: {
            display: true,
            text: 'Time',
            color: '#a7b0c0'
          }
        }
      }
    }
  })
}

function formatTime(iso) {
  return new Date(iso).toLocaleString('id-ID')
}

// Watch for stats changes from WebSocket
watch(stats, () => {
  // Optionally reload historical data when stats update significantly
}, { deep: true })

onMounted(async () => {
  await loadLogs()
  await loadHistoricalData()
})
</script>

<style scoped>
canvas {
  height: 350px !important;
  max-height: 350px;
}
</style>