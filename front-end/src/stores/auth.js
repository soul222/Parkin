/**
 * Auth Store (Pinia)
 *
 * Menggunakan HttpOnly cookie untuk token — tidak ada token di localStorage.
 * Validasi sesi dilakukan via GET /api/users/profile (cookie dikirim otomatis).
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { api } from "../utils/api";

export const useAuthStore = defineStore("auth", () => {
  // Tidak ada token di state — token tersimpan di HttpOnly cookie (browser)
  const user = ref(null);

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === "admin");

  // LOGIN
  async function login(credentials) {
    const res = await api.post("/auth/login", credentials);
    // Server set cookie secara otomatis — kita hanya simpan user data
    user.value = res.user;
  }

  // REGISTER
  async function register(data) {
    const res = await api.post("/auth/register", data);
    return res;
  }

  // LOGOUT
  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local state regardless — server clears cookie
      user.value = null;
    }
  }

  // FETCH PROFILE (juga update local user state)

  async function fetchProfile() {
    const res = await api.get("/users/profile");
    user.value = res.data;
    return res.data;
  }


  // VALIDATE TOKEN — called on route enter
  // Uses cookie automatically via credentials: 'include'
  async function validateToken() {
    if (!isAuthenticated.value) {
      // Try to restore session from cookie (e.g. after page refresh)
      try {
        await fetchProfile();
        return true;
      } catch {
        user.value = null;
        return false;
      }
    }

    try {
      await fetchProfile();
      return true;
    } catch {
      user.value = null;
      return false;
    }
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchProfile,
    validateToken,
  };
});