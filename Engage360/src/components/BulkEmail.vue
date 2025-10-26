<template>
  <div class="bulk-email">
    <div class="email-header">
      <h3><i class="fas fa-envelope-open-text"></i> Bulk Email Management</h3>
      <p class="text-muted">Send emails to multiple users with advanced targeting</p>
    </div>

    <!-- Email Composition -->
    <div class="email-composer">
      <div class="card">
        <div class="card-header">
          <h5><i class="fas fa-edit"></i> Compose Email</h5>
        </div>
        <div class="card-body">
          <form @submit.prevent="sendBulkEmail">
            <div class="row g-3">
              <!-- Recipient Selection -->
              <div class="col-12">
                <label class="form-label">Recipients *</label>
                <div class="recipient-selection">
                  <div class="btn-group mb-3" role="group">
                    <button type="button" class="btn btn-outline-primary" :class="{ active: recipientType === 'all' }" 
                      @click="recipientType = 'all'">
                      <i class="fas fa-users"></i> All Users
                    </button>
                    <button type="button" class="btn btn-outline-primary" :class="{ active: recipientType === 'program' }" 
                      @click="recipientType = 'program'">
                      <i class="fas fa-graduation-cap"></i> By Program
                    </button>
                    <button type="button" class="btn btn-outline-primary" :class="{ active: recipientType === 'custom' }" 
                      @click="recipientType = 'custom'">
                      <i class="fas fa-user-plus"></i> Custom List
                    </button>
                  </div>

                  <!-- Program Selection -->
                  <div v-if="recipientType === 'program'" class="program-selection">
                    <select v-model="selectedProgram" class="form-select" @change="loadProgramUsers">
                      <option value="">Select a program</option>
                      <option v-for="program in programs" :key="program.id" :value="program.id">
                        {{ program.name }}
                      </option>
                    </select>
                    <div v-if="programUsers.length > 0" class="mt-2">
                      <small class="text-muted">{{ programUsers.length }} users enrolled</small>
                    </div>
                  </div>

                  <!-- Custom Recipients -->
                  <div v-if="recipientType === 'custom'" class="custom-recipients">
                    <div class="input-group">
                      <input type="email" v-model="customEmail" class="form-control" placeholder="Enter email address">
                      <button type="button" class="btn btn-outline-secondary" @click="addCustomRecipient">
                        <i class="fas fa-plus"></i> Add
                      </button>
                    </div>
                    <div v-if="customRecipients.length > 0" class="mt-2">
                      <div class="d-flex flex-wrap gap-1">
                        <span v-for="(email, index) in customRecipients" :key="index" class="badge bg-primary">
                          {{ email }}
                          <button type="button" class="btn-close btn-close-white ms-1" @click="removeCustomRecipient(index)"></button>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Email Subject -->
              <div class="col-12">
                <label for="emailSubject" class="form-label">Subject *</label>
                <input type="text" id="emailSubject" v-model="emailForm.subject" class="form-control" required>
              </div>

              <!-- Email Template -->
              <div class="col-12">
                <label class="form-label">Email Template</label>
                <div class="btn-group mb-2" role="group">
                  <button type="button" class="btn btn-outline-secondary" :class="{ active: emailTemplate === 'custom' }" 
                    @click="emailTemplate = 'custom'">
                    <i class="fas fa-edit"></i> Custom
                  </button>
                  <button type="button" class="btn btn-outline-secondary" :class="{ active: emailTemplate === 'newsletter' }" 
                    @click="loadTemplate('newsletter')">
                    <i class="fas fa-newspaper"></i> Newsletter
                  </button>
                  <button type="button" class="btn btn-outline-secondary" :class="{ active: emailTemplate === 'reminder' }" 
                    @click="loadTemplate('reminder')">
                    <i class="fas fa-bell"></i> Reminder
                  </button>
                  <button type="button" class="btn btn-outline-secondary" :class="{ active: emailTemplate === 'announcement' }" 
                    @click="loadTemplate('announcement')">
                    <i class="fas fa-bullhorn"></i> Announcement
                  </button>
                </div>
              </div>

              <!-- Email Content -->
              <div class="col-12">
                <label for="emailContent" class="form-label">Message Content *</label>
                <div class="email-editor">
                  <div class="editor-toolbar">
                    <button type="button" class="btn btn-sm btn-outline-secondary" @click="insertVariable('name')">
                      <i class="fas fa-user"></i> Name
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-secondary" @click="insertVariable('program')">
                      <i class="fas fa-graduation-cap"></i> Program
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-secondary" @click="insertVariable('date')">
                      <i class="fas fa-calendar"></i> Date
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-secondary" @click="insertVariable('link')">
                      <i class="fas fa-link"></i> Link
                    </button>
                  </div>
                  <textarea id="emailContent" v-model="emailForm.content" class="form-control" rows="10" required
                    placeholder="Enter your email content here. Use variables like {{name}}, {{program}}, {{date}}, {{link}} for personalization."></textarea>
                </div>
              </div>

              <!-- Email Options -->
              <div class="col-md-6">
                <label for="emailPriority" class="form-label">Priority</label>
                <select id="emailPriority" v-model="emailForm.priority" class="form-select">
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div class="col-md-6">
                <label for="emailCategory" class="form-label">Category</label>
                <select id="emailCategory" v-model="emailForm.category" class="form-select">
                  <option value="general">General</option>
                  <option value="program">Program Related</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="reminder">Reminder</option>
                  <option value="announcement">Announcement</option>
                  <option value="promotional">Promotional</option>
                </select>
              </div>

              <!-- Scheduling Options -->
              <div class="col-12">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="scheduleEmail" v-model="emailForm.scheduled">
                  <label class="form-check-label" for="scheduleEmail">
                    Schedule email for later
                  </label>
                </div>
                <div v-if="emailForm.scheduled" class="mt-2">
                  <input type="datetime-local" v-model="emailForm.scheduledTime" class="form-control">
                </div>
              </div>

              <!-- Advanced Options -->
              <div class="col-12">
                <div class="accordion" id="advancedOptions">
                  <div class="accordion-item">
                    <h2 class="accordion-header">
                      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" 
                        data-bs-target="#collapseAdvanced" aria-expanded="false" aria-controls="collapseAdvanced">
                        <i class="fas fa-cog"></i> Advanced Options
                      </button>
                    </h2>
                    <div id="collapseAdvanced" class="accordion-collapse collapse" data-bs-parent="#advancedOptions">
                      <div class="accordion-body">
                        <div class="row g-3">
                          <div class="col-md-6">
                            <div class="form-check">
                              <input class="form-check-input" type="checkbox" id="trackOpens" v-model="emailForm.trackOpens">
                              <label class="form-check-label" for="trackOpens">
                                Track email opens
                              </label>
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="form-check">
                              <input class="form-check-input" type="checkbox" id="trackClicks" v-model="emailForm.trackClicks">
                              <label class="form-check-label" for="trackClicks">
                                Track link clicks
                              </label>
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="form-check">
                              <input class="form-check-input" type="checkbox" id="requireReply" v-model="emailForm.requireReply">
                              <label class="form-check-label" for="requireReply">
                                Require reply
                              </label>
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="form-check">
                              <input class="form-check-input" type="checkbox" id="sendCopy" v-model="emailForm.sendCopy">
                              <label class="form-check-label" for="sendCopy">
                                Send copy to admin
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-4 d-flex gap-2">
              <button type="button" class="btn btn-outline-secondary" @click="previewEmail">
                <i class="fas fa-eye"></i> Preview
              </button>
              <button type="button" class="btn btn-outline-info" @click="saveDraft">
                <i class="fas fa-save"></i> Save Draft
              </button>
              <button type="submit" class="btn btn-primary" :disabled="sending">
                <i class="fas fa-paper-plane"></i>
                {{ sending ? 'Sending...' : 'Send Email' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Email Campaigns Management -->
    <div class="email-campaigns mt-4">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5><i class="fas fa-chart-line"></i> Email Campaigns</h5>
          <div class="btn-group">
            <button class="btn btn-outline-primary btn-sm" @click="loadCampaigns">
              <i class="fas fa-sync"></i> Refresh
            </button>
            <button class="btn btn-outline-success btn-sm" @click="exportCampaigns">
              <i class="fas fa-download"></i> Export
            </button>
          </div>
        </div>
        <div class="card-body">
          <div v-if="campaigns.length === 0" class="text-center py-4">
            <p class="text-muted">No email campaigns found.</p>
          </div>
          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Recipients</th>
                  <th>Sent</th>
                  <th>Opens</th>
                  <th>Clicks</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="campaign in campaigns" :key="campaign.id">
                  <td>{{ campaign.subject }}</td>
                  <td>{{ campaign.recipientCount }}</td>
                  <td>{{ formatDate(campaign.sentAt) }}</td>
                  <td>
                    <span class="badge bg-info">{{ campaign.openCount }} ({{ campaign.openRate }}%)</span>
                  </td>
                  <td>
                    <span class="badge bg-success">{{ campaign.clickCount }} ({{ campaign.clickRate }}%)</span>
                  </td>
                  <td>
                    <span :class="getStatusClass(campaign.status)" class="badge">
                      {{ campaign.status }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button @click="viewCampaign(campaign)" class="btn btn-outline-info" title="View Details">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button @click="resendCampaign(campaign)" class="btn btn-outline-warning" title="Resend"
                        v-if="campaign.status === 'failed'">
                        <i class="fas fa-redo"></i>
                      </button>
                      <button @click="deleteCampaign(campaign)" class="btn btn-outline-danger" title="Delete">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Email Preview Modal -->
    <div class="modal fade" id="previewModal" tabindex="-1" aria-labelledby="previewModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="previewModalLabel">
              <i class="fas fa-eye"></i> Email Preview
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="email-preview">
              <div class="preview-header">
                <strong>To:</strong> {{ getRecipientCount() }} recipients<br>
                <strong>Subject:</strong> {{ emailForm.subject }}
              </div>
              <div class="preview-content" v-html="previewContent"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="sendBulkEmail">Send Email</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { emailService } from '@/services/emailService'
import { firestoreService } from '@/services/firestoreService'
import { firebaseAuthStore } from '@/stores/firebaseAuth'

// Reactive data
const sending = ref(false)
const recipientType = ref('all')
const selectedProgram = ref('')
const customEmail = ref('')
const customRecipients = ref([])
const programUsers = ref([])
const programs = ref([])
const campaigns = ref([])
const emailTemplate = ref('custom')

// Email form
const emailForm = ref({
  subject: '',
  content: '',
  priority: 'normal',
  category: 'general',
  scheduled: false,
  scheduledTime: '',
  trackOpens: true,
  trackClicks: true,
  requireReply: false,
  sendCopy: true
})

// Computed properties
const previewContent = computed(() => {
  let content = emailForm.value.content
  
  // Replace variables with sample data
  content = content.replace(/\{\{name\}\}/g, 'John Doe')
  content = content.replace(/\{\{program\}\}/g, 'Basketball for Beginners')
  content = content.replace(/\{\{date\}\}/g, new Date().toLocaleDateString())
  content = content.replace(/\{\{link\}\}/g, '<a href="#">Click here</a>')
  
  // Convert line breaks to HTML
  content = content.replace(/\n/g, '<br>')
  
  return content
})

// Methods
const loadPrograms = async () => {
  try {
    const programsData = await firestoreService.getAllPrograms()
    programs.value = programsData.filter(p => p.status === 'active')
  } catch (error) {
    console.error('Error loading programs:', error)
  }
}

const loadProgramUsers = async () => {
  if (!selectedProgram.value) return
  
  try {
    const users = await firestoreService.getProgramUsers(selectedProgram.value)
    programUsers.value = users
  } catch (error) {
    console.error('Error loading program users:', error)
  }
}

const addCustomRecipient = () => {
  if (customEmail.value && !customRecipients.value.includes(customEmail.value)) {
    customRecipients.value.push(customEmail.value)
    customEmail.value = ''
  }
}

const removeCustomRecipient = (index) => {
  customRecipients.value.splice(index, 1)
}

const insertVariable = (variable) => {
  const textarea = document.getElementById('emailContent')
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = textarea.value
  const before = text.substring(0, start)
  const after = text.substring(end, text.length)
  
  emailForm.value.content = before + `{{${variable}}}` + after
  
  // Set cursor position after the inserted variable
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4)
  }, 0)
}

const loadTemplate = (template) => {
  emailTemplate.value = template
  
  const templates = {
    newsletter: {
      subject: 'Monthly Newsletter - {{date}}',
      content: `Dear {{name}},

We hope this newsletter finds you well! Here are the latest updates from Engage360:

📅 Upcoming Events
- Program registration is now open
- New fitness classes starting next week
- Community events calendar

🏆 Success Stories
- Congratulations to our basketball program graduates!
- New community partnerships announced

📞 Contact Us
If you have any questions, please don't hesitate to reach out.

Best regards,
The Engage360 Team

{{link}}`
    },
    reminder: {
      subject: 'Reminder: {{program}} - {{date}}',
      content: `Hello {{name}},

This is a friendly reminder about your upcoming session:

Program: {{program}}
Date: {{date}}

Please arrive 10 minutes early for check-in.

If you need to reschedule or have any questions, please contact us.

See you soon!
Engage360 Team

{{link}}`
    },
    announcement: {
      subject: 'Important Announcement - {{date}}',
      content: `Dear {{name}},

We have an important announcement to share:

[Your announcement content here]

Thank you for your continued support.

Best regards,
Engage360 Team

{{link}}`
    }
  }
  
  if (templates[template]) {
    emailForm.value.subject = templates[template].subject
    emailForm.value.content = templates[template].content
  }
}

const getRecipientCount = () => {
  switch (recipientType.value) {
    case 'all':
      return 'All users'
    case 'program':
      return programUsers.value.length
    case 'custom':
      return customRecipients.value.length
    default:
      return 0
  }
}

const previewEmail = () => {
  const modal = new bootstrap.Modal(document.getElementById('previewModal'))
  modal.show()
}

const saveDraft = async () => {
  try {
    const draft = {
      ...emailForm.value,
      recipientType: recipientType.value,
      selectedProgram: selectedProgram.value,
      customRecipients: customRecipients.value,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await firestoreService.saveEmailDraft(firebaseAuthStore.currentUser.uid, draft)
    alert('Draft saved successfully!')
  } catch (error) {
    console.error('Error saving draft:', error)
    alert('Error saving draft. Please try again.')
  }
}

const sendBulkEmail = async () => {
  if (!emailForm.value.subject || !emailForm.value.content) {
    alert('Please fill in all required fields')
    return
  }

  sending.value = true
  
  try {
    // Get recipients based on selection
    let recipients = []
    
    switch (recipientType.value) {
      case 'all':
        recipients = await firestoreService.getAllUsers()
        break
      case 'program':
        recipients = programUsers.value
        break
      case 'custom':
        recipients = customRecipients.value.map(email => ({ email }))
        break
    }

    // Create campaign
    const campaign = {
      subject: emailForm.value.subject,
      content: emailForm.value.content,
      recipientCount: recipients.length,
      recipientType: recipientType.value,
      selectedProgram: selectedProgram.value,
      customRecipients: customRecipients.value,
      priority: emailForm.value.priority,
      category: emailForm.value.category,
      scheduled: emailForm.value.scheduled,
      scheduledTime: emailForm.value.scheduledTime,
      trackOpens: emailForm.value.trackOpens,
      trackClicks: emailForm.value.trackClicks,
      requireReply: emailForm.value.requireReply,
      sendCopy: emailForm.value.sendCopy,
      status: 'pending',
      createdAt: new Date(),
      sentAt: emailForm.value.scheduled ? new Date(emailForm.value.scheduledTime) : new Date()
    }

    // Send email
    if (emailForm.value.scheduled) {
      await emailService.scheduleBulkEmail(campaign, recipients)
    } else {
      await emailService.sendBulkEmail(campaign, recipients)
    }

    // Refresh campaigns
    await loadCampaigns()
    
    // Reset form
    resetForm()
    
    alert(`Email sent successfully to ${recipients.length} recipients!`)
    
  } catch (error) {
    console.error('Error sending bulk email:', error)
    alert('Error sending email. Please try again.')
  } finally {
    sending.value = false
  }
}

const loadCampaigns = async () => {
  try {
    const campaignsData = await firestoreService.getEmailCampaigns()
    campaigns.value = campaignsData
  } catch (error) {
    console.error('Error loading campaigns:', error)
  }
}

const viewCampaign = (campaign) => {
  alert(`Campaign Details:\n\nSubject: ${campaign.subject}\nRecipients: ${campaign.recipientCount}\nSent: ${formatDate(campaign.sentAt)}\nOpens: ${campaign.openCount} (${campaign.openRate}%)\nClicks: ${campaign.clickCount} (${campaign.clickRate}%)\nStatus: ${campaign.status}`)
}

const resendCampaign = async (campaign) => {
  if (confirm('Are you sure you want to resend this campaign?')) {
    try {
      await emailService.resendCampaign(campaign)
      await loadCampaigns()
      alert('Campaign resent successfully!')
    } catch (error) {
      console.error('Error resending campaign:', error)
      alert('Error resending campaign. Please try again.')
    }
  }
}

const deleteCampaign = async (campaign) => {
  if (confirm('Are you sure you want to delete this campaign?')) {
    try {
      await firestoreService.deleteEmailCampaign(campaign.id)
      await loadCampaigns()
      alert('Campaign deleted successfully!')
    } catch (error) {
      console.error('Error deleting campaign:', error)
      alert('Error deleting campaign. Please try again.')
    }
  }
}

const exportCampaigns = () => {
  const csvContent = campaigns.value.map(campaign => 
    `${campaign.subject},${campaign.recipientCount},${formatDate(campaign.sentAt)},${campaign.openCount},${campaign.clickCount},${campaign.status}`
  ).join('\n')
  
  const blob = new Blob([`Subject,Recipients,Sent,Opens,Clicks,Status\n${csvContent}`], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'email-campaigns.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const getStatusClass = (status) => {
  const classes = {
    'sent': 'bg-success',
    'pending': 'bg-warning',
    'failed': 'bg-danger',
    'scheduled': 'bg-info'
  }
  return classes[status] || 'bg-secondary'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const resetForm = () => {
  emailForm.value = {
    subject: '',
    content: '',
    priority: 'normal',
    category: 'general',
    scheduled: false,
    scheduledTime: '',
    trackOpens: true,
    trackClicks: true,
    requireReply: false,
    sendCopy: true
  }
  recipientType.value = 'all'
  selectedProgram.value = ''
  customRecipients.value = []
  programUsers.value = []
  emailTemplate.value = 'custom'
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadPrograms(),
    loadCampaigns()
  ])
})
</script>

<style scoped>
.bulk-email {
  padding: 1rem;
}

.email-header {
  margin-bottom: 2rem;
  text-align: center;
}

.email-header h3 {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.email-composer {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.recipient-selection {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.btn-group .btn.active {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.email-editor {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
}

.editor-toolbar {
  background: #f8f9fa;
  padding: 0.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  gap: 0.5rem;
}

.editor-toolbar .btn {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
}

.email-campaigns {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.table th {
  background-color: #f8f9fa;
  border-top: none;
  font-weight: 600;
  color: #495057;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.email-preview {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  background: white;
}

.preview-header {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.preview-content {
  line-height: 1.6;
  color: #333;
}

.badge {
  font-size: 0.75rem;
}

.accordion-button:not(.collapsed) {
  background-color: #e7f1ff;
  color: #0c63e4;
}

.accordion-button:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}
</style>
