<template>
  <Transition name="slide-up">
    <div 
      v-if="showBanner" 
      class="fixed bottom-0 left-0 right-0 z-[100] safe-bottom lg:bottom-4 lg:left-auto lg:right-4 lg:max-w-sm"
    >
      <div class="shadow-2xl px-4 py-3 flex items-center gap-3 backdrop-blur-md lg:rounded-2xl"
           style="background: var(--surface-card); border-top: 1px solid var(--surface-border);">
        <!-- Logo -->
        <img 
          src="/images/icons/maskable_icon_x96.png" 
          alt="PARKIN" 
          class="w-10 h-10 rounded-xl flex-shrink-0"
        />
        
        <!-- Text -->
        <div class="flex-1 min-w-0">
          <p class="font-bold text-sm" style="color: var(--surface-text);">Install PARKIN</p>
          <p class="text-xs" style="color: var(--surface-muted);">Akses lebih cepat & notifikasi real-time!</p>
        </div>

        <!-- Install Button -->
        <button 
          @click="handleInstall" 
          class="btn btn-primary btn-sm flex-shrink-0 py-2 px-4"
        >
          📲 Install
        </button>

        <!-- Dismiss -->
        <button 
          @click="dismissBanner" 
          class="transition-colors p-1 flex-shrink-0"
          style="color: var(--surface-muted);"
          aria-label="Tutup"
        >
          ✕
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const showBanner = ref(false)
let deferredPrompt = null

const DISMISS_KEY = 'parkin_install_dismissed'
const DISMISS_DAYS = 7

function isDismissed() {
  const dismissed = localStorage.getItem(DISMISS_KEY)
  if (!dismissed) return false
  const dismissedAt = new Date(dismissed)
  const now = new Date()
  const diffDays = (now - dismissedAt) / (1000 * 60 * 60 * 24)
  return diffDays < DISMISS_DAYS
}

function handleBeforeInstallPrompt(e) {
  e.preventDefault()
  deferredPrompt = e
  
  // Check if already installed or recently dismissed
  if (!isDismissed() && !window.matchMedia('(display-mode: standalone)').matches) {
    showBanner.value = true
  }
}

function handleAppInstalled() {
  showBanner.value = false
  deferredPrompt = null
  console.log('✅ PARKIN installed successfully!')
}

async function handleInstall() {
  if (!deferredPrompt) return
  
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  
  if (outcome === 'accepted') {
    console.log('✅ User accepted install')
  } else {
    console.log('❌ User dismissed install')
  }
  
  deferredPrompt = null
  showBanner.value = false
}

function dismissBanner() {
  showBanner.value = false
  localStorage.setItem(DISMISS_KEY, new Date().toISOString())
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)
  
  // Check if already standalone
  if (window.matchMedia('(display-mode: standalone)').matches) {
    showBanner.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('appinstalled', handleAppInstalled)
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
