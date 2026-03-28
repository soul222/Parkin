/**
 * API Client — Centralized HTTP client dengan:
 * - Cookie-based auth (HttpOnly, credentials: 'include')
 * - Auto-refresh token saat access token expired (401)
 * - Cache fallback saat offline (GET requests)
 * - Friendly error messages dalam Bahasa Indonesia
 */

const API_BASE = import.meta.env.DEV
  ? "/api"
  : `${import.meta.env.VITE_API_URL || ""}/api`;

class ApiClient {
  /** Track apakah sedang refresh token agar tidak double-refresh */
  #isRefreshing = false;
  /** Queue request yang menunggu refresh selesai */
  #refreshQueue = [];

  // CORE REQUEST
  async request(endpoint, options = {}) {
    const method = options.method || "GET";
    const url = `${API_BASE}${endpoint}`;

    const config = {
      ...options,
      credentials: "include", 
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      // Token expired → coba refresh satu kali lalu retry
      if (response.status === 401) {
        // Hindari loop jika refresh endpoint sendiri yang 401
        if (endpoint === "/auth/refresh" || endpoint === "/auth/logout") {
          this.#handleSessionExpired();
          throw new Error("Sesi berakhir. Mohon login kembali.");
        }
        return await this.#handleTokenExpired(url, config);
      }

      if (response.status === 403) {
        throw new Error("Maaf, akses ditolak");
      }

      if (!response.ok) {
        throw new Error(data.message || `Terjadi kesalahan pada sistem`);
      }

      return data;
    } catch (error) {
      // Network error (backend down / offline)
      if (error.name === "TypeError" || error.message === "Failed to fetch") {
        return await this.#handleNetworkError(method, url, error);
      }
      throw error;
    }
  }

  // TOKEN REFRESH (called on 401)
  async #handleTokenExpired(originalUrl, originalConfig) {
    // If refresh is in progress, queue this request
    if (this.#isRefreshing) {
      return new Promise((resolve, reject) => {
        this.#refreshQueue.push({ resolve, reject, url: originalUrl, config: originalConfig });
      });
    }

    this.#isRefreshing = true;

    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!refreshRes.ok) {
        throw new Error("Refresh gagal");
      }

      // Retry all queued requests
      this.#refreshQueue.forEach(({ resolve, url, config }) => {
        resolve(fetch(url, config).then((r) => r.json()));
      });

      // Retry the original request
      const retryRes = await fetch(originalUrl, originalConfig);
      return retryRes.json().catch(() => ({}));
    } catch {
      // Refresh failed — session truly expired
      this.#refreshQueue.forEach(({ reject }) => {
        reject(new Error("Sesi berakhir. Mohon login kembali."));
      });
      this.#handleSessionExpired();
      throw new Error("Sesi berakhir. Mohon login kembali.");
    } finally {
      this.#isRefreshing = false;
      this.#refreshQueue = [];
    }
  }


  async #handleNetworkError(method, url, originalError) {
    console.warn("Network error, attempting cache fallback...");

    if (method === "GET") {
      const cached = await this.#readFromCache(url);
      if (cached) {
        console.log("Serving from cache:", url);
        return cached;
      }
    }

    if (["POST", "PUT", "DELETE"].includes(method)) {
      throw new Error("Anda sedang offline. Perubahan akan disinkronkan saat koneksi kembali.");
    }

    throw new Error("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
  }

  /** Try to read a cached response from the service worker cache */
  async #readFromCache(url) {
    if (!("caches" in window)) return null;
    try {
      const cache = await caches.open("api-cache");
      const response = await cache.match(url);
      return response ? response.json() : null;
    } catch {
      return null;
    }
  }

  /** Clear cookies via logout (server clears them) and redirect to login */
  #handleSessionExpired() {
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  // CONVENIENCE METHODS
  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, body) {
    return this.request(endpoint, { method: "POST", body: JSON.stringify(body) });
  }

  put(endpoint, body) {
    return this.request(endpoint, { method: "PUT", body: JSON.stringify(body) });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiClient();