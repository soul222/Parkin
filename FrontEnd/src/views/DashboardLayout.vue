<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="sticky top-0 bg-dark-bg/95 backdrop-blur-sm border-b border-dark-border z-50">
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary 
                        flex items-center justify-center font-black">
              SP
            </div>
            <div>
              <h1 class="font-bold">Smart Parking</h1>
              <p class="text-xs text-dark-muted">{{ user?.nama }} • {{ user?.role }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span :class="['badge', wsConnected ? 'border-status-ok text-status-ok' : 'border-dark-border text-dark-muted']">
              {{ wsConnected ? '● Connected' : '○ Disconnected' }}
            </span>
            <button @click="handleLogout" class="btn btn-ghost btn-sm">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Navigation -->
    <nav class="border-b border-dark-border bg-dark-card/50">
      <div class="container mx-auto px-4">
        <div class="flex gap-2 overflow-x-auto py-2">
          <router-link
            v-for="route in routes"
            :key="route.path"
            :to="route.path"
            class="px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all"
            active-class="bg-brand-primary/20 text-brand-primary border border-brand-primary/30"
            inactive-class="hover:bg-dark-card"
          >
            {{ route.name }}
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Content -->
    <main class="container mx-auto px-4 py-6">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useParkingStore } from '../stores/parking'

const router = useRouter()
const authStore = useAuthStore()
const parkingStore = useParkingStore()

const user = computed(() => authStore.user)
const wsConnected = computed(() => parkingStore.wsConnected)

const routes = [
  { path: '/dashboard/home', name: 'Home' },
  { path: '/dashboard/logs', name: 'Logs' },
  { path: '/dashboard/users', name: 'Users' },
  { path: '/dashboard/profile', name: 'Profile' },
  { path: '/dashboard/settings', name: 'Settings' }
]

async function handleLogout() {
  parkingStore.disconnect()
  await authStore.logout()
  router.push('/login')
}
</script>