import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'
import { registerSW } from 'virtual:pwa-register'
import { useThemeStore } from './stores/theme'

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New version available. Reload?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  }
})

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Initialize theme before mount
const themeStore = useThemeStore()
themeStore.init()

app.mount('#app')
