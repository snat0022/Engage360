<template>
  <div class="registration-page bg-muted">
    <div class="container py-4 py-md-5">
      <!-- Header -->
      <div class="text-center mb-4 mb-md-5">
        <h1 class="fw-bold mb-2">Join Our Community</h1>
        <p class="lead text-muted mx-auto" style="max-width: 40rem;">
          Take the first step towards better health and stronger connections.
          We'll match you with programs that fit your needs and goals.
        </p>
      </div>

      <!-- Why we ask -->
      <div class="row g-3 g-md-4 mb-4 mb-md-5">
        <div class="col-md-4" v-for="(info, i) in infoCards" :key="i">
          <div class="card border-0 gradient-card h-100 p-4 text-center">
            <div class="display-6 mb-2">{{ info.icon }}</div>
            <h3 class="h6 fw-semibold mb-2">{{ info.title }}</h3>
            <p class="small text-muted mb-0">{{ info.desc }}</p>
          </div>
        </div>
      </div>

      <!-- Form Card -->
      <div class="card shadow-card">
        <div class="card-body p-4 p-md-5">
          <h2 class="h4 fw-bold mb-1">Registration Form</h2>
          <p class="text-muted mb-4">
            Please fill out all required fields. This helps us provide you with the best possible experience.
          </p>

          <form @submit.prevent="handleSubmit" novalidate class="space-y">
            <div v-if="formAlert" class="alert alert-danger">{{ formAlert }}</div>
            <div v-if="submitOk" class="alert alert-success">
              ✅ Submission Successful! 🎉 We’ll contact you within 24 hours.
            </div>

            <!-- Personal Info -->
            <h3 class="section-title"><span>✓</span> Personal Information</h3>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">First Name *</label>
                <input class="form-control" v-model.trim="form.firstName" :class="invalid('firstName')" @input="clear('firstName')" />
                <div class="invalid-feedback" v-if="errors.firstName">{{ errors.firstName }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Last Name *</label>
                <input class="form-control" v-model.trim="form.lastName" :class="invalid('lastName')" @input="clear('lastName')" />
                <div class="invalid-feedback" v-if="errors.lastName">{{ errors.lastName }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Email *</label>
                <input class="form-control" v-model.trim="form.email" :class="invalid('email')" @input="clear('email')" />
                <div class="invalid-feedback" v-if="errors.email">{{ errors.email }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Phone *</label>
                <input class="form-control" v-model.trim="form.phone" :class="invalid('phone')" @input="clear('phone')" />
                <div class="invalid-feedback" v-if="errors.phone">{{ errors.phone }}</div>
              </div>
            </div>

            <!-- Emergency -->
            <h3 class="section-title mt-4"><span>✓</span> Emergency Contact</h3>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Contact Name *</label>
                <input class="form-control" v-model.trim="form.emergencyContact" :class="invalid('emergencyContact')" @input="clear('emergencyContact')" />
                <div class="invalid-feedback" v-if="errors.emergencyContact">{{ errors.emergencyContact }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Contact Phone *</label>
                <input class="form-control" v-model.trim="form.emergencyPhone" :class="invalid('emergencyPhone')" @input="clear('emergencyPhone')" />
                <div class="invalid-feedback" v-if="errors.emergencyPhone">{{ errors.emergencyPhone }}</div>
              </div>
            </div>

            <!-- Sports Interests -->
            <h3 class="section-title mt-4"><span>✓</span> Sports & Activities Interests *</h3>
            <div class="row g-2">
              <div class="col-6 col-md-4" v-for="sport in sportOptions" :key="sport">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" :id="sport" :value="sport" :checked="form.interests.includes(sport)" @change="toggleInterest(sport, $event.target.checked)" />
                  <label class="form-check-label" :for="sport">{{ sport }}</label>
                </div>
              </div>
            </div>
            <div class="invalid-feedback d-block" v-if="errors.interests">{{ errors.interests }}</div>

            <!-- Fitness -->
            <h3 class="section-title mt-4"><span>✓</span> Fitness Level *</h3>
            <select class="form-select" v-model="form.fitnessLevel" :class="invalid('fitnessLevel')" @change="clear('fitnessLevel')">
              <option disabled value="">Select your fitness level</option>
              <option>Beginner</option>
              <option>Moderate</option>
              <option>Active</option>
              <option>Experienced</option>
            </select>
            <div class="invalid-feedback d-block" v-if="errors.fitnessLevel">{{ errors.fitnessLevel }}</div>

            <!-- Optional Info -->
            <h3 class="section-title mt-4"><span>✓</span> Health Info</h3>
            <textarea class="form-control" v-model.trim="form.healthConditions"></textarea>

            <h3 class="section-title mt-4"><span>✓</span> Motivation</h3>
            <textarea class="form-control" v-model.trim="form.motivation"></textarea>

            <!-- Consent -->
            <div class="form-check mt-4">
              <input class="form-check-input" type="checkbox" id="consent" v-model="form.consent" @change="clear('consent')" />
              <label class="form-check-label" for="consent">I agree to terms and privacy policy *</label>
              <div class="invalid-feedback d-block" v-if="errors.consent">{{ errors.consent }}</div>
            </div>

            <!-- Submit -->
            <div class="pt-3">
              <button class="btn btn-primary btn-lg w-100 w-md-auto" :disabled="submitting">
                {{ submitting ? 'Submitting…' : 'Submit Registration' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { sanitize } from '@/utils/sanitize'
import { authStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { registrationStore } from '@/stores/registrationStore'

const router = useRouter()
onMounted(() => {
  if (!authStore.isLoggedIn()) {
    router.push('/login')
  }
})

const infoCards = [
  { icon: '👥', title: 'Personalized Matching', desc: 'We match you with the right programs and community members.' },
  { icon: '❤️', title: 'Health & Safety', desc: 'Health info helps us create safe, beneficial activities.' },
  { icon: '🛡️', title: 'Your Privacy', desc: 'Your data is confidential, used only to improve your experience.' }
]

const sportOptions = [
  'Basketball', 'Soccer', 'Swimming', 'Tennis', 'Volleyball',
  'Fitness Classes', 'Walking Groups', 'Yoga', 'Dancing', 'Cycling'
]

const form = reactive({
  firstName: '', lastName: '', email: '', phone: '',
  emergencyContact: '', emergencyPhone: '',
  interests: [], fitnessLevel: '',
  healthConditions: '', motivation: '', consent: false
})

const errors = reactive({})
const formAlert = ref('')
const submitOk = ref(false)
const submitting = ref(false)

function clear(field) {
  if (errors[field]) delete errors[field]
  formAlert.value = ''
}

function invalid(field) {
  return errors[field] ? 'is-invalid' : ''
}

function toggleInterest(sport, checked) {
  if (checked) form.interests.push(sport)
  else form.interests = form.interests.filter(i => i !== sport)
  clear('interests')
}

function validate() {
  Object.keys(errors).forEach(k => delete errors[k])
  formAlert.value = ''
  submitOk.value = false

  if (!form.firstName) errors.firstName = 'Required'
  if (!form.lastName) errors.lastName = 'Required'

  if (!form.email) errors.email = 'Required'
  else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Invalid email format'

  if (!form.phone) errors.phone = 'Required'
  else if (!/^\+?\d{10,15}$/.test(form.phone)) errors.phone = 'Invalid phone number'

  if (!form.emergencyContact) errors.emergencyContact = 'Required'
  if (!form.emergencyPhone) errors.emergencyPhone = 'Required'
  else if (!/^\+?\d{10,15}$/.test(form.emergencyPhone)) errors.emergencyPhone = 'Invalid phone number'

  if (form.interests.length === 0) errors.interests = 'Select at least one'
  if (!form.fitnessLevel) errors.fitnessLevel = 'Required'
  if (!form.consent) errors.consent = 'Required'

  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  if (!validate()) {
    formAlert.value = 'Please check your information — some fields need your attention.'
    submitOk.value = false
    return
  }

  formAlert.value = ''
  submitting.value = true

  try {
    await new Promise(r => setTimeout(r, 1200))

    const cleanedForm = {
      ...form,
      firstName: sanitize(form.firstName),
      lastName: sanitize(form.lastName),
      email: sanitize(form.email),
      phone: sanitize(form.phone),
      emergencyContact: sanitize(form.emergencyContact),
      emergencyPhone: sanitize(form.emergencyPhone),
      healthConditions: sanitize(form.healthConditions),
      motivation: sanitize(form.motivation),
      timestamp: new Date().toISOString()
    }

    // ✅ Corrected method name
    registrationStore.add(cleanedForm)

    const submissions = JSON.parse(localStorage.getItem('user-registrations') || '[]')
    submissions.push(cleanedForm)
    localStorage.setItem('user-registrations', JSON.stringify(submissions))

    submitOk.value = true

    Object.assign(form, {
      firstName: '', lastName: '', email: '', phone: '',
      emergencyContact: '', emergencyPhone: '',
      interests: [], fitnessLevel: '', healthConditions: '',
      motivation: '', consent: false
    })
  } catch (err) {
    console.error('Submission failed:', err)
    formAlert.value = 'Something went wrong during submission. Please try again.'
    submitOk.value = false
  } finally {
    submitting.value = false
  }
}
</script>


<style scoped>
.bg-muted { background: #f6f9fc; }
.gradient-card { background: linear-gradient(180deg, #fff, #f7fbff); border-radius: 1rem; }
.shadow-card { box-shadow: 0 14px 34px rgba(2,6,23,.08); }
.min-h { min-height: 5rem; }
.section-title { font-size: 1rem; font-weight: 700; margin: 1.25rem 0 .75rem; display: flex; align-items: center; gap: .5rem; }
.section-title span { color: #0d6efd; }
.space-y > * + * { margin-top: 1rem; }
@media (max-width: 575.98px) { .registration-page .card-body { padding: 1rem; } }
@media (min-width: 1400px) { .registration-page .container { max-width: 1100px; } }
</style>
