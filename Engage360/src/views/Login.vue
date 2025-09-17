<template>
  <div class="container py-5" style="max-width: 500px">
    <h2 class="mb-4 text-center">Login</h2>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <form @submit.prevent="handleLogin" novalidate>
      <div class="mb-3">
        <label for="email" class="form-label">Email *</label>
        <input
          type="email"
          id="email"
          v-model.trim="email"
          class="form-control"
          required
          autocomplete="email"
        />
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">Password *</label>
        <input
          type="password"
          id="password"
          v-model="password"
          class="form-control"
          required
          minlength="8"
          autocomplete="current-password"
        />
      </div>

      <button class="btn btn-primary w-100" type="submit">Login</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { authStore } from "@/stores/auth"
import { sanitize } from "@/utils/sanitize"

const email = ref("")
const password = ref("")
const error = ref("")
const router = useRouter()

function handleLogin() {
  error.value = ""

  // Basic client-side validation
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRe.test(email.value)) {
    error.value = "Please enter a valid email address."
    return
  }
  if (password.value.length < 8) {
    error.value = "Password must be at least 8 characters."
    return
  }

  try {
    // auth.js already enforces login attempt limits
    authStore.login(sanitize(email.value), sanitize(password.value))
    router.push("/")
  } catch (err) {
    error.value = err.message
  }
}
</script>
