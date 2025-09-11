<template>
  <div class="container py-5" style="max-width: 500px">
    <h2 class="mb-4 text-center">Register</h2>

    <div v-if="success" class="alert alert-success">Registration successful! You can now log in.</div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <form @submit.prevent="handleRegister">
      <div class="mb-3">
        <label for="name" class="form-label">Name *</label>
        <input type="text" id="name" v-model.trim="form.name" class="form-control" required />
      </div>

      <div class="mb-3">
        <label for="email" class="form-label">Email *</label>
        <input type="email" id="email" v-model.trim="form.email" class="form-control" required />
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">Password *</label>
        <input type="password" id="password" v-model="form.password" class="form-control" minlength="6" required />
      </div>

      <div class="mb-3">
        <label for="confirmPassword" class="form-label">Confirm Password *</label>
        <input type="password" id="confirmPassword" v-model="form.confirmPassword" class="form-control" required />
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
import { ref } from 'vue'
import { authStore } from '@/stores/auth'

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: ''
})

const error = ref('')
const success = ref(false)

function handleRegister() {
  error.value = ''
  success.value = false

  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Passwords do not match.'
    return
  }

  try {
    authStore.register({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
      role: form.value.role,
    })
    success.value = true
    form.value = { name: '', email: '', password: '', confirmPassword: '', role: '' }
  } catch (err) {
    error.value = err.message
  }
}
</script>