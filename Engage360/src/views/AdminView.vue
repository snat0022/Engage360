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

    <!-- Email Composer -->
    <div class="row mb-5">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Email Management</h5>
          </div>
          <div class="card-body">
            <EmailComposer />
          </div>
        </div>
      </div>
    </div>

    <!-- User Management Table -->
    <div class="row mb-5">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">User Management</h5>
            <button class="btn btn-primary" @click="createDummyUser">Create User</button>
          </div>
          <div class="card-body">
            <InteractiveTable
              :data="users"
              :columns="userColumns"
              title="Users"
              :searchable-fields="['name', 'email', 'role', 'status']"
            >
              <template #status="{ value }">
                <span :class="value === 'active' ? 'text-success' : 'text-danger'">
                  {{ value }}
                </span>
              </template>
              <template #actions="{ item, value }">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-danger" @click="deleteUser(item)">
                    Delete
                  </button>
                  <button class="btn btn-outline-secondary" @click="toggleStatus(item)">
                    {{ item.status === 'active' ? 'Suspend' : 'Activate' }}
                  </button>
                </div>
              </template>
            </InteractiveTable>
          </div>
        </div>
      </div>
    </div>

    <!-- Security Logs Table -->
    <div class="row mb-5">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Security Logs (Failed Login Attempts)</h5>
            <button 
              class="btn btn-sm btn-outline-danger" 
              v-if="securityLogs.length > 0" 
              @click="clearAllAttempts"
            >
              Clear All Logs
            </button>
          </div>
          <div class="card-body">
            <InteractiveTable
              :data="securityLogs"
              :columns="securityColumns"
              title="Security Logs"
              :searchable-fields="['email']"
            >
              <template #attempts="{ value }">
                <span :class="value >= 3 ? 'text-danger fw-bold' : ''">
                  {{ value }}
                </span>
              </template>
              <template #actions="{ item }">
                <button class="btn btn-sm btn-outline-secondary" @click="clearAttempts(item.email)">
                  Clear
                </button>
              </template>
            </InteractiveTable>
          </div>
        </div>
      </div>
    </div>

    <!-- User Registration Submissions Table -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">User Registration Submissions</h5>
            <button class="btn btn-outline-primary" @click="exportToCSV">Export CSV</button>
          </div>
          <div class="card-body">
            <InteractiveTable
              :data="userSubmissions"
              :columns="submissionColumns"
              title="Registration Submissions"
              :searchable-fields="['firstName', 'lastName', 'email', 'phone', 'fitnessLevel']"
            >
              <template #interests="{ value }">
                {{ value?.join(', ') || '-' }}
              </template>
              <template #submitted="{ value }">
                {{ formatDate(value) }}
              </template>
            </InteractiveTable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { firebaseAuthStore } from '@/stores/firebaseAuth'
import InteractiveTable from '@/components/InteractiveTable.vue'
import EmailComposer from '@/components/EmailComposer.vue'

const users = ref([])
const attempts = ref({})
const userSubmissions = ref([])
let submissionInterval = null

// Table column definitions
const userColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
]

const securityColumns = [
  { key: 'email', label: 'Email', sortable: true },
  { key: 'attempts', label: 'Failed Attempts', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
]

const submissionColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'phone', label: 'Phone', sortable: true },
  { key: 'fitnessLevel', label: 'Fitness Level', sortable: true },
  { key: 'interests', label: 'Interests', sortable: false },
  { key: 'submitted', label: 'Submitted', sortable: true }
]

const loadUsers = () => {
  const stored = localStorage.getItem("vue-auth-users")
  users.value = stored ? JSON.parse(stored) : []
}

const saveUsers = () => {
  localStorage.setItem("vue-auth-users", JSON.stringify(users.value))
}

const deleteUser = (user) => {
  const index = users.value.findIndex(u => u.email === user.email)
  if (index !== -1 && confirm("Are you sure you want to delete this user?")) {
    users.value.splice(index, 1)
    saveUsers()
  }
}

const toggleStatus = (user) => {
  const index = users.value.findIndex(u => u.email === user.email)
  if (index !== -1) {
    users.value[index].status = users.value[index].status === "active" ? "suspended" : "active"
    saveUsers()
  }
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
  attempts.value = firebaseAuthStore.getAttemptsMap ? firebaseAuthStore.getAttemptsMap() : {}
}

const securityLogs = computed(() => {
  return Object.entries(attempts.value).map(([email, count]) => ({
    email,
    attempts: count
  }))
})

const clearAttempts = (email) => {
  if (firebaseAuthStore.clearAttempts) {
    firebaseAuthStore.clearAttempts(email)
  }
  loadAttempts()
}

const clearAllAttempts = () => {
  for (const email in attempts.value) {
    if (firebaseAuthStore.clearAttempts) {
      firebaseAuthStore.clearAttempts(email)
    }
  }
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
  }).map(entry => ({
    ...entry,
    name: `${entry.firstName || entry.name || ''} ${entry.lastName || ''}`.trim(),
    submitted: entry.timestamp
  }))
}

function exportToCSV() {
  const headers = ['Name', 'Email', 'Phone', 'Fitness Level', 'Interests', 'Timestamp']
  const rows = userSubmissions.value.map(entry => [
    entry.name,
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
</style>
