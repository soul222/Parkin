<template>
  <div class="min-h-screen flex flex-col lg:flex-row">
    <!-- SIDEBAR (Desktop) -->
    <aside
      class="hidden lg:flex lg:flex-col lg:w-64 fixed h-full z-40"
      style="background: var(--surface-card); border-right: 1px solid var(--surface-border);"
    >
      <!-- Logo -->
      <div class="p-5" style="border-bottom: 1px solid var(--surface-border);">
        <div class="flex items-center gap-3">
          <img src="/images/icons/maskable_icon_x96.png" alt="PARKIN" class="w-10 h-10 rounded-xl" />
          <div>
            <h1 class="font-bold text-lg" style="color: var(--surface-text);">PARKIN</h1>
            <p class="text-[10px] tracking-wider uppercase" style="color: var(--surface-muted);">Sistem Parkir Cerdas</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
        <router-link
          v-for="route in navRoutes"
          :key="route.path"
          :to="route.path"
          class="nav-link"
          active-class="active"
        >
          <font-awesome-icon :icon="route.icon" class="w-4 h-4" />
          <span>{{ route.name }}</span>
        </router-link>
      </nav>

      <!-- Theme Toggle + User Info -->
      <div class="p-4" style="border-top: 1px solid var(--surface-border);">
        <!-- Theme Toggle -->
        <button
          @click="themeStore.toggle()"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-xl mb-3 transition-all duration-200 cursor-pointer"
          style="background: var(--surface-bg);"
        >
          <font-awesome-icon :icon="themeStore.isDark ? ['fas', 'moon'] : ['fas', 'sun']" class="w-4 h-4" />
          <span class="text-sm font-medium" style="color: var(--surface-text);">
            {{ themeStore.isDark ? "Dark Mode" : "Light Mode" }}
          </span>
          <div class="ml-auto theme-toggle" :class="{ 'is-dark': themeStore.isDark }"></div>
        </button>

        <!-- User Info + Connection Status -->
        <div class="flex items-center gap-3 mb-3">
          <template v-if="!user">
            <!-- SKELETON: Avatar -->
            <SkeletonShimmer width="36px" height="36px" borderRadius="100%" />
            <div class="flex-1 min-w-0 flex flex-col gap-1.5">
              <!-- SKELETON: Nama dan Role -->
              <SkeletonShimmer width="80%" height="14px" />
              <SkeletonShimmer width="40%" height="10px" />
            </div>
            <!-- SKELETON: Dot -->
            <SkeletonShimmer width="8px" height="8px" borderRadius="100%" />
          </template>
          
          <template v-else>
            <div class="w-9 h-9 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary-light font-bold text-sm">
              {{ userInitials }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate" style="color: var(--surface-text);">{{ user?.nama }}</p>
              <p class="text-[10px] uppercase tracking-wider" style="color: var(--surface-muted);">{{ user?.role }}</p>
            </div>
            <!-- Status dot: Live (green) / Connecting (yellow) / Offline (gray) -->
            <span
              :class="statusDotClass"
              :title="statusLabel"
            ></span>
          </template>
        </div>

        <button @click="handleLogout" class="btn btn-ghost btn-sm w-full">
          <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="mr-2" />
          Logout
        </button>
      </div>
    </aside>

    <!-- MOBILE HEADER -->
    <header
      class="lg:hidden sticky top-0 z-50 backdrop-blur-md"
      style="background: color-mix(in srgb, var(--surface-card) 95%, transparent); border-bottom: 1px solid var(--surface-border);"
    >
      <div class="flex items-center justify-between px-4 py-3">
        <div class="flex items-center gap-2.5">
          <img src="/images/icons/maskable_icon_x96.png" alt="PARKIN" class="w-8 h-8 rounded-lg" />
          <div>
            <h1 class="font-bold text-sm" style="color: var(--surface-text);">PARKIN</h1>
            <p class="text-[9px]" style="color: var(--surface-muted);">{{ user?.nama }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <!-- Mobile Theme Toggle -->
          <button
            @click="themeStore.toggle()"
            class="p-1.5 rounded-lg transition-all"
            style="background: var(--surface-bg);"
            :title="themeStore.isDark ? 'Dark Mode' : 'Light Mode'"
          >
            <font-awesome-icon :icon="themeStore.isDark ? ['fas', 'moon'] : ['fas', 'sun']" />
          </button>

          <!-- Mobile Connection Status Badge -->
          <span
            :class="['badge text-[10px]', statusBadgeClass]"
          >
            {{ statusLabel }}
          </span>

          <button @click="handleLogout" class="btn btn-ghost btn-sm py-1 px-2 text-xs">
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- MAIN CONTENT -->
    <main class="flex-1 lg:ml-64 pb-20 lg:pb-6">
      <!-- Offline Banner -->
      <Transition name="slide-down">
        <div
          v-if="isOffline"
          class="sticky top-0 z-30 px-4 py-2.5 text-center text-xs font-semibold"
          style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff;"
        >
          <font-awesome-icon :icon="['fas', 'wifi']" class="mr-1.5" />
          Anda sedang offline — data ditampilkan dari cache
        </div>
      </Transition>

      <div class="max-w-6xl mx-auto px-4 py-5 lg:py-6">
        <router-view />
      </div>
    </main>

    <!-- BOTTOM TAB BAR (Mobile) -->
    <nav
      class="lg:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom backdrop-blur-md"
      style="background: color-mix(in srgb, var(--surface-card) 95%, transparent); border-top: 1px solid var(--surface-border);"
    >
      <div class="flex justify-around">
        <router-link
          v-for="route in navRoutes"
          :key="route.path"
          :to="route.path"
          class="bottom-tab"
          active-class="active"
        >
          <font-awesome-icon :icon="route.icon" class="tab-icon" />
          <span>{{ route.shortName || route.name }}</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useParkingStore } from "../stores/parking";
import { useThemeStore } from "../stores/theme";
import SkeletonShimmer from "../components/SkeletonShimmer.vue";

const router = useRouter();
const authStore = useAuthStore();
const parkingStore = useParkingStore();
const themeStore = useThemeStore();

// USER & CONNECTION STATE
const user = computed(() => authStore.user);
const isOffline = ref(!navigator.onLine);

// isLive: true jika WS connected ATAU status DB user adalah 'online'
// (Mengikuti saran: jika status user online, jadikan indikator "Live" agar UX mulus)
const isLive = computed(() => parkingStore.wsConnected || user.value?.status === "online");
const wsConnecting = computed(() => !isLive.value && parkingStore.wsConnecting);

// STATUS HELPERS
const statusLabel = computed(() => {
  if (isLive.value) return "● Live";
  if (wsConnecting.value) return "◌ Connecting...";
  return "○ Offline";
});

const statusDotClass = computed(() => [
  "w-2 h-2 rounded-full",
  isLive.value
    ? "bg-status-ok animate-pulse-slow"
    : wsConnecting.value
    ? "bg-yellow-400 animate-pulse"
    : "bg-gray-400",
]);

const statusBadgeClass = computed(() => {
  if (isLive.value) return "bg-status-ok/15 text-status-ok";
  if (wsConnecting.value) return "bg-yellow-400/15 text-yellow-500";
  return "text-gray-400";
});

// USER INITIALS
const userInitials = computed(() => {
  const name = user.value?.nama || "";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
});

// NAVIGATION ROUTES
const navRoutes = [
  { path: "/dashboard/home", name: "Home", shortName: "Home", icon: ["fas", "house"] },
  { path: "/dashboard/logs", name: "Logs", shortName: "Logs", icon: ["fas", "clipboard-list"] },
  { path: "/dashboard/users", name: "Users", shortName: "Users", icon: ["fas", "users"] },
  { path: "/dashboard/profile", name: "Profile", shortName: "Profil", icon: ["fas", "user"] },
  { path: "/dashboard/settings", name: "Settings", shortName: "Setting", icon: ["fas", "gear"] },
];

// ONLINE / OFFLINE LISTENER
function updateOnlineStatus() {
  isOffline.value = !navigator.onLine;
}

onMounted(() => {
  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
});

onUnmounted(() => {
  window.removeEventListener("online", updateOnlineStatus);
  window.removeEventListener("offline", updateOnlineStatus);
});


// LOGOUT
async function handleLogout() {
  parkingStore.disconnect();
  await authStore.logout();
  router.push("/login");
}
</script>