<template>
  <div class="container py-4">
    <h1 class="mb-4">Admin Dashboard</h1>

    <!-- Stats Panel -->
    <div class="row mb-4">
      <div class="col-md-3" v-for="(stat, key) in stats" :key="key">
        <div class="card text-center shadow-sm">
          <div class="card-body">
            <h5 class="card-title">{{ stat.label }}</h5>
            <p class="display-6 fw-bold">{{ stat.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- User Table -->
    <h5 class="mb-3">User Management</h5>
    <div class="d-flex justify-content-end mb-2">
      <button class="btn btn-primary" @click="createDummyUser">Create User</button>
    </div>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="users.length === 0">
          <td colspan="5" class="text-center">No users found.</td>
        </tr>
        <tr v-for="(user, index) in users" :key="index">
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td>
            <span :class="user.status === 'active' ? 'text-success' : 'text-danger'">
              {{ user.status }}
            </span>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-danger me-1" @click="deleteUser(index)">Delete</button>
            <button class="btn btn-sm btn-outline-secondary me-1" @click="toggleStatus(index)">
              {{ user.status === 'active' ? 'Suspend' : 'Activate' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Security Logs -->
    <h6 class="mb-2 mt-5">Security Logs (Failed Login Attempts)</h6>
    <div class="d-flex justify-content-end mb-2">
      <button class="btn btn-sm btn-outline-danger" v-if="Object.keys(attempts).length > 0" @click="clearAllAttempts">Clear All Logs</button>
    </div>
    <table class="table table-sm table-bordered align-middle">
      <thead>
        <tr>
          <th>Email</th>
          <th>Failed Attempts</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(count, email) in attempts" :key="email">
          <td>{{ email }}</td>
          <td :class="count >= 3 ? 'text-danger fw-bold' : ''">{{ count }}</td>
          <td><button class="btn btn-sm btn-outline-secondary" @click="clearAttempts(email)">Clear</button></td>
        </tr>
        <tr v-if="Object.keys(attempts).length === 0">
          <td colspan="3" class="text-center text-muted">No failed attempts logged.</td>
        </tr>
      </tbody>
    </table>

    <!-- User Form Submissions -->
    <h5 class="mt-5 mb-3">User Registration Submissions</h5>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <input v-model="search" type="text" class="form-control w-auto" placeholder="Search by name/email..." />
      <button class="btn btn-outline-primary ms-2" @click="exportToCSV">Export CSV</button>
    </div>

    <div class="scrollable-submissions">
      <table class="table table-striped align-middle">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Fitness</th>
            <th>Interests</th>
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredSubmissions.length === 0">
            <td colspan="6" class="text-center text-muted">No registrations found.</td>
          </tr>
          <tr v-for="(entry, index) in filteredSubmissions" :key="index">
            <td>{{ entry.firstName || entry.name }} {{ entry.lastName || '' }}</td>
            <td>{{ entry.email }}</td>
            <td>{{ entry.phone }}</td>
            <td>{{ entry.fitnessLevel }}</td>
            <td>{{ entry.interests?.join(', ') }}</td>
            <td>{{ formatDate(entry.timestamp) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ratingStore } from '@/stores/ratingStore'
import { authStore } from '@/stores/auth'

const users = ref([])
const attempts = ref({})
const userSubmissions = ref([])
const search = ref('')
let submissionInterval = null

const loadUsers = () => {
  const stored = localStorage.getItem("vue-auth-users")
  users.value = stored ? JSON.parse(stored) : []
}

const saveUsers = () => {
  localStorage.setItem("vue-auth-users", JSON.stringify(users.value))
}

const deleteUser = (index) => {
  if (confirm("Are you sure you want to delete this user?")) {
    users.value.splice(index, 1)
    saveUsers()
  }
}

const toggleStatus = (index) => {
  const user = users.value[index]
  user.status = user.status === "active" ? "suspended" : "active"
  saveUsers()
}

const createDummyUser = () => {
  const newUser = {
    name: "New User",
    email: `user${users.value.length + 1}@mail.com`,
    password: "123456",
    role: "user",
    status: "active"
  }
  users.value.push(newUser)
  saveUsers()
}

const stats = computed(() => ({
  total: { label: "Total Users", value: users.value.length },
  admins: { label: "Admins", value: users.value.filter(u => u.role === 'admin').length },
  active: { label: "Active Users", value: users.value.filter(u => u.status === 'active').length },
  suspended: { label: "Suspended Users", value: users.value.filter(u => u.status === 'suspended').length }
}))

const loadAttempts = () => {
  attempts.value = authStore.getAttemptsMap()
}
const clearAttempts = (email) => {
  authStore.clearAttempts(email)
  loadAttempts()
}
const clearAllAttempts = () => {
  for (const email in attempts.value) authStore.clearAttempts(email)
  loadAttempts()
}

const formatDate = (val) => {
  const d = new Date(val)
  return isNaN(d) ? 'N/A' : d.toLocaleString()
}

function loadUserSubmissions() {
  const data = localStorage.getItem('user-registrations')
  const raw = data ? JSON.parse(data) : []

  // Deduplicate by email + timestamp
  const seen = new Set()
  userSubmissions.value = raw.filter(entry => {
    const key = `${entry.email}-${entry.timestamp}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}


const filteredSubmissions = computed(() => {
  if (!search.value) return userSubmissions.value
  return userSubmissions.value.filter(entry =>
    `${entry.firstName} ${entry.lastName}`.toLowerCase().includes(search.value.toLowerCase()) ||
    entry.email?.toLowerCase().includes(search.value.toLowerCase())
  )
})

function exportToCSV() {
  const headers = ['Name', 'Email', 'Phone', 'Fitness Level', 'Interests', 'Timestamp']
  const rows = userSubmissions.value.map(entry => [
    `${entry.firstName || ''} ${entry.lastName || ''}`,
    entry.email,
    entry.phone,
    entry.fitnessLevel,
    entry.interests?.join(' | ') || '',
    entry.timestamp
  ])

  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'registrations.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  loadUsers()
  loadAttempts()
  loadUserSubmissions()
  submissionInterval = setInterval(loadUserSubmissions, 5000)
})

onUnmounted(() => {
  clearInterval(submissionInterval)
})
</script>

<style scoped>
.card-title { font-size: 1rem; }
.display-6 { font-size: 2rem; }
.table td, .table th { vertical-align: middle; }
.scrollable-submissions {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e3e3e3;
  border-radius: 8px;
}
</style>
