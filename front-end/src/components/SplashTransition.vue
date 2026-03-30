<template>
  <Transition name="splash">
    <div v-if="isActive" class="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center">
      <div class="bounce-container">
        <!-- Logo -->
        <img 
          src="/images/icons/maskable_icon_x192.png" 
          alt="Loading..." 
          class="w-24 h-24 rounded-2xl shadow-lg object-contain"
        />
        <!-- Shadow -->
        <div class="bounce-shadow mt-4"></div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

// Control local visibility
const isActive = ref(false);
const route = useRoute();

// Monitor global transitions involving Dashboard/Login boundaries
watch(() => route.path, (newPath, oldPath) => {
  // Hanya trigger saat perpindahan major (contoh: login -> dashboard atau dashboard -> login)
  if (
    (oldPath === '/login' && newPath?.startsWith('/dashboard')) || 
    (oldPath?.startsWith('/dashboard') && newPath === '/login')
  ) {
    isActive.value = true;
    setTimeout(() => {
      isActive.value = false;
    }, 1500); // 1.5 seconds splash screen
  }
}, { immediate: true });
</script>

<style scoped>
/* Transisi Muncul/Hilang Penuh Layar */
.splash-enter-active,
.splash-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.splash-enter-from,
.splash-leave-to {
  opacity: 0;
  transform: scale(1.05); /* Sedikit zoom out saat menghilang */
}

/* Animasi Bouncing (Loncat) */
.bounce-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bounce-container img {
  animation: bounce 0.6s cubic-bezier(0.28, 0.84, 0.42, 1) infinite alternate;
}

.bounce-shadow {
  width: 50px;
  height: 8px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 50%;
  animation: shadowScale 0.6s cubic-bezier(0.28, 0.84, 0.42, 1) infinite alternate;
}

@keyframes bounce {
  0% {
    transform: translateY(0) scaleY(0.9);
  }
  100% {
    transform: translateY(-40px) scaleY(1.05);
  }
}

@keyframes shadowScale {
  0% {
    transform: scale(1.2);
    background: rgba(0, 0, 0, 0.2);
  }
  100% {
    transform: scale(0.6);
    background: rgba(0, 0, 0, 0.05);
  }
}

/* Khusus Dark Mode bisa disesuaikan kalau dibutuhkan: */
:global(.dark) .bg-white.fixed {
  background-color: #0f172a; /* tailwind slate-900 */
}
</style>
