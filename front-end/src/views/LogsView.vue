<template>
  <div class="space-y-5">
    <div class="card">
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5"
      >
        <div>
          <h2 class="text-xl font-bold" style="color: var(--surface-text)">
            Vehicle Logs
          </h2>
          <p class="text-xs mt-0.5" style="color: var(--surface-muted)">
            Filter dan lihat riwayat kendaraan
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <select v-model="filters.jenis_kendaraan" class="input w-28 text-xs">
            <option value="">Semua</option>
            <option value="mobil">Mobil</option>
            <option value="motor">Motor</option>
          </select>

          <select v-model="filters.status" class="input w-24 text-xs">
            <option value="">Semua</option>
            <option value="in">IN</option>
            <option value="out">OUT</option>
          </select>

          <button @click="loadLogs" class="btn btn-ghost btn-sm">
            <font-awesome-icon :icon="['fas', 'sync']" class="mr-1.5" /> Reload
          </button>
        </div>
      </div>

      <!-- Date Filter for Export -->
      <div
        class="flex flex-col sm:flex-row gap-3 mb-5 p-4 rounded-xl"
        style="
          background: var(--surface-bg);
          border: 1px solid var(--surface-border);
        "
      >
        <div class="flex-1">
          <label
            class="block text-xs font-semibold mb-1 uppercase tracking-wider"
            style="color: var(--surface-muted)"
            >Tanggal Mulai</label
          >
          <input
            v-model="filters.start_date"
            type="date"
            class="input text-xs"
          />
        </div>
        <div class="flex-1">
          <label
            class="block text-xs font-semibold mb-1 uppercase tracking-wider"
            style="color: var(--surface-muted)"
            >Tanggal Akhir</label
          >
          <input v-model="filters.end_date" type="date" class="input text-xs" />
        </div>
        <div class="flex items-end gap-2">
          <button @click="applyDateFilter" class="btn btn-primary btn-sm">
            <font-awesome-icon :icon="['fas', 'search']" /> Filter
          </button>
          <button @click="clearDateFilter" class="btn btn-ghost btn-sm">
            Reset
          </button>
          <button
            @click="exportToCSV"
            class="btn btn-secondary btn-sm"
            :disabled="exportLoading"
          >
            <font-awesome-icon
              :icon="
                exportLoading ? ['fas', 'spinner'] : ['fas', 'file-arrow-down']
              "
              :spin="exportLoading"
            />
            Export CSV
          </button>
        </div>
      </div>

      <div
        class="overflow-x-auto rounded-xl"
        style="border: 1px solid var(--surface-border)"
      >
        <table class="table-auto">
          <thead style="background: var(--surface-bg)">
            <tr>
              <th>ID</th>
              <th>Jenis</th>
              <th>Status</th>
              <th>Track ID</th>
              <th>Waktu</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="py-4">
                <div class="animate-pulse space-y-3">
                  <div v-for="n in 5" :key="n" class="grid grid-cols-5 gap-4">
                    <div
                      v-for="i in 5"
                      :key="i"
                      class="h-4 bg-gray-300 rounded"
                    ></div>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-else-if="logs.length === 0">
              <td
                colspan="5"
                class="text-center py-8"
                style="color: var(--surface-muted)"
              >
                Tidak ada data
              </td>
            </tr>
            <tr v-else v-for="log in logs" :key="log.id">
              <td class="font-mono text-xs">{{ log.id.slice(0, 8) }}…</td>
              <td>
                <span class="capitalize text-sm">{{
                  log.jenis_kendaraan
                }}</span>
              </td>
              <td>
                <span
                  :class="[
                    'badge',
                    log.status === 'in'
                      ? 'bg-status-ok/15 text-status-ok'
                      : 'bg-status-danger/15 text-status-danger',
                  ]"
                >
                  {{ log.status.toUpperCase() }}
                </span>
              </td>
              <td>{{ log.track_id || "-" }}</td>
              <td class="text-xs" style="color: var(--surface-muted)">
                {{ formatTime(log.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        class="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4"
      >
        <div class="text-xs" style="color: var(--surface-muted)">
          Halaman {{ pagination.page }} dari {{ pagination.totalPages }} • Total
          {{ pagination.total }} log
        </div>

        <div class="flex gap-2">
          <button
            @click="prevPage"
            :disabled="pagination.page <= 1"
            class="btn btn-ghost btn-sm"
          >
            <font-awesome-icon :icon="['fas', 'chevron-left']" class="mr-1" />
            Prev
          </button>
          <button
            @click="nextPage"
            :disabled="pagination.page >= pagination.totalPages"
            class="btn btn-ghost btn-sm"
          >
            Next
            <font-awesome-icon :icon="['fas', 'chevron-right']" class="ml-1" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { api } from "../utils/api";

const logs = ref([]);
const loading = ref(false);
const exportLoading = ref(false);
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});

const filters = reactive({
  jenis_kendaraan: "",
  status: "",
  start_date: "",
  end_date: "",
});

function buildParams(overrides = {}) {
  const params = new URLSearchParams({
    page: overrides.page || pagination.page,
    limit: overrides.limit || pagination.limit,
  });
  if (filters.jenis_kendaraan)
    params.set("vehicle_type", filters.jenis_kendaraan);
  if (filters.status) params.set("status", filters.status);
  if (filters.start_date)
    params.set("start_date", new Date(filters.start_date).getTime());
  if (filters.end_date) {
    // Set end_date to end of day
    const end = new Date(filters.end_date);
    end.setHours(23, 59, 59, 999);
    params.set("end_date", end.getTime());
  }
  return params;
}

async function loadLogs() {
  loading.value = true;
  try {
    const params = buildParams();
    const res = await api.get(`/vehicles/logs?${params}`);
    logs.value = res.data.logs || [];
    Object.assign(pagination, res.data.pagination);
  } catch (error) {
    console.error("Failed to load logs:", error);
  } finally {
    loading.value = false;
  }
}

function applyDateFilter() {
  pagination.page = 1;
  loadLogs();
}

function clearDateFilter() {
  filters.start_date = "";
  filters.end_date = "";
  pagination.page = 1;
  loadLogs();
}

async function exportToCSV() {
  exportLoading.value = true;
  try {
    // Fetch ALL logs for the date range (up to 10000)
    const params = buildParams({ page: 1, limit: 10000 });
    const res = await api.get(`/vehicles/logs?${params}`);
    const allLogs = res.data.logs || [];

    if (allLogs.length === 0) {
      alert("Tidak ada data untuk di-export");
      return;
    }

    // Build CSV
    const headers = [
      "ID",
      "Jenis Kendaraan",
      "Status",
      "Track ID",
      "Confidence",
      "Waktu",
    ];
    const rows = allLogs.map((log) => [
      log.id,
      log.jenis_kendaraan,
      log.status.toUpperCase(),
      log.track_id || "",
      log.confidence || "",
      formatTimeCSV(log.created_at),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Generate filename with date range
    let filename = "vehicle_logs";
    if (filters.start_date) filename += `_from_${filters.start_date}`;
    if (filters.end_date) filename += `_to_${filters.end_date}`;
    if (filters.jenis_kendaraan) filename += `_${filters.jenis_kendaraan}`;
    if (filters.status) filename += `_${filters.status}`;
    filename += ".csv";

    // Download
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    console.log(`📥 Exported ${allLogs.length} logs to ${filename}`);
  } catch (error) {
    console.error("Export failed:", error);
    alert("Gagal export data: " + error.message);
  } finally {
    exportLoading.value = false;
  }
}

function prevPage() {
  if (pagination.page > 1) {
    pagination.page--;
    loadLogs();
  }
}

function nextPage() {
  if (pagination.page < pagination.totalPages) {
    pagination.page++;
    loadLogs();
  }
}

function formatTime(iso) {
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatTimeCSV(iso) {
  return new Date(iso).toLocaleString("id-ID", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

watch([() => filters.jenis_kendaraan, () => filters.status], () => {
  pagination.page = 1;
  loadLogs();
});

onMounted(loadLogs);
</script>
