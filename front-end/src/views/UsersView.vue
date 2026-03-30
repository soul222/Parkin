<template>
  <div class="space-y-5">
    <div class="card">
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5"
      >
        <div>
          <h2 class="text-xl font-bold" style="color: var(--surface-text)">
            User Management
          </h2>
          <p class="text-xs mt-0.5" style="color: var(--surface-muted)">
            {{
              isAdmin ? "Admin: Full CRUD • Security: Read Only" : "Read Only"
            }}
          </p>
        </div>

        <div class="flex gap-2">
          <button @click="loadUsers" class="btn btn-ghost btn-sm">
            <font-awesome-icon :icon="['fas', 'sync']" class="mr-1.5" /> Reload
          </button>
          <button
            v-if="isAdmin"
            @click="openCreateForm"
            class="btn btn-primary btn-sm"
          >
            <font-awesome-icon :icon="['fas', 'plus']" class="mr-1.5" /> User
            Baru
          </button>
        </div>
      </div>

      <!-- Create/Edit User Form -->
      <Transition name="slide">
        <div
          v-if="showForm && isAdmin"
          class="mb-5 p-4 rounded-xl"
          style="
            background: var(--surface-bg);
            border: 1px solid var(--surface-border);
          "
        >
          <h3 class="font-bold text-sm mb-4" style="color: var(--surface-text)">
            {{ editMode ? "Edit User" : "Buat User Baru" }}
          </h3>
          <form
            @submit.prevent="handleSubmit"
            class="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            <div>
              <label
                class="block text-xs font-semibold mb-1 uppercase tracking-wider"
                style="color: var(--surface-muted)"
                >Nama *</label
              >
              <input v-model="form.nama" type="text" class="input" required />
            </div>
            <div>
              <label
                class="block text-xs font-semibold mb-1 uppercase tracking-wider"
                style="color: var(--surface-muted)"
                >Username *</label
              >
              <input
                v-model="form.username"
                type="text"
                class="input"
                required
                :disabled="editMode"
              />
              <p
                v-if="editMode"
                class="text-[10px] mt-0.5"
                style="color: var(--surface-muted)"
              >
                Username tidak bisa diubah
              </p>
            </div>
            <div>
              <label
                class="block text-xs font-semibold mb-1 uppercase tracking-wider"
                style="color: var(--surface-muted)"
                >Email *</label
              >
              <input v-model="form.email" type="email" class="input" required />
            </div>
            <div>
              <label
                class="block text-xs font-semibold mb-1 uppercase tracking-wider"
                style="color: var(--surface-muted)"
                >No. HP</label
              >
              <input
                v-model="form.no_hp"
                type="tel"
                class="input"
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div>
              <label
                class="block text-xs font-semibold mb-1 uppercase tracking-wider"
                style="color: var(--surface-muted)"
              >
                Password {{ editMode ? "(kosongkan jika tidak diubah)" : "*" }}
              </label>
              <input
                v-model="form.password"
                type="password"
                class="input"
                :required="!editMode"
              />
            </div>
            <div>
              <label
                class="block text-xs font-semibold mb-1 uppercase tracking-wider"
                style="color: var(--surface-muted)"
                >Role *</label
              >
              <select v-model="form.role" class="input" required>
                <option value="admin">Admin</option>
                <option value="security">Security</option>
              </select>
            </div>
            <div class="sm:col-span-2 flex gap-2">
              <button
                type="submit"
                class="btn btn-primary flex-1"
                :disabled="formLoading"
              >
                {{
                  formLoading ? "Menyimpan..." : editMode ? "Update" : "Buat"
                }}
              </button>
              <button
                type="button"
                @click="cancelForm"
                class="btn btn-ghost flex-1"
              >
                Batal
              </button>
            </div>
          </form>
          <p
            v-if="formError"
            class="text-status-danger text-xs mt-2 bg-status-danger/10 rounded-lg p-2"
          >
            {{ formError }}
          </p>
          <p
            v-if="formSuccess"
            class="text-status-ok text-xs mt-2 bg-status-ok/10 rounded-lg p-2"
          >
            {{ formSuccess }}
          </p>
        </div>
      </Transition>

      <!-- Users Table -->
      <div
        class="overflow-x-auto rounded-xl"
        style="border: 1px solid var(--surface-border)"
      >
        <table class="table-auto">
          <thead style="background: var(--surface-bg)">
            <tr>
              <th>Nama</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Dibuat</th>
              <th v-if="isAdmin">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td
                :colspan="isAdmin ? 7 : 6"
                class="text-center py-8"
                style="color: var(--surface-muted)"
              >
                <div class="animate-pulse space-y-3">
                  <div v-for="n in 2" :key="n" class="grid grid-cols-6 gap-4">
                    <div
                      v-for="i in 6"
                      :key="i"
                      class="h-4 bg-gray-300 rounded"
                    ></div>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td
                :colspan="isAdmin ? 7 : 6"
                class="text-center py-8"
                style="color: var(--surface-muted)"
              >
                Tidak ada data
              </td>
            </tr>
            <tr v-else v-for="user in users" :key="user.id">
              <td class="font-medium text-sm">{{ user.nama }}</td>
              <td class="text-sm">{{ user.username }}</td>
              <td class="text-sm">{{ user.email }}</td>
              <td>
                <span
                  :class="[
                    'badge',
                    user.role === 'admin'
                      ? 'bg-brand-primary/15 text-brand-primary-light'
                      : '',
                  ]"
                  :style="
                    user.role !== 'admin'
                      ? {
                          background: 'var(--surface-border)',
                          color: 'var(--surface-muted)',
                        }
                      : {}
                  "
                >
                  {{ user.role }}
                </span>
              </td>
              <td>
                <span
                  :class="[
                    'badge',
                    user.status === 'online'
                      ? 'bg-status-ok/15 text-status-ok'
                      : '',
                  ]"
                  :style="
                    user.status !== 'online'
                      ? {
                          background: 'var(--surface-border)',
                          color: 'var(--surface-muted)',
                        }
                      : {}
                  "
                >
                  {{ user.status }}
                </span>
              </td>
              <td class="text-xs" style="color: var(--surface-muted)">
                {{ formatTime(user.created_at) }}
              </td>
              <td v-if="isAdmin">
                <div class="flex gap-1.5">
                  <button
                    @click="openEditForm(user)"
                    class="btn btn-ghost text-xs py-1 px-2.5"
                  >
                    <font-awesome-icon :icon="['fas', 'pen']" class="mr-1" />
                    Edit
                  </button>
                  <button
                    @click="deleteUser(user.id)"
                    class="btn btn-danger text-xs py-1 px-2.5"
                    :disabled="user.id === currentUserId"
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" class="mr-1" />
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { api } from "../utils/api";

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);
const currentUserId = computed(() => authStore.user?.id);

const users = ref([]);
const loading = ref(false);
const showForm = ref(false);
const editMode = ref(false);
const editingUserId = ref(null);
const formLoading = ref(false);

const form = reactive({
  nama: "",
  username: "",
  email: "",
  no_hp: "",
  password: "",
  role: "security",
});

const formError = ref("");
const formSuccess = ref("");

async function loadUsers() {
  loading.value = true;
  try {
    const res = await api.get("/users");
    users.value = res.data || [];
  } catch (error) {
    console.error("Failed to load users:", error);
  } finally {
    loading.value = false;
  }
}

function openCreateForm() {
  editMode.value = false;
  editingUserId.value = null;
  showForm.value = true;
  resetForm();
}

function openEditForm(user) {
  editMode.value = true;
  editingUserId.value = user.id;
  showForm.value = true;

  form.nama = user.nama;
  form.username = user.username;
  form.email = user.email;
  form.no_hp = user.no_hp || "";
  form.password = "";
  form.role = user.role;

  formError.value = "";
  formSuccess.value = "";
}

function cancelForm() {
  showForm.value = false;
  editMode.value = false;
  editingUserId.value = null;
  resetForm();
}

function resetForm() {
  form.nama = "";
  form.username = "";
  form.email = "";
  form.no_hp = "";
  form.password = "";
  form.role = "security";
  formError.value = "";
  formSuccess.value = "";
}

async function handleSubmit() {
  formLoading.value = true;
  formError.value = "";
  formSuccess.value = "";

  try {
    const payload = {
      nama: form.nama,
      email: form.email,
      no_hp: form.no_hp,
      role: form.role,
    };

    if (form.password) payload.password = form.password;

    if (editMode.value) {
      await api.put(`/users/${editingUserId.value}`, payload);
      formSuccess.value = "User berhasil diupdate!";
    } else {
      payload.username = form.username;
      payload.password = form.password;
      await api.post("/users", payload);
      formSuccess.value = "User berhasil dibuat!";
    }

    setTimeout(() => {
      showForm.value = false;
      editMode.value = false;
      editingUserId.value = null;
      resetForm();
      loadUsers();
    }, 1500);
  } catch (error) {
    formError.value = error.message;
  } finally {
    formLoading.value = false;
  }
}

async function deleteUser(userId) {
  if (userId === currentUserId.value) {
    alert("Tidak bisa menghapus akun sendiri");
    return;
  }
  if (!confirm("Yakin ingin menghapus user ini?")) return;

  try {
    await api.delete(`/users/${userId}`);
    await loadUsers();
  } catch (error) {
    alert("Gagal menghapus user: " + error.message);
  }
}

function formatTime(iso) {
  return new Date(iso).toLocaleString("id-ID", { dateStyle: "medium" });
}

onMounted(loadUsers);
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
