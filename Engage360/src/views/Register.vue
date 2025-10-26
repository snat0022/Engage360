<template>
  <div class="container py-5" style="max-width: 600px">
    <h2 class="mb-4 text-center">Create Account</h2>

    <div v-if="success" class="alert alert-success">
      <h5>Account Created Successfully! 🎉</h5>
      <p class="mb-3">{{ successMessage }}</p>
      <div class="d-flex gap-2">
        <RouterLink to="/login" class="btn btn-success">
          Login to Your Account
        </RouterLink>
        <RouterLink to="/program-registration" class="btn btn-outline-success">
          Register for Programs
        </RouterLink>
      </div>
    </div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <form @submit.prevent="handleRegister" novalidate>
      <h4 class="mb-3">Account Information</h4>
      
      <div class="mb-3">
        <label for="name" class="form-label">Full Name *</label>
        <input
          type="text"
          id="name"
          v-model.trim="form.name"
          class="form-control"
          required
          placeholder="Enter your full name"
        />
      </div>

      <div class="mb-3">
        <label for="email" class="form-label">Email Address *</label>
        <input
          type="email"
          id="email"
          v-model.trim="form.email"
          class="form-control"
          required
          autocomplete="email"
          placeholder="Enter your email address"
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
          placeholder="Enter your password (min 8 characters)"
        />
        <div class="form-text">Minimum 8 characters required</div>
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
          placeholder="Confirm your password"
        />
      </div>

      <!-- Submit Button -->
      <div class="d-grid">
        <button class="btn btn-primary btn-lg" type="submit" :disabled="loading">
          {{ loading ? 'Creating Account...' : 'Create Account' }}
        </button>
      </div>
    </form>

    <!-- Login Link -->
    <div class="text-center mt-4">
      <p class="mb-0">
        Already have an account?
        <RouterLink to="/login" class="text-decoration-none">Login here</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { firebaseAuthStore } from "@/stores/firebaseAuth"
import { sanitize } from "@/utils/sanitize"

const form = ref({
  name: "",
  email: "",
  password: "",
  confirmPassword: ""
})

const error = ref("")
const success = ref(false)
const loading = ref(false)
const successMessage = ref("")

async function handleRegister() {
  console.log('=== Account Creation Started ===')
  console.log('Form data:', form.value)
  
  error.value = ""
  success.value = false
  loading.value = true

  // Validation
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!form.value.name) {
    error.value = "Name is required."
    loading.value = false
    return
  }
  if (!emailRe.test(form.value.email)) {
    error.value = "Please enter a valid email address."
    loading.value = false
    return
  }
  if (form.value.password.length < 8) {
    error.value = "Password must be at least 8 characters."
    loading.value = false
    return
  }
  if (form.value.password !== form.value.confirmPassword) {
    error.value = "Passwords do not match."
    loading.value = false
    return
  }

  try {
    console.log('Creating new account...')
    const user = await firebaseAuthStore.registerWithEmail(
      sanitize(form.value.email),
      sanitize(form.value.password),
      sanitize(form.value.name)
    )
    console.log('Account created:', user)

    success.value = true
    successMessage.value = "Your account has been created successfully! You can now log in and register for programs."
    
    // Reset form
    form.value = { 
      name: "", 
      email: "", 
      password: "", 
      confirmPassword: ""
    }
    
  } catch (err) {
    console.error('Account creation error:', err)
    console.error('Error details:', err.code, err.message)
    error.value = err.message || "Account creation failed. Please try again."
    
    // Show specific error messages
    if (err.code === 'auth/email-already-in-use') {
      error.value = "This email is already registered. Please use a different email or try logging in."
    } else if (err.code === 'auth/weak-password') {
      error.value = "Password is too weak. Please choose a stronger password."
    } else if (err.code === 'auth/invalid-email') {
      error.value = "Invalid email address. Please check your email format."
    }
  } finally {
    loading.value = false
  }
}
</script>