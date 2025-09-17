// src/stores/registrationStore.js
import { reactive } from 'vue'

const STORAGE_KEY = 'vue-form-submissions'

export const registrationStore = reactive({
  submissions: JSON.parse(localStorage.getItem(STORAGE_KEY)) || [],

  add(submission) {
    submission.id = Date.now()
    this.submissions.push(submission)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.submissions))
  },

  getAll() {
    return this.submissions
  },

  clearAll() {
    this.submissions = []
    localStorage.removeItem(STORAGE_KEY)
  },

  // ✅ Add this method to fix reload issue
  reload() {
    this.submissions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  }
})
