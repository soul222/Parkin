import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useParkingStore = defineStore('parking', () => {
  const stats = ref({
    mobil: { terisi: 0, tersedia: 0, max_capacity: 30, count_in: 0, count_out: 0, is_full: false },
    motor: { terisi: 0, tersedia: 0, max_capacity: 30, count_in: 0, count_out: 0, is_full: false },
    total: { terisi: 0, tersedia: 0, max_capacity: 60, is_full: false }
  })

  const wsConnected = ref(false)
  let ws = null

  function connectWebSocket(token) {
    const wsUrl = import.meta.env.DEV 
      ? `ws://localhost:3000/ws?token=${token}`
      : `wss://${window.location.host}/ws?token=${token}`

    ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      wsConnected.value = true
      console.log('✅ WebSocket connected')
    }

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      
      if (msg.type === 'vehicle_stats') {
        stats.value = msg.data
      }
      
      if (msg.type === 'parking_full') {
        showNotification('Parkir Penuh!', msg.message)
      }
    }

    ws.onclose = () => {
      wsConnected.value = false
      console.log('❌ WebSocket disconnected')
      setTimeout(() => connectWebSocket(token), 3000)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  function disconnect() {
    if (ws) {
      ws.close()
      ws = null
    }
  }

  function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icons/icon-192.png' })
    }
  }

  return {
    stats,
    wsConnected,
    connectWebSocket,
    disconnect
  }
})