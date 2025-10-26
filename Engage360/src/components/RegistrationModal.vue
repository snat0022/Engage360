<template>
  <!-- Registration Modal -->
  <div class="modal fade" id="registrationModal" tabindex="-1" aria-labelledby="registrationModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="registrationModalLabel">Register for Programs</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <!-- Show different content based on login status -->
          <div v-if="firebaseAuthStore.isLoggedIn()" class="alert alert-info">
            <h6>Welcome back, {{ firebaseAuthStore.currentUser.displayName || firebaseAuthStore.currentUser.email }}!</h6>
            <p class="mb-0">You're already logged in. You can register for additional programs below.</p>
          </div>

          <div v-if="success" class="alert alert-success">
            <h6>Registration Successful! 🎉</h6>
            <p class="mb-3">{{ successMessage }}</p>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-success btn-sm" @click="registerMore">
                Register for More Programs
              </button>
              <RouterLink to="/programs" class="btn btn-success btn-sm" data-bs-dismiss="modal">
                View All Programs
              </RouterLink>
            </div>
          </div>
          <div v-if="error" class="alert alert-danger">{{ error }}</div>

          <form @submit.prevent="handleRegister" novalidate>
            <!-- Only show account creation fields if user is not logged in -->
            <div v-if="!firebaseAuthStore.isLoggedIn()">
              <h6 class="mb-3">Create Account</h6>
              <div class="mb-3">
                <label for="modal-name" class="form-label">Full Name *</label>
                <input
                  type="text"
                  id="modal-name"
                  v-model.trim="form.name"
                  class="form-control"
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div class="mb-3">
                <label for="modal-email" class="form-label">Email Address *</label>
                <input
                  type="email"
                  id="modal-email"
                  v-model.trim="form.email"
                  class="form-control"
                  required
                  autocomplete="email"
                  placeholder="Enter your email address"
                />
              </div>

              <div class="mb-3">
                <label for="modal-password" class="form-label">Password *</label>
                <input
                  type="password"
                  id="modal-password"
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
                <label for="modal-confirmPassword" class="form-label">Confirm Password *</label>
                <input
                  type="password"
                  id="modal-confirmPassword"
                  v-model="form.confirmPassword"
                  class="form-control"
                  required
                  autocomplete="new-password"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <!-- Program Selection (always shown) -->
            <h6 class="mb-3">Select Programs</h6>
            <div class="mb-4">
              <label class="form-label">Select Program(s) *</label>
              <div class="row g-2">
                <div class="col-6 col-md-4" v-for="program in availablePrograms" :key="program.id">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :id="`modal-program-${program.id}`"
                      :value="program.id"
                      :checked="form.selectedPrograms.includes(program.id)"
                      @change="toggleProgram(program.id, $event.target.checked)"
                    />
                    <label class="form-check-label" :for="`modal-program-${program.id}`">
                      {{ program.name }}
                    </label>
                  </div>
                </div>
              </div>
              <div class="form-text">Select one or more programs you're interested in</div>
            </div>

            <!-- Fitness Level -->
            <div class="mb-3">
              <label for="modal-fitnessLevel" class="form-label">Fitness Level *</label>
              <select id="modal-fitnessLevel" v-model="form.fitnessLevel" class="form-select" required>
                <option disabled value="">Select your fitness level</option>
                <option value="beginner">Beginner</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
                <option value="experienced">Experienced</option>
              </select>
            </div>

            <!-- Health Conditions -->
            <div class="mb-3">
              <label for="modal-healthConditions" class="form-label">Health Conditions (Optional)</label>
              <textarea
                id="modal-healthConditions"
                v-model="form.healthConditions"
                class="form-control"
                rows="3"
                placeholder="Please mention any health conditions or limitations..."
              ></textarea>
            </div>

            <!-- Submit Button -->
            <div class="d-grid">
              <button class="btn btn-primary" type="submit" :disabled="loading">
                {{ loading ? 'Processing...' : (firebaseAuthStore.isLoggedIn() ? 'Register for Programs' : 'Create Account & Register') }}
              </button>
            </div>
          </form>

          <!-- Login Link (only show if not logged in) -->
          <div v-if="!firebaseAuthStore.isLoggedIn()" class="text-center mt-3">
            <p class="mb-0">
              Already have an account?
              <RouterLink to="/login" class="text-decoration-none" data-bs-dismiss="modal">Login here</RouterLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { firebaseAuthStore } from "@/stores/firebaseAuth"
import { firestoreService } from "@/services/firestoreService"
import { sanitize } from "@/utils/sanitize"

const form = ref({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "user",
  selectedPrograms: [],
  fitnessLevel: "",
  healthConditions: ""
})

const availablePrograms = ref([
  { id: 1, name: 'Basketball for Beginners' },
  { id: 2, name: 'Community Soccer' },
  { id: 3, name: 'Swimming Lessons' },
  { id: 4, name: 'Tennis Fundamentals' },
  { id: 5, name: 'Volleyball League' },
  { id: 6, name: 'Fitness Classes' },
  { id: 7, name: 'Walking Groups' },
  { id: 8, name: 'Yoga Sessions' },
  { id: 9, name: 'Dancing Classes' },
  { id: 10, name: 'Cycling Groups' }
])

const error = ref("")
const success = ref(false)
const loading = ref(false)
const successMessage = ref("")

function toggleProgram(programId, checked) {
  if (checked) {
    form.value.selectedPrograms.push(programId)
  } else {
    form.value.selectedPrograms = form.value.selectedPrograms.filter(id => id !== programId)
  }
}

function registerMore() {
  success.value = false
  error.value = ""
}

async function handleRegister() {
  console.log('=== Modal Registration Started ===')
  console.log('Form data:', form.value)
  console.log('Is logged in:', firebaseAuthStore.isLoggedIn())
  console.log('Current user:', firebaseAuthStore.currentUser)
  
  error.value = ""
  success.value = false
  loading.value = true

  // Validation
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  // Only validate account fields if user is not logged in
  if (!firebaseAuthStore.isLoggedIn()) {
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
  }

  // Always validate program selection and fitness level
  if (form.value.selectedPrograms.length === 0) {
    error.value = "Please select at least one program."
    loading.value = false
    return
  }
  if (!form.value.fitnessLevel) {
    error.value = "Please select your fitness level."
    loading.value = false
    return
  }

  try {
    let user = null

    // If user is not logged in, create account first
    if (!firebaseAuthStore.isLoggedIn()) {
      console.log('Creating new account...')
      user = await firebaseAuthStore.registerWithEmail(
        sanitize(form.value.email),
        sanitize(form.value.password),
        sanitize(form.value.name)
      )
      console.log('Account created:', user)
    } else {
      // User is already logged in, use current user
      user = firebaseAuthStore.currentUser
      console.log('Using existing user:', user)
    }

    // Save registration data to Firestore
    const registrationData = {
      firstName: firebaseAuthStore.isLoggedIn() ? user.displayName : sanitize(form.value.name),
      lastName: '',
      email: user.email,
      phone: '',
      emergencyContact: '',
      emergencyPhone: '',
      interests: form.value.selectedPrograms.map(id => {
        const program = availablePrograms.value.find(p => p.id === id)
        return program ? program.name : `Program ${id}`
      }),
      fitnessLevel: sanitize(form.value.fitnessLevel),
      healthConditions: sanitize(form.value.healthConditions),
      motivation: '',
      consent: true,
      selectedPrograms: form.value.selectedPrograms,
      userId: user.uid,
      createdAt: new Date().toISOString()
    }

    console.log('Saving registration data:', registrationData)

    // Save to Firestore (with fallback)
    try {
      const registrationId = await firestoreService.createRegistration(registrationData)
      console.log('Registration saved to Firestore with ID:', registrationId)
    } catch (firestoreError) {
      console.warn('Firestore not available, saving to localStorage:', firestoreError)
      // Fallback to localStorage if Firestore fails
      const existingRegistrations = JSON.parse(localStorage.getItem('user-registrations') || '[]')
      existingRegistrations.push({
        ...registrationData,
        timestamp: new Date().toISOString()
      })
      localStorage.setItem('user-registrations', JSON.stringify(existingRegistrations))
      console.log('Registration saved to localStorage')
    }

    success.value = true
    successMessage.value = firebaseAuthStore.isLoggedIn() 
      ? "You've been successfully registered for the selected programs!"
      : "Your account has been created and you've been registered for the selected programs!"
    
    // Reset form
    form.value = { 
      name: "", 
      email: "", 
      password: "", 
      confirmPassword: "", 
      selectedPrograms: [],
      fitnessLevel: "",
      healthConditions: ""
    }
    
  } catch (err) {
    console.error('Registration error:', err)
    console.error('Error details:', err.code, err.message)
    error.value = err.message || "Registration failed. Please try again."
    
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
