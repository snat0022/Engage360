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
        <div class="col-md-4">
          <div class="card border-0 gradient-card h-100 p-4 text-center">
            <div class="display-6 mb-2">👥</div>
            <h3 class="h6 fw-semibold mb-2">Personalized Matching</h3>
            <p class="small text-muted mb-0">
              We use your information to match you with the right programs and supportive community members.
            </p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 gradient-card h-100 p-4 text-center">
            <div class="display-6 mb-2">❤️</div>
            <h3 class="h6 fw-semibold mb-2">Health &amp; Safety</h3>
            <p class="small text-muted mb-0">
              Your health information helps us create safe, appropriate activities that benefit your wellbeing.
            </p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 gradient-card h-100 p-4 text-center">
            <div class="display-6 mb-2">🛡️</div>
            <h3 class="h6 fw-semibold mb-2">Your Privacy</h3>
            <p class="small text-muted mb-0">
              All information is confidential and used solely to enhance your community sports experience.
            </p>
          </div>
        </div>
      </div>

      <!-- Form Card -->
      <div class="card shadow-card">
        <div class="card-body p-4 p-md-5">
          <h2 class="h4 fw-bold mb-1">Registration Form</h2>
          <p class="text-muted mb-4">Please fill out all required fields. This helps us provide you with the best possible experience.</p>

          <form @submit.prevent="handleSubmit" novalidate class="space-y">
            <!-- Alerts -->
            <div v-if="formAlert" class="alert alert-danger" role="alert">
              {{ formAlert }}
            </div>
            <div v-if="submitOk" class="alert alert-success" role="status">
              Registration Successful! 🎉 We’ll contact you within 24 hours.
            </div>

            <!-- Personal Information -->
            <h3 class="section-title"><span>✓</span> Personal Information</h3>
            <div class="row g-3">
              <div class="col-md-6">
                <label for="firstName" class="form-label">First Name *</label>
                <input id="firstName" type="text" class="form-control"
                       v-model.trim="form.firstName"
                       :class="invalid('firstName')" @input="clear('firstName')" />
                <div class="invalid-feedback" v-if="errors.firstName">{{ errors.firstName }}</div>
              </div>
              <div class="col-md-6">
                <label for="lastName" class="form-label">Last Name *</label>
                <input id="lastName" type="text" class="form-control"
                       v-model.trim="form.lastName"
                       :class="invalid('lastName')" @input="clear('lastName')" />
                <div class="invalid-feedback" v-if="errors.lastName">{{ errors.lastName }}</div>
              </div>

              <div class="col-md-6">
                <label for="email" class="form-label">Email Address *</label>
                <input id="email" type="email" class="form-control"
                       v-model.trim="form.email"
                       :class="invalid('email')" @input="clear('email')" autocomplete="email" />
                <div class="invalid-feedback" v-if="errors.email">{{ errors.email }}</div>
              </div>
              <div class="col-md-6">
                <label for="phone" class="form-label">Phone Number *</label>
                <input id="phone" type="tel" class="form-control" placeholder="04XX XXX XXX"
                       v-model.trim="form.phone"
                       :class="invalid('phone')" @input="clear('phone')" />
                <div class="invalid-feedback" v-if="errors.phone">{{ errors.phone }}</div>
              </div>
            </div>

            <!-- Passwords -->
            <div class="row g-3 mt-1">
              <div class="col-md-6">
                <label for="password" class="form-label">Password *</label>
                <input id="password" type="password" class="form-control"
                       v-model="form.password"
                       :class="invalid('password')" @input="clear('password')"
                       minlength="8" autocomplete="new-password" />
                <div class="form-text">Min 8 characters, include at least one letter and one number.</div>
                <div class="invalid-feedback" v-if="errors.password">{{ errors.password }}</div>
              </div>
              <div class="col-md-6">
                <label for="confirmPassword" class="form-label">Confirm Password *</label>
                <input id="confirmPassword" type="password" class="form-control"
                       v-model="form.confirmPassword"
                       :class="invalid('confirmPassword')" @input="clear('confirmPassword')"
                       autocomplete="new-password" />
                <div class="invalid-feedback" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</div>
              </div>
            </div>

            <div class="row g-3 mt-1">
              <div class="col-md-6">
                <label for="age" class="form-label">Age *</label>
                <input id="age" type="number" class="form-control" min="16" max="100"
                       v-model.trim="form.age"
                       :class="invalid('age')" @input="clear('age')" />
                <div class="invalid-feedback" v-if="errors.age">{{ errors.age }}</div>
              </div>
              <div class="col-md-6">
                <label for="address" class="form-label">Address (Suburb)</label>
                <input id="address" type="text" class="form-control"
                       v-model.trim="form.address" />
              </div>
            </div>

            <!-- Emergency Contact -->
            <h3 class="section-title mt-4"><span>✓</span> Emergency Contact</h3>
            <div class="row g-3">
              <div class="col-md-6">
                <label for="emergencyContact" class="form-label">Contact Name *</label>
                <input id="emergencyContact" type="text" class="form-control"
                       v-model.trim="form.emergencyContact"
                       :class="invalid('emergencyContact')" @input="clear('emergencyContact')" />
                <div class="invalid-feedback" v-if="errors.emergencyContact">{{ errors.emergencyContact }}</div>
              </div>
              <div class="col-md-6">
                <label for="emergencyPhone" class="form-label">Contact Phone *</label>
                <input id="emergencyPhone" type="tel" class="form-control"
                       v-model.trim="form.emergencyPhone"
                       :class="invalid('emergencyPhone')" @input="clear('emergencyPhone')" />
                <div class="invalid-feedback" v-if="errors.emergencyPhone">{{ errors.emergencyPhone }}</div>
              </div>
            </div>

            <!-- Sports & Activities -->
            <h3 class="section-title mt-4"><span>✓</span> Sports &amp; Activities Interests *</h3>
            <p class="small text-muted">Select all activities that interest you. We'll recommend programs based on your choices.</p>
            <div class="row g-2">
              <div class="col-6 col-md-4" v-for="sport in sportOptions" :key="sport">
                <div class="form-check">
                  <input class="form-check-input" :id="'i-' + sport" type="checkbox"
                         :value="sport" :checked="form.interests.includes(sport)"
                         @change="toggleInterest(sport, $event.target.checked)" />
                  <label class="form-check-label" :for="'i-' + sport">{{ sport }}</label>
                </div>
              </div>
            </div>
            <div class="invalid-feedback d-block" v-if="errors.interests">{{ errors.interests }}</div>

            <!-- Fitness Level -->
            <h3 class="section-title mt-4"><span>✓</span> Fitness Level *</h3>
            <select class="form-select" v-model="form.fitnessLevel"
                    :class="invalid('fitnessLevel')" @change="clear('fitnessLevel')">
              <option value="" disabled>Select your current fitness level</option>
              <option value="beginner">Beginner - New to exercise</option>
              <option value="moderate">Moderate - Some regular activity</option>
              <option value="active">Active - Regular exercise routine</option>
              <option value="experienced">Experienced - Long-term athlete</option>
            </select>
            <div class="invalid-feedback d-block" v-if="errors.fitnessLevel">{{ errors.fitnessLevel }}</div>

            <!-- Health info -->
            <h3 class="section-title mt-4"><span>✓</span> Health Information</h3>
            <label for="healthConditions" class="form-label">Health Conditions or Concerns</label>
            <textarea id="healthConditions" class="form-control min-h"
                      v-model.trim="form.healthConditions"></textarea>
            <p class="text-muted small mt-1">This information is confidential and helps us create appropriate activities for you.</p>

            <!-- Motivation -->
            <h3 class="section-title mt-4"><span>✓</span> Tell Us About Your Goals</h3>
            <label for="motivation" class="form-label">What motivates you to join our community?</label>
            <textarea id="motivation" class="form-control min-h"
                      v-model.trim="form.motivation"
                      placeholder="Share what you hope to achieve - better health, new friends, fun activities, or something else!"></textarea>

            <!-- Consent / Newsletter -->
            <div class="form-check mt-4">
              <input id="consent" class="form-check-input" type="checkbox"
                     v-model="form.consent" @change="clear('consent')" />
              <label for="consent" class="form-check-label">
                I agree to the terms and conditions and privacy policy *
              </label>
            </div>
            <div class="invalid-feedback d-block" v-if="errors.consent">{{ errors.consent }}</div>

            <div class="form-check">
              <input id="newsletter" class="form-check-input" type="checkbox" v-model="form.newsletter" />
              <label for="newsletter" class="form-check-label">
                Send me updates about new programs and community events
              </label>
            </div>

            <!-- Submit -->
            <div class="pt-3">
              <button class="btn btn-primary btn-lg w-100 w-md-auto" :disabled="submitting">
                {{ submitting ? 'Submitting…' : 'Submit Registration' }}
              </button>
              <p class="text-muted small mt-2 mb-0">
                After submitting, our team will contact you within 24 hours to discuss program options and next steps.
              </p>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

// options
const sportOptions = [
  'Basketball','Soccer','Swimming','Tennis','Volleyball',
  'Fitness Classes','Walking Groups','Yoga','Dancing','Cycling'
]

// state
const form = reactive({
  firstName: '', lastName: '', email: '', phone: '', age: '',
  password: '', confirmPassword: '',
  address: '', emergencyContact: '', emergencyPhone: '',
  interests: [], fitnessLevel: '', healthConditions: '',
  motivation: '', consent: false, newsletter: false
})
const errors = reactive({})
const formAlert = ref('')
const submitOk  = ref(false)
const submitting = ref(false)

// helpers
const clear = (field) => { if (errors[field]) delete errors[field]; formAlert.value = '' }
const invalid = (field) => (errors[field] ? 'is-invalid' : '')

function toggleInterest(sport, checked) {
  if (checked) {
    if (!form.interests.includes(sport)) form.interests.push(sport)
  } else {
    const i = form.interests.indexOf(sport)
    if (i > -1) form.interests.splice(i, 1)
  }
  clear('interests')
}

function validate() {
  // reset
  Object.keys(errors).forEach(k => delete errors[k])
  formAlert.value = ''
  submitOk.value = false

  // required names
  if (!form.firstName.trim()) errors.firstName = 'First name is required'
  if (!form.lastName.trim()) errors.lastName = 'Last name is required'

  // email
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.email.trim()) errors.email = 'Email is required'
  else if (!emailRe.test(form.email)) errors.email = 'Please enter a valid email address'

  // AU phone
  const phoneRe = /^(\+61|0)[2-9]\d{8}$/
  const ph = form.phone.replace(/\s/g, '')
  if (!form.phone.trim()) errors.phone = 'Phone number is required'
  else if (!phoneRe.test(ph)) errors.phone = 'Please enter a valid Australian phone number'

  // passwords
  const strongPw = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
  if (!form.password) errors.password = 'Password is required'
  else if (!strongPw.test(form.password)) errors.password = 'Password must be at least 8 characters and include a letter and a number'
  if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password'
  else if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords must match'

  // age
  const ageNum = parseInt(form.age, 10)
  if (!form.age.trim()) errors.age = 'Age is required'
  else if (isNaN(ageNum) || ageNum < 16 || ageNum > 100) errors.age = 'Age must be between 16 and 100'

  // emergency
  if (!form.emergencyContact.trim()) errors.emergencyContact = 'Emergency contact is required'
  if (!form.emergencyPhone.trim()) errors.emergencyPhone = 'Emergency phone is required'

  // fitness & interests
  if (!form.fitnessLevel) errors.fitnessLevel = 'Please select your fitness level'
  if (form.interests.length === 0) errors.interests = 'Please select at least one sport interest'

  // consent
  if (!form.consent) errors.consent = 'You must agree to the terms and conditions'

  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  if (!validate()) {
    formAlert.value = 'Please check your information — some fields need your attention.'
    return
  }
  submitting.value = true
  try {
    // simulate API latency
    await new Promise(r => setTimeout(r, 1200))
    submitOk.value = true

    // reset form
    Object.assign(form, {
      firstName: '', lastName: '', email: '', phone: '', age: '',
      password: '', confirmPassword: '',
      address: '', emergencyContact: '', emergencyPhone: '',
      interests: [], fitnessLevel: '', healthConditions: '',
      motivation: '', consent: false, newsletter: false
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* page bg token */
.bg-muted { background: #f6f9fc; }

/* cards */
.gradient-card {
  background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
  border-radius: 1rem;
}
.shadow-card { box-shadow: 0 14px 34px rgba(2,6,23,.08); }

/* form */
.min-h { min-height: 5rem; }
.section-title {
  font-size: 1rem; font-weight: 700; margin: 1.25rem 0 .75rem;
  display: flex; align-items: center; gap: .5rem;
}
.section-title span { color: #0d6efd; }

/* spacing helper */
.space-y > * + * { margin-top: 1rem; }

/* responsiveness per rubric */
@media (max-width: 575.98px) {
  .registration-page .card-body { padding: 1rem; }
}
@media (min-width: 1400px) {
  .registration-page .container { max-width: 1100px; }
}
</style>
