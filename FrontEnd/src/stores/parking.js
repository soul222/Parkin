import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useParkingStore = defineStore('parking', () => {
  const stats = ref({
    mobil: { terisi: 0, tersedia: 0, max_capacity: 30, count_in: 0, count_out: 0, is_full: false },
    motor: { terisi: 0, tersedia: 0, max_capacity: 30, count_in: 0, count_out: 0, is_full: false },
    total: { terisi: 0, tersedia: 0, max_capacity: 60, is_full: false }
  })

  const wsConnected = ref(false)
  const wsConnecting = ref(true)
  let ws = null
  let alarmAudio = null
  let lastAlarmAt = 0
  const ALARM_COOLDOWN = 30000 // 30 seconds between alarms
  const listeners = new Set() // callbacks for real-time events

  function onVehicleUpdate(callback) {
    listeners.add(callback)
    return () => listeners.delete(callback) // return unsubscribe function
  }

  function notifyListeners(eventType, data) {
    listeners.forEach(cb => {
      try { cb(eventType, data) } catch (e) { console.error('Listener error:', e) }
    })
  }

  function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log(`🔔 Notification permission: ${permission}`)
      })
    }
  }

  function connectWebSocket(token) {
    wsConnecting.value = true

    const wsUrl = import.meta.env.DEV 
      ? `ws://localhost:3000/ws?token=${token}`
      : `${import.meta.env.VITE_WS_URL || `wss://${window.location.host}/ws`}?token=${token}`

    ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      wsConnected.value = true
      wsConnecting.value = false
      console.log('✅ WebSocket connected')
      // Request notification permission on connect
      requestNotificationPermission()
    }

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      
      if (msg.type === 'vehicle_stats') {
        stats.value = msg.data
        notifyListeners('stats', msg.data)
      }

      if (msg.type === 'vehicle_log_new') {
        // A new vehicle was detected — refresh stats and notify listeners
        notifyListeners('new_log', msg.data)
      }
      
      if (msg.type === 'parking_full') {
        // Auto notification: Browser push + alarm sound
        triggerParkingFullAlert(msg.message || 'Parkir sudah penuh!')
      }
    }

    ws.onclose = () => {
      wsConnected.value = false
      wsConnecting.value = true
      console.log('❌ WebSocket disconnected, reconnecting in 3s...')
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
    stopAlarm()
  }

  function triggerParkingFullAlert(message) {
    // 1. Browser Notification
    showBrowserNotification('🚨 Parkir Penuh!', message)
    
    // 2. Alarm sound with cooldown
    const now = Date.now()
    if (now - lastAlarmAt > ALARM_COOLDOWN) {
      playAlarmSound()
      lastAlarmAt = now
    }
  }

  function showBrowserNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          body,
          icon: '/images/icons/maskable_icon_x192.png',
          badge: '/images/icons/maskable_icon_x96.png',
          vibrate: [200, 100, 200],
          tag: 'parking-full',
          renotify: true,
          requireInteraction: true
        })

        notification.onclick = () => {
          window.focus()
          notification.close()
        }

        // Auto close after 10 seconds
        setTimeout(() => notification.close(), 10000)
      } catch (err) {
        console.error('Notification error:', err)
      }
    }
  }

  function playAlarmSound() {
    try {
      stopAlarm()
      
      // Generate alarm sound using Web Audio API
      const AudioContext = window.AudioContext || window.webkitAudioContext
      const audioCtx = new AudioContext()
      
      function playTone(freq, startTime, duration) {
        const oscillator = audioCtx.createOscillator()
        const gainNode = audioCtx.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioCtx.destination)
        
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(freq, startTime)
        gainNode.gain.setValueAtTime(0.3, startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
        
        oscillator.start(startTime)
        oscillator.stop(startTime + duration)
      }
      
      // Play 3 beeps
      const now = audioCtx.currentTime
      playTone(880, now, 0.3)
      playTone(880, now + 0.4, 0.3)
      playTone(1200, now + 0.8, 0.5)
      
      console.log('🔊 Alarm sound played')
    } catch (err) {
      console.error('Failed to play alarm:', err)
    }
  }

  function stopAlarm() {
    if (alarmAudio) {
      alarmAudio.pause()
      alarmAudio = null
    }
  }

  return {
    stats,
    wsConnected,
    wsConnecting,
    connectWebSocket,
    disconnect,
    onVehicleUpdate
  }
})