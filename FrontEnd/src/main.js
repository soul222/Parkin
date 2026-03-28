import { createApp } from "vue";
import { createPinia } from "pinia";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { registerSW } from "virtual:pwa-register";

import router from "./router";
import App from "./App.vue";

// Import icon registry (registers all icons to FA library)
import "./plugins/icons.js";

// Global styles
import "./assets/main.css";

// PWA Service Worker registration
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("Versi baru tersedia. Muat ulang sekarang?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("✅ App siap digunakan secara offline");
  },
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Register FontAwesome as global component
app.component("font-awesome-icon", FontAwesomeIcon);

// Initialize theme before mount (prevents flash of unstyled content)
import { useThemeStore } from "./stores/theme";
const themeStore = useThemeStore();
themeStore.init();

app.mount("#app");
