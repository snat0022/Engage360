<template>
  <div class="container py-5" style="max-width: 500px">
    <h2 class="mb-4 text-center">Login</h2>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <form @submit.prevent="handleLogin">
      <div class="mb-3">
        <label for="email" class="form-label">Email *</label>
        <input type="email" id="email" v-model.trim="email" class="form-control" required />
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">Password *</label>
        <input type="password" id="password" v-model="password" class="form-control" required />
      </div>

      <button class="btn btn-primary w-100" type="submit">Login</button>
    </form>

    <div class="mt-3 text-center">
      <RouterLink to="/register">Don't have an account? Register</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '@/stores/auth'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

function handleLogin() {
  error.value = ''
  try {
    authStore.login(email.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = err.message
  }
}
</script>
