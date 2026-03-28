/**
 * Parking Store (Pinia)
 *
 * Mengelola:
 * - WebSocket connection & real-time stats
 * - Alarm sound & browser notification
 * - Status header: "Live" / "Connecting..." / "Offline"
 *
 * Logika status (sesuai feedback):
 * - Saat pertama connect: cek status user di DB
 * - Jika DB status 'online', tampilkan "Live" walau WS sedang (re)connect
 * - Hanya tampilkan "Reconnecting" jika DB status bukan 'online'
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { api } from "../utils/api";

export const useParkingStore = defineStore("parking", () => {
  // STATE
  const stats = ref({
    mobil: { terisi: 0, tersedia: 0, max_capacity: 30, count_in: 0, count_out: 0, is_full: false },
    motor: { terisi: 0, tersedia: 0, max_capacity: 30, count_in: 0, count_out: 0, is_full: false },
    total: { terisi: 0, tersedia: 0, max_capacity: 60, is_full: false },
  });

  const wsConnected = ref(false);
  const wsConnecting = ref(true);



  let ws = null;
  let lastAlarmAt = 0;
  // 30 detik antar alarm
  const ALARM_COOLDOWN_MS = 30_000; 

  /** Subscriber callbacks untuk real-time events */
  const listeners = new Set();

  // PUBSUB: Internal event emitter
  function onVehicleUpdate(callback) {
    listeners.add(callback);
    // Returns unsubscribe function
    return () => listeners.delete(callback); 
  }

  function notifyListeners(eventType, data) {
    listeners.forEach((cb) => {
      try {
        cb(eventType, data);
      } catch (err) {
        console.error("Listener error:", err);
      }
    });
  }

  // WEBSOCKET
  function requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((p) =>
        console.log(`🔔 Notification permission: ${p}`)
      );
    }
  }

  /**
   * Connect to WebSocket server.
   * Token tidak perlu dikirim via URL lagi — browser mengirim cookie
   * `access_token` secara otomatis saat WS handshake (same-origin/CORS).
   */
  function connectWebSocket() {
    wsConnecting.value = true;

    // Cookie dikirim otomatis oleh browser saat WS handshake
    const wsUrl = import.meta.env.DEV
      ? `ws://localhost:3000/ws`
      : `${import.meta.env.VITE_WS_URL || `wss://${window.location.host}/ws`}`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      wsConnected.value = true;
      wsConnecting.value = false;
      console.log("WebSocket connected");
      requestNotificationPermission();
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "vehicle_stats") {
        stats.value = msg.data;
        notifyListeners("stats", msg.data);
      }

      if (msg.type === "vehicle_log_new") {
        notifyListeners("new_log", msg.data);
      }

      if (msg.type === "parking_full") {
        triggerParkingFullAlert(msg.message || "Parkir sudah penuh!");
      }
    };

    ws.onclose = () => {
      wsConnected.value = false;
      wsConnecting.value = true;
      console.log("WebSocket disconnected, reconnecting in 3s...");
      setTimeout(() => connectWebSocket(), 3000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  function disconnect() {
    if (ws) {
      ws.close();
      ws = null;
    }
    wsConnected.value = false;
    wsConnecting.value = false;
  }

  // NOTIFICATIONS & ALARM
  function triggerParkingFullAlert(message) {
    showBrowserNotification("🚨 Parkir Penuh!", message);

    const now = Date.now();
    if (now - lastAlarmAt > ALARM_COOLDOWN_MS) {
      playAlarmSound();
      lastAlarmAt = now;
    }
  }

  function showBrowserNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        const notification = new Notification(title, {
          body,
          icon: "/images/icons/maskable_icon_x192.png",
          badge: "/images/icons/maskable_icon_x96.png",
          vibrate: [200, 100, 200],
          tag: "parking-full",
          renotify: true,
          requireInteraction: true,
        });
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
        setTimeout(() => notification.close(), 10000);
      } catch (err) {
        console.error("Notification error:", err);
      }
    }
  }

  function playAlarmSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();

      /** Play a single tone at a given start time */
      function playTone(freq, startTime, duration) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      }

      const now = audioCtx.currentTime;
      playTone(880, now, 0.3);
      playTone(880, now + 0.4, 0.3);
      playTone(1200, now + 0.8, 0.5);
      console.log("🔊 Alarm played");
    } catch (err) {
      console.error("Failed to play alarm:", err);
    }
  }

  return {
    stats,
    wsConnected,
    wsConnecting,
    connectWebSocket,
    disconnect,
    onVehicleUpdate,
  };
});