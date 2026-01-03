<template>
  <div class="space-y-6">
    <div class="card">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-2xl font-bold">User Management</h2>
          <p class="text-dark-muted text-sm">
            {{ isAdmin ? 'Admin: Full CRUD • Security: Read Only' : 'Read Only' }}
          </p>
        </div>
        
        <div class="flex gap-2">
          <button @click="loadUsers" class="btn btn-ghost">
            🔄 Reload
          </button>
          <button 
            v-if="isAdmin" 
            @click="openCreateForm" 
            class="btn btn-primary"
          >
            + Create User
          </button>
        </div>
      </div>

      <!-- Create/Edit User Form -->
      <div v-if="showForm && isAdmin" class="mb-6 p-4 border border-dark-border rounded-xl bg-dark-bg">
        <h3 class="font-bold mb-4">{{ editMode ? 'Edit User' : 'Create New User' }}</h3>
        <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Nama *</label>
            <input v-model="form.nama" type="text" class="input" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Username *</label>
            <input v-model="form.username" type="text" class="input" required :disabled="editMode" />
            <p v-if="editMode" class="text-xs text-dark-muted mt-1">Username cannot be changed</p>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Email *</label>
            <input v-model="form.email" type="email" class="input" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Password {{ editMode ? '(leave empty to keep current)' : '*' }}</label>
            <input v-model="form.password" type="password" class="input" :required="!editMode" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Role *</label>
            <select v-model="form.role" class="input" required>
              <option value="admin">Admin</option>
              <option value="security">Security</option>
            </select>
          </div>
          <div class="flex items-end gap-2">
            <button type="submit" class="btn btn-primary flex-1" :disabled="formLoading">
              {{ formLoading ? 'Saving...' : (editMode ? 'Update' : 'Create') }}
            </button>
            <button type="button" @click="cancelForm" class="btn btn-ghost flex-1">
              Cancel
            </button>
          </div>
        </form>
        <p v-if="formError" class="text-status-danger text-sm mt-2">{{ formError }}</p>
        <p v-if="formSuccess" class="text-status-ok text-sm mt-2">{{ formSuccess }}</p>
      </div>

      <!-- Users Table -->
      <div class="overflow-x-auto border border-dark-border rounded-xl">
        <table class="table-auto">
          <thead class="bg-dark-bg">
            <tr>
              <th>Nama</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created At</th>
              <th v-if="isAdmin">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td :colspan="isAdmin ? 7 : 6" class="text-center py-8 text-dark-muted">
                Loading...
              </td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td :colspan="isAdmin ? 7 : 6" class="text-center py-8 text-dark-muted">
                Tidak ada data
              </td>
            </tr>
            <tr v-else v-for="user in users" :key="user.id">
              <td class="font-medium">{{ user.nama }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span :class="['badge border-0', user.role === 'admin' ? 'bg-brand-primary/20 text-brand-primary' : 'bg-dark-border text-dark-text']">
                  {{ user.role }}
                </span>
              </td>
              <td>
                <span :class="['badge border-0', user.status === 'online' ? 'bg-status-ok/20 text-status-ok' : 'bg-dark-border text-dark-muted']">
                  {{ user.status }}
                </span>
              </td>
              <td>{{ formatTime(user.created_at) }}</td>
              <td v-if="isAdmin">
                <div class="flex gap-2">
                  <button 
                    @click="openEditForm(user)" 
                    class="btn btn-ghost text-xs py-1 px-3"
                  >
                    Edit
                  </button>
                  <button 
                    @click="deleteUser(user.id)" 
                    class="btn btn-danger text-xs py-1 px-3"
                    :disabled="user.id === currentUserId"
                  >
                    Delete
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { api } from '../utils/api'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)
const currentUserId = computed(() => authStore.user?.id)

const users = ref([])
const loading = ref(false)
const showForm = ref(false)
const editMode = ref(false)
const editingUserId = ref(null)
const formLoading = ref(false)

const form = reactive({
  nama: '',
  username: '',
  email: '',
  password: '',
  role: 'security'
})

const formError = ref('')
const formSuccess = ref('')

async function loadUsers() {
  loading.value = true
  try {
    const res = await api.get('/users')
    users.value = res.data || []
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loading.value = false
  }
}

function openCreateForm() {
  editMode.value = false
  editingUserId.value = null
  showForm.value = true
  resetForm()
}

function openEditForm(user) {
  editMode.value = true
  editingUserId.value = user.id
  showForm.value = true
  
  form.nama = user.nama
  form.username = user.username
  form.email = user.email
  form.password = ''
  form.role = user.role
  
  formError.value = ''
  formSuccess.value = ''
}

function cancelForm() {
  showForm.value = false
  editMode.value = false
  editingUserId.value = null
  resetForm()
}

function resetForm() {
  form.nama = ''
  form.username = ''
  form.email = ''
  form.password = ''
  form.role = 'security'
  formError.value = ''
  formSuccess.value = ''
}

async function handleSubmit() {
  formLoading.value = true
  formError.value = ''
  formSuccess.value = ''
  
  try {
    const payload = {
      nama: form.nama,
      email: form.email,
      role: form.role
    }

    // Only include password if provided
    if (form.password) {
      payload.password = form.password
    }

    if (editMode.value) {
      // Update existing user
      await api.put(`/users/${editingUserId.value}`, payload)
      formSuccess.value = 'User updated successfully!'
    } else {
      // Create new user
      payload.username = form.username
      payload.password = form.password // required for create
      await api.post('/users', payload)
      formSuccess.value = 'User created successfully!'
    }

    setTimeout(() => {
      showForm.value = false
      editMode.value = false
      editingUserId.value = null
      resetForm()
      loadUsers()
    }, 1500)
  } catch (error) {
    formError.value = error.message
  } finally {
    formLoading.value = false
  }
}

async function deleteUser(userId) {
  if (userId === currentUserId.value) {
    alert('Cannot delete your own account')
    return
  }

  if (!confirm('Are you sure you want to delete this user?')) return
  
  try {
    await api.delete(`/users/${userId}`)
    await loadUsers()
  } catch (error) {
    alert('Failed to delete user: ' + error.message)
  }
}

function formatTime(iso) {
  return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium' })
}

onMounted(loadUsers)
</script>