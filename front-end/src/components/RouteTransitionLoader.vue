<template>
  <div v-if="isLoading" class="fixed top-0 left-0 w-full h-1 z-50 overflow-hidden">
    <div class="h-full bg-blue-600 dark:bg-blue-400 route-loader-bar"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoading = ref(false);

let beforeUnreg = null;
let afterUnreg = null;
let errorUnreg = null;

onMounted(() => {
  // Prevent memory leaks by properly saving unregister functions
  beforeUnreg = router.beforeEach((to, from, next) => {
    isLoading.value = true;
    next();
  });

  afterUnreg = router.afterEach(() => {
    // Small delay to make the loader visually recognizable even on fast transitions
    setTimeout(() => {
      isLoading.value = false;
    }, 300);
  });

  errorUnreg = router.onError(() => {
    isLoading.value = false;
  });
});

onBeforeUnmount(() => {
  // Cleanup event listeners to prevent memory leaks when component unmounts
  if (beforeUnreg) beforeUnreg();
  if (afterUnreg) afterUnreg();
  if (errorUnreg) errorUnreg();
});
</script>

<style scoped>
.route-loader-bar {
  width: 100%;
  transform-origin: left;
  animation: loading 1s infinite linear;
}

@keyframes loading {
  0% {
    transform: translateX(-100%) scaleX(0.2);
  }
  50% {
    transform: translateX(0) scaleX(0.5);
  }
  100% {
    transform: translateX(100%) scaleX(0.2);
  }
}
</style>
