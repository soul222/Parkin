import { defineStore } from 'pinia';

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: []
  }),
  actions: {
    /**
     * @param {string} message - The message to display.
     * @param {string} type - 'success', 'error', 'info', or 'warning'.
     * @param {number} duration - Time in ms before the toast disappears.
     */
    addToast({ message, type = 'info', duration = 3000 }) {
      const id = Date.now() + Math.random();
      this.toasts.push({ id, message, type });

      // Automatically remove toast after duration
      if (duration > 0) {
        setTimeout(() => {
          this.removeToast(id);
        }, duration);
      }
    },
    removeToast(id) {
      const index = this.toasts.findIndex(t => t.id === id);
      if (index !== -1) {
        this.toasts.splice(index, 1);
      }
    }
  }
});
