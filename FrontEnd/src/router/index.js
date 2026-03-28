import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/LoginView.vue"),
    meta: { requiresGuest: true },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/RegisterView.vue"),
    meta: { requiresGuest: true },
  },
  {
    path: "/offline",
    name: "Offline",
    component: () => import("../views/OfflineView.vue"),
  },
  {
    path: "/dashboard",
    component: () => import("../views/DashboardLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: "/dashboard/home" },
      { path: "home", name: "Home", component: () => import("../views/HomeView.vue") },
      { path: "logs", name: "Logs", component: () => import("../views/LogsView.vue") },
      { path: "users", name: "Users", component: () => import("../views/UsersView.vue") },
      { path: "profile", name: "Profile", component: () => import("../views/ProfileView.vue") },
      { path: "settings", name: "Settings", component: () => import("../views/SettingsView.vue") },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth) {
    // Saat offline: percaya state yang sudah ada (cookie tidak bisa dibaca JS)
    if (!navigator.onLine) {
      if (auth.isAuthenticated) {
        return next();
      }
      return next("/login");
    }

    // Saat online: validasi ke server (cookie dikirim otomatis)
    const isValid = await auth.validateToken();
    if (!isValid) {
      return next("/login");
    }
  }

  // Redirect ke dashboard jika sudah login dan akses halaman guest (login/register)
  if (to.meta.requiresGuest && auth.isAuthenticated) {
    return next("/dashboard/home");
  }

  next();
});

export default router;