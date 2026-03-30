<template>
  <div class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
    <TransitionGroup name="toast-slide">
      <div 
        v-for="toast in toastStore.toasts" 
        :key="toast.id"
        :class="[
          'pointer-events-auto flex items-center p-4 w-full max-w-xs rounded-lg shadow-lg text-white',
          getBgColor(toast.type)
        ]"
        role="alert"
      >
        <div class="ml-3 text-sm font-medium mr-4">
          {{ toast.message }}
        </div>
        <button 
          @click="toastStore.removeToast(toast.id)"
          type="button" 
          class="ml-auto -mx-1.5 -my-1.5 focus:ring-2 focus:ring-white p-1.5 inline-flex h-8 w-8 hover:bg-black/10 rounded-lg transition-colors" 
          aria-label="Close"
        >
          <span class="sr-only">Close</span>
          <svg class="w-5 h-5 opacity-80" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToastStore } from '../stores/toast';

const toastStore = useToastStore();

const getBgColor = (type) => {
  switch (type) {
    case 'success': return 'bg-green-600 dark:bg-green-700';
    case 'error': return 'bg-red-600 dark:bg-red-700';
    case 'warning': return 'bg-yellow-500 dark:bg-yellow-600';
    case 'info':      
    default: return 'bg-blue-600 dark:bg-blue-700';
  }
};
</script>

<style scoped>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}
.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
