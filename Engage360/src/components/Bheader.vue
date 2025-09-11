<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
    <div class="container">
      <RouterLink class="navbar-brand fw-bold" to="/">Engage360</RouterLink>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/form">Register for Programs</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/faq">FAQ</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/about">About</RouterLink>
          </li>
          <li v-if="authStore.getRole() === 'admin'" class="nav-item">
            <RouterLink class="nav-link" to="/admin">Admin</RouterLink>
          </li>
        </ul>

        <div class="d-flex">
          <span class="me-3" v-if="authStore.isLoggedIn()">
            Welcome, {{ authStore.currentUser.name }}!
          </span>

          <RouterLink
            v-if="!authStore.isLoggedIn()"
            to="/login"
            class="btn btn-outline-primary me-2"
          >
            Login
          </RouterLink>

          <RouterLink
            v-if="!authStore.isLoggedIn()"
            to="/register"
            class="btn btn-primary"
          >
            Register
          </RouterLink>

          <button
            v-if="authStore.isLoggedIn()"
            @click="logout"
            class="btn btn-danger"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { authStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()

function logout() {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.navbar-brand {
  font-size: 1.4rem;
}
</style>