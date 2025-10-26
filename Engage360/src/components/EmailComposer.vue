<template>
  <div class="email-composer">
    <h3 class="mb-4">Send Email</h3>
    
    <div v-if="message" class="alert" :class="message.type === 'success' ? 'alert-success' : 'alert-danger'">
      {{ message.text }}
    </div>

    <form @submit.prevent="sendEmail">
      <div class="mb-3">
        <label for="to" class="form-label">To *</label>
        <input
          id="to"
          type="email"
          v-model="emailData.to"
          class="form-control"
          required
          placeholder="recipient@example.com"
        />
      </div>

      <div class="mb-3">
        <label for="subject" class="form-label">Subject *</label>
        <input
          id="subject"
          type="text"
          v-model="emailData.subject"
          class="form-control"
          required
          placeholder="Email subject"
        />
      </div>

      <div class="mb-3">
        <label for="message" class="form-label">Message *</label>
        <textarea
          id="message"
          v-model="emailData.message"
          class="form-control"
          rows="6"
          required
          placeholder="Type your message here..."
        ></textarea>
      </div>

      <div class="mb-3">
        <label for="attachments" class="form-label">Attachments</label>
        <input
          id="attachments"
          type="file"
          @change="handleFileUpload"
          class="form-control"
          multiple
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
        />
        <div class="form-text">Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (max 10MB each)</div>
      </div>

      <div v-if="attachments.length > 0" class="mb-3">
        <h6>Selected Files:</h6>
        <ul class="list-group">
          <li v-for="(file, index) in attachments" :key="index" class="list-group-item d-flex justify-content-between align-items-center">
            <span>{{ file.name }} ({{ formatFileSize(file.size) }})</span>
            <button type="button" class="btn btn-sm btn-outline-danger" @click="removeAttachment(index)">
              Remove
            </button>
          </li>
        </ul>
      </div>

      <div class="d-flex gap-2">
        <button type="submit" class="btn btn-primary" :disabled="sending">
          <span v-if="sending" class="spinner-border spinner-border-sm me-2"></span>
          {{ sending ? 'Sending...' : 'Send Email' }}
        </button>
        <button type="button" class="btn btn-secondary" @click="resetForm">Reset</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { emailService } from '@/services/emailService'

const emailData = reactive({
  to: '',
  subject: '',
  message: ''
})

const attachments = ref([])
const sending = ref(false)
const message = ref(null)

function handleFileUpload(event) {
  const files = Array.from(event.target.files)
  
  files.forEach(file => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert(`File ${file.name} is too large. Maximum size is 10MB.`)
      return
    }
    
    attachments.value.push(file)
  })
  
  event.target.value = '' // Clear input
}

function removeAttachment(index) {
  attachments.value.splice(index, 1)
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function sendEmail() {
  sending.value = true
  message.value = null

  try {
    // Convert files to base64 for SendGrid
    const emailAttachments = await Promise.all(
      attachments.value.map(async (file) => {
        const base64 = await fileToBase64(file)
        return {
          content: base64,
          filename: file.name,
          type: file.type,
          disposition: 'attachment'
        }
      })
    )

    const result = await emailService.sendEmail({
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.message,
      html: emailData.message.replace(/\n/g, '<br>'),
      attachments: emailAttachments
    })

    if (result.success) {
      message.value = { type: 'success', text: 'Email sent successfully!' }
      resetForm()
    } else {
      message.value = { type: 'error', text: `Failed to send email: ${result.error}` }
    }
  } catch (error) {
    message.value = { type: 'error', text: `Error: ${error.message}` }
  } finally {
    sending.value = false
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = reader.result.split(',')[1] // Remove data:type;base64, prefix
      resolve(base64)
    }
    reader.onerror = error => reject(error)
  })
}

function resetForm() {
  emailData.to = ''
  emailData.subject = ''
  emailData.message = ''
  attachments.value = []
  message.value = null
}
</script>

<style scoped>
.email-composer {
  max-width: 800px;
  margin: 0 auto;
}
</style>
