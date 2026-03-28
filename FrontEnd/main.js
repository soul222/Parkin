const API_BASE = "http://localhost:3000";
const WS_BASE = "ws://localhost:3000";

// env VAPID_PUBLIC_KEY
const VAPID_PUBLIC_KEY = "PASTE_VAPID_PUBLIC_KEY_HERE";

// ===== DOM =====
const loginSection = document.getElementById("loginSection");
const dashSection = document.getElementById("dashSection");

const usernameEl = document.getElementById("username");
const passwordEl = document.getElementById("password");
const btnLogin = document.getElementById("btnLogin");
const loginMsg = document.getElementById("loginMsg");

const btnLogout = document.getElementById("btnLogout");
const btnEnableNotif = document.getElementById("btnEnableNotif");
const connBadge = document.getElementById("connBadge");

// NAV + PAGES
const navItems = Array.from(document.querySelectorAll(".navItem"));
const pages = Array.from(document.querySelectorAll(".page"));

// HOME
const meInline = document.getElementById("meInline");
const alertBox = document.getElementById("alertBox");
const mobilMain = document.getElementById("mobilMain");
const mobilSub = document.getElementById("mobilSub");
const motorMain = document.getElementById("motorMain");
const motorSub = document.getElementById("motorSub");
const totalMain = document.getElementById("totalMain");
const totalSub = document.getElementById("totalSub");
const btnHomeReload = document.getElementById("btnHomeReload");
const homeLogsBody = document.getElementById("homeLogsBody");

// LOGS
const filterType = document.getElementById("filterType");
const filterStatus = document.getElementById("filterStatus");
const btnReloadLogs = document.getElementById("btnReloadLogs");
const logsBody = document.getElementById("logsBody");
const logsMeta = document.getElementById("logsMeta");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");

// USERS
const btnReloadUsers = document.getElementById("btnReloadUsers");
const btnOpenCreateUser = document.getElementById("btnOpenCreateUser");
const userFormWrap = document.getElementById("userFormWrap");
const btnCreateUser = document.getElementById("btnCreateUser");
const btnCancelUserForm = document.getElementById("btnCancelUserForm");
const userFormMsg = document.getElementById("userFormMsg");
const usersBody = document.getElementById("usersBody");
const uNama = document.getElementById("uNama");
const uUsername = document.getElementById("uUsername");
const uEmail = document.getElementById("uEmail");
const uPassword = document.getElementById("uPassword");
const uRole = document.getElementById("uRole");

// PROFILE
const pNama = document.getElementById("pNama");
const pUsername = document.getElementById("pUsername");
const pEmail = document.getElementById("pEmail");
const btnSaveProfile = document.getElementById("btnSaveProfile");
const profileMsg = document.getElementById("profileMsg");

// SETTINGS
const sMaxMobil = document.getElementById("sMaxMobil");
const sMaxMotor = document.getElementById("sMaxMotor");
const sStreamType = document.getElementById("sStreamType");
const sStreamUrl = document.getElementById("sStreamUrl");
const sLinePos = document.getElementById("sLinePos");
const btnSaveSettings = document.getElementById("btnSaveSettings");
const btnLoadSettings = document.getElementById("btnLoadSettings");
const settingsMsg = document.getElementById("settingsMsg");

// ===== State =====
let token = localStorage.getItem("token") || "";
let me = null;
let ws = null;

let logsPage = 1;
const logsLimit = 12;

// ===== Helpers =====
function setBadge(connected) {
  connBadge.textContent = connected ? "WS: Connected" : "WS: Disconnected";
  connBadge.className = "badge " + (connected ? "badge-green" : "badge-gray");
}

function showDash() {
  loginSection.classList.add("hidden");
  dashSection.classList.remove("hidden");
  btnLogout.disabled = false;
  btnEnableNotif.disabled = false;
}

function showLogin() {
  loginSection.classList.remove("hidden");
  dashSection.classList.add("hidden");
  btnLogout.disabled = true;
  btnEnableNotif.disabled = true;
  setBadge(false);
}

function setAlert(kind, text) {
  alertBox.textContent = text;
  alertBox.className = "alert " + kind;
}

function fmtTime(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

async function api(path, opts = {}) {
  const headers = opts.headers || {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(`${API_BASE}${path}`, { ...opts, headers });
}

function routeTo(pageName) {
  navItems.forEach((n) =>
    n.classList.toggle("active", n.dataset.page === pageName)
  );
  pages.forEach((p) =>
    p.classList.toggle("hidden", p.id !== `page-${pageName}`)
  );
}

// ===== Render Stats =====
function renderStats(stats) {
  mobilMain.textContent = `${stats.mobil.terisi}/${stats.mobil.max_capacity}`;
  mobilSub.textContent = `Tersedia: ${stats.mobil.tersedia} • IN ${stats.mobil.count_in} / OUT ${stats.mobil.count_out}`;

  motorMain.textContent = `${stats.motor.terisi}/${stats.motor.max_capacity}`;
  motorSub.textContent = `Tersedia: ${stats.motor.tersedia} • IN ${stats.motor.count_in} / OUT ${stats.motor.count_out}`;

  totalMain.textContent = `${stats.total.terisi}/${stats.total.max_capacity}`;
  totalSub.textContent = `Tersedia: ${stats.total.tersedia}`;

  if (stats.total.is_full) setAlert("danger", "PARKIR PENUH!");
  else if (stats.mobil.is_full || stats.motor.is_full)
    setAlert("warn", "Salah satu kategori penuh");
  else setAlert("ok", "Aman");
}

// ===== WS =====
function connectWS() {
  if (!token) return;

  try {
    ws = new WebSocket(`${WS_BASE}/ws?token=${encodeURIComponent(token)}`);

    ws.onopen = async () => {
      setBadge(true);
      // sync awal
      await loadStatsOnce(); 
    };

    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);

      if (msg.type === "vehicle_stats") {
        renderStats(msg.data);
      }

      if (msg.type === "vehicle_log_new") {
        prependHomeLog(msg.data);
      }

      if (msg.type === "parking_full") {
        setAlert("danger", msg.message || "PARKIR PENUH!");
      }
    };

    ws.onclose = () => {
      setBadge(false);
      setTimeout(connectWS, 1500);
    };

    ws.onerror = () => {
      setBadge(false);
      try {
        ws.close();
      } catch {}
    };
  } catch {
    setBadge(false);
  }
}

function prependHomeLog(log) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td class="mono">•</td>
    <td>${log.jenis_kendaraan}</td>
    <td>${log.status}</td>
    <td>${log.track_id ?? "-"}</td>
    <td>${fmtTime(log.created_at || new Date().toISOString())}</td>
  `;

  homeLogsBody.prepend(tr);

  // batas max 10 baris
  while (homeLogsBody.children.length > 10) {
    homeLogsBody.removeChild(homeLogsBody.lastChild);
  }
}

// ===== Push (PWA) =====
async function subscribePush() {
  if (!("serviceWorker" in navigator))
    throw new Error("Service worker tidak didukung");
  if (!("PushManager" in window))
    throw new Error("Push tidak didukung browser ini");

  const reg = await navigator.serviceWorker.register("/sw.js");
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return { ok: false, reason: "permission denied" };

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  const res = await api("/api/notifications/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sub),
  });

  if (!res.ok) throw new Error("Subscribe API failed");
  return { ok: true };
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

// ===== Data Loaders =====
async function loadMe() {
  const res = await api("/api/users/profile");
  if (!res.ok) throw new Error("Failed to load profile");
  const json = await res.json();
  me = json.data;
  meInline.textContent = `${me.nama} • ${me.role} • ${me.username}`;
  // fill profile form
  pNama.value = me.nama || "";
  pUsername.value = me.username || "";
  pEmail.value = me.email || "";
}

async function loadStatsOnce() {
  const res = await api("/api/vehicles/stats");
  if (!res.ok) return;
  const json = await res.json();
  renderStats(json.data);
}

async function loadHomeLogs() {
  const res = await api(`/api/vehicles/logs?page=1&limit=10`);
  if (!res.ok) {
    homeLogsBody.innerHTML = `<tr><td colspan="5" class="muted">Gagal load logs</td></tr>`;
    return;
  }
  const json = await res.json();
  const rows = json.data || [];
  if (!rows.length) {
    homeLogsBody.innerHTML = `<tr><td colspan="5" class="muted">Tidak ada data.</td></tr>`;
    return;
  }
  homeLogsBody.innerHTML = rows
    .map(
      (r) => `
    <tr>
      <td class="mono">${r.id.slice(0, 8)}…</td>
      <td>${r.jenis_kendaraan}</td>
      <td>${r.status}</td>
      <td>${r.track_id ?? "-"}</td>
      <td>${fmtTime(r.created_at)}</td>
    </tr>
  `
    )
    .join("");
}

async function loadLogs() {
  const type = filterType.value;
  const st = filterStatus.value;

  const qs = new URLSearchParams();
  qs.set("page", String(logsPage));
  qs.set("limit", String(logsLimit));
  if (type) qs.set("vehicle_type", type);
  if (st) qs.set("status", st);

  const res = await api(`/api/vehicles/logs?${qs.toString()}`);
  if (!res.ok) {
    logsBody.innerHTML = `<tr><td colspan="6" class="muted">Gagal load logs</td></tr>`;
    return;
  }

  const json = await res.json();
  const rows = json.data || [];
  const pagination = json.pagination;

  if (!rows.length) {
    logsBody.innerHTML = `<tr><td colspan="6" class="muted">Tidak ada data.</td></tr>`;
  } else {
    logsBody.innerHTML = rows
      .map(
        (r) => `
      <tr>
        <td class="mono">${r.id.slice(0, 8)}…</td>
        <td>${r.jenis_kendaraan}</td>
        <td>${r.status}</td>
        <td>${r.track_id ?? "-"}</td>
        <td>${(r.confidence ?? "-").toString()}</td>
        <td>${fmtTime(r.created_at)}</td>
      </tr>
    `
      )
      .join("");
  }

  logsMeta.textContent = `Page ${pagination.page}/${pagination.totalPages} • Total ${pagination.total}`;
  btnPrev.disabled = pagination.page <= 1;
  btnNext.disabled = pagination.page >= pagination.totalPages;
}

async function loadUsers() {
  const res = await api("/api/users");
  if (!res.ok) {
    usersBody.innerHTML = `<tr><td colspan="8" class="muted">Gagal load users</td></tr>`;
    return;
  }
  const json = await res.json();
  const rows = json.data || [];

  const isAdmin = me?.role === "admin";
  btnOpenCreateUser.disabled = !isAdmin;

  if (!rows.length) {
    usersBody.innerHTML = `<tr><td colspan="8" class="muted">Tidak ada data.</td></tr>`;
    return;
  }

  usersBody.innerHTML = rows
    .map(
      (u) => `
    <tr>
      <td class="mono">${u.id.slice(0, 8)}…</td>
      <td>${u.nama}</td>
      <td>${u.username}</td>
      <td>${u.email}</td>
      <td>${u.role}</td>
      <td>${u.status}</td>
      <td>${fmtTime(u.created_at)}</td>
      <td>
        ${
          isAdmin
            ? `
          <button class="btn btn-ghost btnTiny" data-act="del" data-id="${u.id}">Del</button>
        `
            : `<span class="muted small">-</span>`
        }
      </td>
    </tr>
  `
    )
    .join("");

  // attach delete handlers (admin only)
  if (isAdmin) {
    usersBody.querySelectorAll("[data-act='del']").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!confirm("Hapus user ini?")) return;
        const r = await api(`/api/users/${id}`, { method: "DELETE" });
        if (!r.ok) alert("Gagal delete user");
        await loadUsers();
      });
    });
  }
}

async function loadSettings() {
  const res = await api("/api/settings");
  if (!res.ok) {
    settingsMsg.textContent = "Gagal load settings";
    return;
  }
  const json = await res.json();
  const s = json.data;

  sMaxMobil.value = s.max_mobil ?? 30;
  sMaxMotor.value = s.max_motor ?? 30;
  sStreamType.value = s.stream_type ?? "youtube";
  sStreamUrl.value = s.stream_url ?? "";
  sLinePos.value = typeof s.line_position === "number" ? s.line_position : 0.6;

  // admin only enable
  const isAdmin = me?.role === "admin";
  [
    sMaxMobil,
    sMaxMotor,
    sStreamType,
    sStreamUrl,
    sLinePos,
    btnSaveSettings,
  ].forEach((el) => (el.disabled = !isAdmin));
  settingsMsg.textContent = isAdmin
    ? ""
    : "Role security hanya bisa melihat settings.";
}

// ===== Actions =====
navItems.forEach((n) => {
  n.addEventListener("click", async () => {
    const page = n.dataset.page;
    routeTo(page);

    // lazy load per page
    if (page === "home") await loadHomeLogs();
    if (page === "logs") await loadLogs();
    if (page === "users") await loadUsers();
    if (page === "settings") await loadSettings();
  });
});

btnLogin.addEventListener("click", async () => {
  loginMsg.textContent = "Logging in...";

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: usernameEl.value.trim(),
        password: passwordEl.value,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || "Login failed");

    token = json.token;
    localStorage.setItem("token", token);

    showDash();
    await loadMe();
    await loadStatsOnce();
    await loadHomeLogs();

    routeTo("home");
    connectWS();

    loginMsg.textContent = `Login OK (${json.user.role})`;
  } catch (e) {
    loginMsg.textContent = e.message;
  }
});

btnLogout.addEventListener("click", async () => {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } catch {}
  token = "";
  me = null;
  localStorage.removeItem("token");
  try {
    ws?.close();
  } catch {}
  showLogin();
});

btnEnableNotif.addEventListener("click", async () => {
  try {
    const res = await subscribePush();
    alert(res.ok ? "Notif aktif" : `Gagal: ${res.reason}`);
  } catch (e) {
    alert("Gagal subscribe push: " + e.message);
  }
});

// HOME reload
btnHomeReload.addEventListener("click", loadHomeLogs);

// LOGS
btnReloadLogs.addEventListener("click", async () => {
  logsPage = 1;
  await loadLogs();
});
btnPrev.addEventListener("click", async () => {
  if (logsPage > 1) logsPage -= 1;
  await loadLogs();
});
btnNext.addEventListener("click", async () => {
  logsPage += 1;
  await loadLogs();
});

// USERS
btnReloadUsers.addEventListener("click", loadUsers);

btnOpenCreateUser.addEventListener("click", () => {
  if (me?.role !== "admin") return;
  userFormWrap.classList.remove("hidden");
  userFormMsg.textContent = "";
});

btnCancelUserForm.addEventListener("click", () => {
  userFormWrap.classList.add("hidden");
  userFormMsg.textContent = "";
});

btnCreateUser.addEventListener("click", async () => {
  if (me?.role !== "admin") return;

  userFormMsg.textContent = "Saving...";
  const payload = {
    nama: uNama.value.trim(),
    username: uUsername.value.trim(),
    email: uEmail.value.trim(),
    password: uPassword.value,
    role: uRole.value,
  };

  try {
    const res = await api("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || "Create user failed");

    userFormMsg.textContent = "Saved";
    uNama.value = "";
    uUsername.value = "";
    uEmail.value = "";
    uPassword.value = "";
    userFormWrap.classList.add("hidden");
    await loadUsers();
  } catch (e) {
    userFormMsg.textContent = e.message;
  }
});

// PROFILE
btnSaveProfile.addEventListener("click", async () => {
  profileMsg.textContent = "Saving...";
  try {
    const res = await api("/api/users/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama: pNama.value.trim(),
        username: pUsername.value.trim(),
        email: pEmail.value.trim(),
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || "Update profile failed");
    profileMsg.textContent = "Saved";
    await loadMe();
  } catch (e) {
    profileMsg.textContent = e.message;
  }
});

// SETTINGS
btnLoadSettings.addEventListener("click", loadSettings);

btnSaveSettings.addEventListener("click", async () => {
  if (me?.role !== "admin") return;

  settingsMsg.textContent = "Saving...";
  try {
    const res = await api("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        max_mobil: parseInt(sMaxMobil.value, 10),
        max_motor: parseInt(sMaxMotor.value, 10),
        stream_type: sStreamType.value,
        stream_url: sStreamUrl.value.trim(),
        line_position: parseFloat(sLinePos.value),
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || "Update settings failed");
    settingsMsg.textContent =
      "Saved ✅ (YOLO akan reload jika listen stream updates)";
    await loadSettings();
  } catch (e) {
    settingsMsg.textContent = e.message;
  }
});

// ===== Init =====
(async function init() {
  if (!token) {
    showLogin();
    return;
  }

  try {
    showDash();
    await loadMe();
    await loadStatsOnce();
    await loadHomeLogs();
    routeTo("home");
    connectWS();
  } catch {
    token = "";
    localStorage.removeItem("token");
    showLogin();
  }
})();
