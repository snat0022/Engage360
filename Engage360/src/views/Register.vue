<template>
  <div class="container py-5" style="max-width: 500px">
    <h2 class="mb-4 text-center">Register</h2>

    <div v-if="success" class="alert alert-success">
      Registration successful! You can now log in.
    </div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <form @submit.prevent="handleRegister" novalidate>
      <div class="mb-3">
        <label for="name" class="form-label">Name *</label>
        <input
          type="text"
          id="name"
          v-model.trim="form.name"
          class="form-control"
          required
        />
      </div>

      <div class="mb-3">
        <label for="email" class="form-label">Email *</label>
        <input
          type="email"
          id="email"
          v-model.trim="form.email"
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
          v-model="form.password"
          class="form-control"
          minlength="8"
          required
          autocomplete="new-password"
        />
        <div class="form-text">Min 8 characters</div>
      </div>

      <div class="mb-3">
        <label for="confirmPassword" class="form-label">Confirm Password *</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="form.confirmPassword"
          class="form-control"
          required
          autocomplete="new-password"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">Select Role *</label>
        <select v-model="form.role" class="form-select" required>
          <option disabled value="">Choose a role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <button class="btn btn-primary w-100" type="submit">Register</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { authStore } from "@/stores/auth"
import { sanitize } from "@/utils/sanitize"

const form = ref({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: ""
})

const error = ref("")
const success = ref(false)

function handleRegister() {
  error.value = ""
  success.value = false

  // Validation
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRe.test(form.value.email)) {
    error.value = "Please enter a valid email address."
    return
  }
  if (form.value.password.length < 8) {
    error.value = "Password must be at least 8 characters."
    return
  }
  if (form.value.password !== form.value.confirmPassword) {
    error.value = "Passwords do not match."
    return
  }
  if (!form.value.role) {
    error.value = "Please select a role."
    return
  }

  try {
    authStore.register({
      name: sanitize(form.value.name),
      email: sanitize(form.value.email),
      password: sanitize(form.value.password),
      role: sanitize(form.value.role),
    })
    success.value = true
    form.value = { name: "", email: "", password: "", confirmPassword: "", role: "" }
  } catch (err) {
    error.value = err.message
  }
}
</script>
