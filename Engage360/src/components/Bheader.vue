<template>
  <nav id="main-navigation" class="navbar navbar-expand-lg navbar-light bg-light shadow-sm" role="navigation" aria-label="Main navigation">
    <div class="container">
      <RouterLink class="navbar-brand fw-bold" to="/" aria-label="Engage360 Home">Engage360</RouterLink>

      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation menu"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0" role="menubar">
          <li class="nav-item" role="none">
            <RouterLink class="nav-link" to="/programs" role="menuitem">Programs</RouterLink>
          </li>
          <li class="nav-item" role="none">
            <RouterLink class="nav-link" to="/maps" role="menuitem">
              <i class="fas fa-map-marker-alt me-1"></i>Maps
            </RouterLink>
          </li>
          <li class="nav-item" role="none">
            <button 
              class="nav-link btn btn-link" 
              data-bs-toggle="modal" 
              data-bs-target="#registrationModal"
              role="menuitem"
              aria-label="Open program registration modal"
            >
              Register for Programs
            </button>
          </li>
          <li class="nav-item" role="none">
            <RouterLink class="nav-link" to="/faq" role="menuitem">FAQ</RouterLink>
          </li>
          <li class="nav-item" role="none">
            <RouterLink class="nav-link" to="/ratings" role="menuitem">Ratings</RouterLink>
          </li>
          <li v-if="isAuthenticated" class="nav-item" role="none">
            <RouterLink class="nav-link" to="/appointments" role="menuitem">
              <i class="fas fa-calendar-check me-1"></i>Appointments
            </RouterLink>
          </li>
          <li v-if="isAuthenticated" class="nav-item" role="none">
            <RouterLink class="nav-link" to="/ai-assistant" role="menuitem">
              <i class="fas fa-robot me-1"></i>AI Assistant
            </RouterLink>
          </li>
          <li v-if="isAdmin" class="nav-item dropdown" role="none">
            <a class="nav-link dropdown-toggle" href="#" role="menuitem" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fas fa-cogs me-1"></i>Admin Tools
            </a>
            <ul class="dropdown-menu" role="menu">
              <li role="none">
                <RouterLink class="dropdown-item" to="/admin" role="menuitem">
                  <i class="fas fa-tachometer-alt me-2"></i>Dashboard
                </RouterLink>
              </li>
              <li role="none">
                <RouterLink class="dropdown-item" to="/bulk-email" role="menuitem">
                  <i class="fas fa-envelope-open-text me-2"></i>Bulk Email
                </RouterLink>
              </li>
              <li role="none">
                <RouterLink class="dropdown-item" to="/analytics" role="menuitem">
                  <i class="fas fa-chart-bar me-2"></i>Analytics
                </RouterLink>
              </li>
            </ul>
          </li>
          <li v-if="isAdmin" class="nav-item" role="none">
            <RouterLink class="nav-link" to="/admin" role="menuitem">Admin</RouterLink>
          </li>
        </ul>

        <div class="d-flex" role="toolbar" aria-label="User account actions">
          <span class="me-3" v-if="firebaseAuthStore.isLoggedIn()" aria-live="polite">
            Welcome, {{ firebaseAuthStore.currentUser.displayName || firebaseAuthStore.currentUser.email }}!
            <small class="text-muted d-block">Role: {{ isAdmin ? 'Admin' : 'User' }}</small>
            <button 
              v-if="!isAdmin && firebaseAuthStore.currentUser.email === 'shreyasnatraj97@gmail.com'" 
              @click="forceAdminCheck" 
              class="btn btn-sm btn-outline-warning mt-1"
              aria-label="Force admin role check"
            >
              Force Admin Check
            </button>
          </span>

          <RouterLink
            v-if="!firebaseAuthStore.isLoggedIn()"
            to="/login"
            class="btn btn-outline-primary me-2"
            aria-label="Sign in to your account"
          >
            Login
          </RouterLink>

          <RouterLink
            v-if="!firebaseAuthStore.isLoggedIn()"
            to="/register"
            class="btn btn-primary"
            aria-label="Create a new account"
          >
            Register
          </RouterLink>

          <button
            v-if="firebaseAuthStore.isLoggedIn()"
            @click="logout"
            class="btn btn-danger"
            aria-label="Sign out of your account"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { firebaseAuthStore } from '@/stores/firebaseAuth'
import { useRouter } from 'vue-router'

const router = useRouter()
const isAdmin = ref(false)

const isAuthenticated = computed(() => {
  return firebaseAuthStore.isLoggedIn()
})

async function checkAdminRole() {
  if (firebaseAuthStore.isLoggedIn()) {
    try {
      const role = await firebaseAuthStore.getUserRole()
      isAdmin.value = role === 'admin'
    } catch (error) {
      console.error('Error checking admin role:', error)
      isAdmin.value = false
    }
  } else {
    isAdmin.value = false
  }
}

async function logout() {
  await firebaseAuthStore.logout()
  isAdmin.value = false
  router.push('/')
}

async function forceAdminCheck() {
  console.log('Force admin check triggered')
  await checkAdminRole()
}

// Check admin role when component mounts and when auth state changes
onMounted(() => {
  checkAdminRole()
  // Listen for auth state changes
  const unsubscribe = firebaseAuthStore.init()
  
  // Cleanup
  return () => {
    if (unsubscribe) {
      unsubscribe()
    }
  }
})
</script>

<style scoped>
.navbar-brand {
  font-size: 1.4rem;
}
</style>