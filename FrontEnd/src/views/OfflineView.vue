<template>
  <div class="min-h-screen flex items-center justify-center p-6" style="background: var(--surface-bg);">
    <div class="text-center max-w-md">
      <div class="text-6xl mb-4" style="color: var(--surface-muted);">
        <font-awesome-icon :icon="['fas', 'wifi']" />
      </div>
      <h1 class="text-2xl font-bold mb-2" style="color: var(--surface-text);">Anda Sedang Offline</h1>
      <p class="text-sm mb-6" style="color: var(--surface-muted);">
        Tidak ada koneksi internet. Beberapa data mungkin tidak tersedia.
        Halaman akan otomatis diperbarui saat koneksi kembali.
      </p>

      <div class="card p-4 mb-4" v-if="hasCachedData">
        <p class="text-xs font-semibold mb-2" style="color: var(--surface-muted);">
          <font-awesome-icon :icon="['fas', 'clipboard-list']" class="mr-1.5" /> Data Terakhir (Cache)
        </p>
        <p class="text-sm" style="color: var(--surface-text);">
          Data dashboard terakhir masih tersedia dari cache. Kembali ke dashboard untuk melihat.
        </p>
      </div>

      <div class="flex gap-3 justify-center">
        <button @click="goBack" class="btn btn-primary">
          ← Kembali
        </button>
        <button @click="retry" class="btn btn-ghost">
          <font-awesome-icon :icon="['fas', 'sync']" class="mr-1.5" /> Coba Lagi
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const hasCachedData = ref(false)

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/dashboard/home')
  }
}

function retry() {
  window.location.reload()
}

function handleOnline() {
  // Auto-redirect back when connection restored
  router.push('/dashboard/home')
}

onMounted(async () => {
  // Check if we have cached API data
  if ('caches' in window) {
    try {
      const cache = await caches.open('api-cache')
      const keys = await cache.keys()
      hasCachedData.value = keys.length > 0
    } catch {
      // Ignore cache errors
    }
  }

  window.addEventListener('online', handleOnline)
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
})
</script>
