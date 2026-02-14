<template>
  <div class="space-y-5">
    <!-- Alert Status Banner -->
    <div :class="['alert-banner', alertBannerClass]">
      <div class="flex items-center justify-center gap-2">
        <span class="text-2xl">{{ alertIcon }}</span>
        <span>{{ alertMessage }}</span>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <!-- Mobil -->
      <div class="stat-card">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold uppercase tracking-wider" style="color: var(--surface-muted);">Mobil</span>
          <span class="text-xl">🚗</span>
        </div>
        <div class="text-3xl font-black" style="color: var(--surface-text);">
          {{ stats.mobil.terisi }}<span class="text-lg font-normal" style="color: var(--surface-muted);">/{{ stats.mobil.max_capacity }}</span>
        </div>
        <div class="w-full h-1.5 rounded-full mt-2 mb-2 overflow-hidden" style="background: var(--surface-bg);">
          <div 
            class="h-full rounded-full transition-all duration-500"
            :class="mobilPercentage >= 90 ? 'bg-status-danger' : mobilPercentage >= 70 ? 'bg-status-warn' : 'bg-brand-primary'"
            :style="{ width: mobilPercentage + '%' }"
          ></div>
        </div>
        <div class="flex justify-between text-xs" style="color: var(--surface-muted);">
          <span>Tersedia: {{ stats.mobil.tersedia }}</span>
          <span>IN {{ stats.mobil.count_in }} / OUT {{ stats.mobil.count_out }}</span>
        </div>
      </div>

      <!-- Motor -->
      <div class="stat-card">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold uppercase tracking-wider" style="color: var(--surface-muted);">Motor</span>
          <span class="text-xl">🏍️</span>
        </div>
        <div class="text-3xl font-black" style="color: var(--surface-text);">
          {{ stats.motor.terisi }}<span class="text-lg font-normal" style="color: var(--surface-muted);">/{{ stats.motor.max_capacity }}</span>
        </div>
        <div class="w-full h-1.5 rounded-full mt-2 mb-2 overflow-hidden" style="background: var(--surface-bg);">
          <div 
            class="h-full rounded-full transition-all duration-500"
            :class="motorPercentage >= 90 ? 'bg-status-danger' : motorPercentage >= 70 ? 'bg-status-warn' : 'bg-brand-secondary'"
            :style="{ width: motorPercentage + '%' }"
          ></div>
        </div>
        <div class="flex justify-between text-xs" style="color: var(--surface-muted);">
          <span>Tersedia: {{ stats.motor.tersedia }}</span>
          <span>IN {{ stats.motor.count_in }} / OUT {{ stats.motor.count_out }}</span>
        </div>
      </div>

      <!-- Total -->
      <div class="stat-card">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold uppercase tracking-wider" style="color: var(--surface-muted);">Total</span>
          <span class="text-xl">📊</span>
        </div>
        <div class="text-3xl font-black" style="color: var(--surface-text);">
          {{ stats.total.terisi }}<span class="text-lg font-normal" style="color: var(--surface-muted);">/{{ stats.total.max_capacity }}</span>
        </div>
        <div class="w-full h-1.5 rounded-full mt-2 mb-2 overflow-hidden" style="background: var(--surface-bg);">
          <div 
            class="h-full rounded-full transition-all duration-500"
            :class="totalPercentage >= 90 ? 'bg-status-danger' : totalPercentage >= 70 ? 'bg-status-warn' : 'bg-brand-accent'"
            :style="{ width: totalPercentage + '%' }"
          ></div>
        </div>
        <div class="text-xs" style="color: var(--surface-muted);">
          Tersedia: {{ stats.total.tersedia }}
        </div>
      </div>
    </div>

    <!-- Occupancy Chart -->
    <div class="card">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 class="text-lg font-bold" style="color: var(--surface-text);">Trend Okupansi</h2>
          <p class="text-xs" style="color: var(--surface-muted);">Real-time vehicle count (30 log terakhir)</p>
        </div>
        <button @click="loadHistoricalData" class="btn btn-ghost btn-sm">
          🔄 Reload
        </button>
      </div>
      <div class="relative" style="height: 280px;">
        <canvas ref="chartCanvas" class="w-full"></canvas>
      </div>
    </div>

    <!-- Recent Logs -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold" style="color: var(--surface-text);">Log Terbaru</h2>
        <button @click="loadLogs" class="btn btn-ghost btn-sm">🔄</button>
      </div>

      <div class="overflow-x-auto rounded-xl" style="border: 1px solid var(--surface-border);">
        <table class="table-auto">
          <thead style="background: var(--surface-bg);">
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
              <td colspan="5" class="text-center py-8" style="color: var(--surface-muted);">Belum ada log</td>
            </tr>
            <tr v-else v-for="log in logs" :key="log.id">
              <td class="font-mono text-xs">{{ log.id.slice(0, 8) }}</td>
              <td>
                <span class="capitalize">{{ log.jenis_kendaraan }}</span>
              </td>
              <td>
                <span :class="['badge', log.status === 'in' ? 'bg-status-ok/15 text-status-ok' : 'bg-status-danger/15 text-status-danger']">
                  {{ log.status.toUpperCase() }}
                </span>
              </td>
              <td>{{ log.track_id || '-' }}</td>
              <td class="text-xs" style="color: var(--surface-muted);">{{ formatTime(log.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useParkingStore } from '../stores/parking'
import { useThemeStore } from '../stores/theme'
import { api } from '../utils/api'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const parkingStore = useParkingStore()
const themeStore = useThemeStore()
const logs = ref([])
const chartCanvas = ref(null)
let chartInstance = null
let unsubscribe = null

const stats = computed(() => parkingStore.stats)

const mobilPercentage = computed(() => {
  const max = stats.value.mobil.max_capacity || 1
  return Math.min(100, (stats.value.mobil.terisi / max) * 100)
})

const motorPercentage = computed(() => {
  const max = stats.value.motor.max_capacity || 1
  return Math.min(100, (stats.value.motor.terisi / max) * 100)
})

const totalPercentage = computed(() => {
  const max = stats.value.total.max_capacity || 1
  return Math.min(100, (stats.value.total.terisi / max) * 100)
})

const alertBannerClass = computed(() => {
  if (stats.value.total.is_full) return 'alert-danger'
  if (stats.value.mobil.is_full || stats.value.motor.is_full) return 'alert-warn'
  return 'alert-ok'
})

const alertIcon = computed(() => {
  if (stats.value.total.is_full) return '🚨'
  if (stats.value.mobil.is_full) return '⚠️'
  if (stats.value.motor.is_full) return '⚠️'
  return '✅'
})

const alertMessage = computed(() => {
  if (stats.value.total.is_full) return 'PARKIR PENUH!'
  if (stats.value.mobil.is_full) return 'Parkir Mobil Penuh'
  if (stats.value.motor.is_full) return 'Parkir Motor Penuh'
  return 'Parkir Tersedia'
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
    const res = await api.get('/vehicles/logs?page=1&limit=30')
    const allLogs = res.data.logs || []
    createHistoricalChart(allLogs)
  } catch (error) {
    console.error('Failed to load historical data:', error)
  }
}

function getChartColors() {
  const muted = getComputedStyle(document.documentElement).getPropertyValue('--surface-muted').trim() || '#8899B4'
  const border = getComputedStyle(document.documentElement).getPropertyValue('--surface-border').trim() || '#1B3054'
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--surface-bg').trim() || '#0B1426'
  const text = getComputedStyle(document.documentElement).getPropertyValue('--surface-text').trim() || '#E8EDF5'
  const card = getComputedStyle(document.documentElement).getPropertyValue('--surface-card').trim() || '#0F1D32'
  return { muted, border, bg, text, card }
}

function createHistoricalChart(logsData) {
  if (!chartCanvas.value) return
  if (chartInstance) chartInstance.destroy()

  const colors = getChartColors()
  const timestamps = []
  const mobilCount = []
  const motorCount = []
  const totalCount = []
  
  let currentMobil = 0
  let currentMotor = 0
  
  const reversedLogs = [...logsData].reverse()
  
  reversedLogs.forEach(log => {
    if (log.jenis_kendaraan === 'mobil') {
      currentMobil += log.status === 'in' ? 1 : -1
    } else if (log.jenis_kendaraan === 'motor') {
      currentMotor += log.status === 'in' ? 1 : -1
    }
    
    currentMobil = Math.max(0, currentMobil)
    currentMotor = Math.max(0, currentMotor)
    
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
          borderColor: '#1E88E5',
          backgroundColor: 'rgba(30, 136, 229, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: '#1E88E5',
          borderWidth: 2
        },
        {
          label: 'Motor',
          data: motorCount,
          borderColor: '#43A047',
          backgroundColor: 'rgba(67, 160, 71, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: '#43A047',
          borderWidth: 2
        },
        {
          label: 'Total',
          data: totalCount,
          borderColor: '#FFB300',
          backgroundColor: 'rgba(255, 179, 0, 0.05)',
          tension: 0.4,
          fill: false,
          pointRadius: 2,
          pointHoverRadius: 5,
          pointBackgroundColor: '#FFB300',
          borderWidth: 2,
          borderDash: [5, 5]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { 
            color: colors.muted, 
            padding: 15,
            usePointStyle: true,
            font: { family: 'Inter', size: 12 }
          }
        },
        tooltip: {
          backgroundColor: colors.card,
          titleColor: colors.text,
          bodyColor: colors.muted,
          borderColor: colors.border,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 12,
          titleFont: { family: 'Inter', weight: '600' },
          bodyFont: { family: 'Inter' }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: colors.border + '66' },
          ticks: { color: colors.muted, stepSize: 1, font: { family: 'Inter', size: 11 } }
        },
        x: {
          grid: { display: false },
          ticks: { color: colors.muted, maxRotation: 45, minRotation: 45, font: { family: 'Inter', size: 10 } }
        }
      }
    }
  })
}

function formatTime(iso) {
  return new Date(iso).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
}

// Re-render chart when theme changes
watch(() => themeStore.isDark, () => {
  setTimeout(() => loadHistoricalData(), 100)
})

onMounted(async () => {
  await loadLogs()
  await loadHistoricalData()

  // Subscribe to real-time vehicle updates from WebSocket
  unsubscribe = parkingStore.onVehicleUpdate((eventType, data) => {
    if (eventType === 'new_log' || eventType === 'stats') {
      // Auto-refresh logs and chart when a new vehicle event comes in
      loadLogs()
      loadHistoricalData()
    }
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
  if (chartInstance) chartInstance.destroy()
})
</script>

<style scoped>
canvas { max-height: 280px; }
</style>