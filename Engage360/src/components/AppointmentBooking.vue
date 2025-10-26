<template>
  <div class="appointment-booking">
    <!-- Booking Header with Action Button -->
    <div class="booking-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h3><i class="fas fa-calendar-plus"></i> Appointment Booking</h3>
          <p class="text-muted">Book appointments for programs and services</p>
          <!-- Connection Status Indicator -->
          <div class="connection-status">
            <span :class="connectionStatus === 'connected' ? 'text-success' : 'text-danger'">
              <i :class="connectionStatus === 'connected' ? 'fas fa-wifi' : 'fas fa-wifi-slash'"></i>
              {{ connectionStatus === 'connected' ? 'Connected' : 'Connection Issues' }}
            </span>
          </div>
        </div>
        <RouterLink to="/book" class="btn btn-primary btn-lg text-decoration-none">
          <i class="fas fa-calendar-check me-2"></i>Book New Appointment
        </RouterLink>
      </div>
    </div>

    <!-- Calendar Container -->
    <div class="calendar-container">
      <FullCalendar
        ref="calendar"
        :options="calendarOptions"
        class="appointment-calendar"
      />
    </div>

    <!-- Booking Form Modal -->
    <div class="modal fade" id="bookingModal" tabindex="-1" aria-labelledby="bookingModalLabel" aria-hidden="true" data-bs-focus="true" aria-modal="true" role="dialog">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="bookingModalLabel">
              <i class="fas fa-calendar-check"></i> Book Appointment
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitBooking">
              <div class="row g-3">
                <div class="col-md-6">
                  <label for="programSelect" class="form-label">Program/Service *</label>
                  <select id="programSelect" v-model="bookingForm.program" class="form-select" required>
                    <option value="">Select a program</option>
                    <option v-for="program in availablePrograms" :key="program.id" :value="program.id">
                      {{ program.name }} - {{ program.duration }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label for="instructorSelect" class="form-label">Preferred Instructor</label>
                  <select id="instructorSelect" v-model="bookingForm.instructor" class="form-select">
                    <option value="">Any available instructor</option>
                    <option v-for="instructor in instructors" :key="instructor.id" :value="instructor.id">
                      {{ instructor.name }} - {{ instructor.specialization || instructor.specialty }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label for="bookingDate" class="form-label">Date *</label>
                  <input type="date" id="bookingDate" v-model="bookingForm.date" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label for="bookingTime" class="form-label">Time *</label>
                  <select id="bookingTime" v-model="bookingForm.time" class="form-select" required>
                    <option value="">Select time</option>
                    <option v-for="slot in availableTimeSlots" :key="slot" :value="slot">
                      {{ slot }}
                    </option>
                  </select>
                </div>
                <div class="col-12">
                  <label for="bookingNotes" class="form-label">Special Requirements or Notes</label>
                  <textarea id="bookingNotes" v-model="bookingForm.notes" class="form-control" rows="3" 
                    placeholder="Any special requirements, accessibility needs, or additional information..."></textarea>
                </div>
                <div class="col-md-6">
                  <label for="contactPhone" class="form-label">Contact Phone *</label>
                  <input type="tel" id="contactPhone" v-model="bookingForm.phone" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label for="emergencyContact" class="form-label">Emergency Contact</label>
                  <input type="text" id="emergencyContact" v-model="bookingForm.emergencyContact" class="form-control">
                </div>
              </div>
              
              <div class="mt-4">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="termsAgreement" v-model="bookingForm.termsAgreed" required>
                  <label class="form-check-label" for="termsAgreement">
                    I agree to the <a href="#" @click.prevent="showTerms">terms and conditions</a> and understand the cancellation policy
                  </label>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" class="btn btn-primary" @click="submitBooking" :disabled="submitting">
              <i class="fas fa-calendar-check"></i>
              {{ submitting ? 'Booking...' : 'Book Appointment' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Conflict Resolution Modal -->
    <div class="modal fade" id="conflictModal" tabindex="-1" aria-labelledby="conflictModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-warning">
            <h5 class="modal-title" id="conflictModalLabel">
              <i class="fas fa-exclamation-triangle"></i> Booking Conflict
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p><strong>Conflict Detected:</strong> {{ conflictMessage }}</p>
            <div v-if="conflictSuggestions.length > 0" class="mt-3">
              <h6>Suggested Alternative Times:</h6>
              <div class="list-group">
                <button 
                  v-for="suggestion in conflictSuggestions" 
                  :key="suggestion.id"
                  @click="selectAlternative(suggestion)"
                  class="list-group-item list-group-item-action"
                >
                  <strong>{{ suggestion.date }}</strong> at {{ suggestion.time }}
                  <small class="text-muted d-block">{{ suggestion.program }}</small>
                </button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-warning" @click="forceBooking" v-if="!conflictSuggestions.length">
              Force Booking (Override)
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Management Panel -->
    <div class="booking-management mt-4">
      <div class="card">
        <div class="card-header">
          <h5><i class="fas fa-list"></i> My Bookings</h5>
        </div>
        <div class="card-body">
          <div v-if="userBookings.length === 0" class="text-center py-4">
            <p class="text-muted">No bookings found. Click on a date to book an appointment.</p>
          </div>
          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Date & Time</th>
                  <th>Instructor</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="booking in userBookings" :key="booking.id">
                  <td>{{ getProgramName(booking.programId) }}</td>
                  <td>{{ formatDateTime(booking.date, booking.time) }}</td>
                  <td>{{ getInstructorName(booking.instructorId) || 'TBD' }}</td>
                  <td>
                    <span :class="getStatusClass(booking.status)" class="badge">
                      {{ booking.status }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button @click="viewBooking(booking)" class="btn btn-outline-info" title="View Details">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button @click="editBooking(booking)" class="btn btn-outline-warning" title="Edit" 
                        v-if="canEditBooking(booking)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="cancelBooking(booking)" class="btn btn-outline-danger" title="Cancel"
                        v-if="canCancelBooking(booking)">
                        <i class="fas fa-times"></i>
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { firestoreService } from '@/services/firestoreService'
import { firebaseAuthStore } from '@/stores/firebaseAuth'
import { useRoute } from 'vue-router'
import * as bootstrap from 'bootstrap'
import { seedInstructors } from '@/utils/seedInstructors'

const route = useRoute()

// Reactive data
const calendar = ref(null)
const submitting = ref(false)
const userBookings = ref([])
const availablePrograms = ref([])
const instructors = ref([])
const conflictMessage = ref('')
const conflictSuggestions = ref([])
const connectionStatus = ref('connected')

// Booking form
const bookingForm = ref({
  program: '',
  instructor: '',
  date: '',
  time: '',
  notes: '',
  phone: '',
  emergencyContact: '',
  termsAgreed: false
})

// Calendar options
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  height: 'auto',
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  businessHours: {
    daysOfWeek: [1, 2, 3, 4, 5, 6], // Monday to Saturday
    startTime: '06:00',
    endTime: '22:00'
  },
  events: userBookings.value.map(booking => ({
    id: booking.id,
    title: getProgramName(booking.programId),
    start: `${booking.date}T${booking.time}`,
    backgroundColor: getStatusColor(booking.status),
    borderColor: getStatusColor(booking.status),
    extendedProps: {
      instructor: getInstructorName(booking.instructorId),
      status: booking.status,
      notes: booking.notes
    }
  })),
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventDidMount: handleEventMount,
  selectConstraint: 'businessHours',
  selectOverlap: false,
  unselectAuto: true
}))

// Available time slots
const availableTimeSlots = ref([
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00'
])

// Methods
const handleDateSelect = (selectInfo) => {
  const selectedDate = selectInfo.startStr.split('T')[0]
  bookingForm.value.date = selectedDate
  showBookingModal()
}

const handleEventClick = (clickInfo) => {
  const booking = userBookings.value.find(b => b.id === clickInfo.event.id)
  if (booking) {
    viewBooking(booking)
  }
}

const handleEventMount = (info) => {
  // Add tooltip or additional styling
  info.el.title = `${info.event.title} - ${info.event.extendedProps.instructor}`
}

let bookingModalInstance = null
const showBookingModal = async () => {
  await nextTick()
  const modalEl = document.getElementById('bookingModal')
  if (!modalEl) return
  // Proactively ensure ARIA/focus state is valid before showing
  modalEl.removeAttribute('aria-hidden')
  modalEl.style.display = 'block'
  bookingModalInstance = bootstrap.Modal.getOrCreateInstance(modalEl, { backdrop: true, focus: true, keyboard: true })
  modalEl.addEventListener('shown.bs.modal', () => {
    modalEl.removeAttribute('aria-hidden')
    const firstInput = modalEl.querySelector('select, input, textarea, button')
    if (firstInput) {
      try { firstInput.focus() } catch (e) {}
    }
  }, { once: true })
  bookingModalInstance.show()
}

const submitBooking = async () => {
  if (!bookingForm.value.termsAgreed) {
    alert('Please agree to the terms and conditions')
    return
  }

  submitting.value = true
  
  try {
    // Check for conflicts
    const conflicts = await checkBookingConflicts()
    
    if (conflicts.length > 0) {
      showConflictModal(conflicts)
      return
    }

    // Create booking
    const booking = {
      userId: firebaseAuthStore.currentUser.uid,
      userEmail: firebaseAuthStore.currentUser.email,
      programId: bookingForm.value.program,
      instructorId: bookingForm.value.instructor || null,
      date: bookingForm.value.date,
      time: bookingForm.value.time,
      notes: bookingForm.value.notes,
      phone: bookingForm.value.phone,
      emergencyContact: bookingForm.value.emergencyContact,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await firestoreService.createBooking(booking)
    
    // Wait a moment for Firestore to process the update
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Refresh bookings
    await loadUserBookings()
    
    // Close modal and reset form
    const modalEl = document.getElementById('bookingModal')
    const instance = bootstrap.Modal.getInstance(modalEl) || bookingModalInstance
    if (instance) instance.hide()
    resetBookingForm()
    
    alert('Appointment booked successfully! Your appointment is pending admin approval. You will be notified once it\'s confirmed.')
    
  } catch (error) {
    console.error('Error booking appointment:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Error booking appointment. Please try again.'
    
    if (error.code === 'unavailable') {
      errorMessage = 'Service temporarily unavailable. Please check your internet connection and try again.'
    } else if (error.code === 'permission-denied') {
      errorMessage = 'Permission denied. Please make sure you are logged in.'
    } else if (error.message && error.message.includes('network')) {
      errorMessage = 'Network error. Please check your internet connection and try again.'
    }
    
    alert(errorMessage)
  } finally {
    submitting.value = false
  }
}

const checkBookingConflicts = async () => {
  const conflicts = []
  
  // Check instructor availability
  if (bookingForm.value.instructor) {
    const instructorBookings = await firestoreService.getInstructorBookings(
      bookingForm.value.instructor, 
      bookingForm.value.date, 
      bookingForm.value.time
    )
    
    if (instructorBookings.length > 0) {
      conflicts.push({
        type: 'instructor',
        message: 'Instructor is already booked at this time',
        bookings: instructorBookings
      })
    }
  }
  
  // Check program capacity
  const programBookings = await firestoreService.getProgramBookings(
    bookingForm.value.program,
    bookingForm.value.date,
    bookingForm.value.time
  )
  
  const program = availablePrograms.value.find(p => p.id === bookingForm.value.program)
  if (program && programBookings.length >= program.maxCapacity) {
    conflicts.push({
      type: 'capacity',
      message: `Program is at maximum capacity (${program.maxCapacity} participants)`,
      bookings: programBookings
    })
  }
  
  return conflicts
}

const showConflictModal = (conflicts) => {
  conflictMessage.value = conflicts[0].message
  conflictSuggestions.value = generateAlternativeSuggestions()
  
  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('conflictModal'))
  modal.show()
}

const generateAlternativeSuggestions = () => {
  const suggestions = []
  const selectedDate = new Date(bookingForm.value.date)
  
  // Generate suggestions for next 7 days
  for (let i = 1; i <= 7; i++) {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + i)
    
    // Add 2-3 time slots per day
    const timeSlots = ['09:00', '14:00', '18:00']
    timeSlots.forEach(time => {
      suggestions.push({
        id: `suggestion-${i}-${time}`,
        date: date.toISOString().split('T')[0],
        time: time,
        program: getProgramName(bookingForm.value.program)
      })
    })
  }
  
  return suggestions.slice(0, 6) // Limit to 6 suggestions
}

const selectAlternative = (suggestion) => {
  bookingForm.value.date = suggestion.date
  bookingForm.value.time = suggestion.time
  
  // Close conflict modal and show booking modal
  bootstrap.Modal.getInstance(document.getElementById('conflictModal')).hide()
  showBookingModal()
}

const forceBooking = async () => {
  // Admin override - proceed with booking despite conflicts
  await submitBooking()
  bootstrap.Modal.getInstance(document.getElementById('conflictModal')).hide()
}

const loadUserBookings = async () => {
  try {
    const bookings = await firestoreService.getUserBookings(firebaseAuthStore.currentUser.uid)
    userBookings.value = bookings
  } catch (error) {
    console.error('Error loading bookings:', error)
  }
}

const loadPrograms = async () => {
  try {
    const programs = await firestoreService.getAllPrograms()
    availablePrograms.value = programs.filter(p => p.status === 'active')
    connectionStatus.value = 'connected'
  } catch (error) {
    console.error('Error loading programs:', error)
    connectionStatus.value = 'disconnected'
  }
}

const loadInstructors = async () => {
  try {
    console.log('Loading instructors...')
    const instructorsData = await firestoreService.getAllInstructors()
    
    // If no instructors exist, seed some sample data
    if (instructorsData.length === 0) {
      console.log('No instructors found, seeding sample data...')
      await seedInstructors()
      // Reload instructors after seeding
      const seededInstructors = await firestoreService.getAllInstructors()
      instructors.value = seededInstructors
    } else {
      instructors.value = instructorsData
    }
    
    console.log(`Loaded ${instructors.value.length} instructors`)
    connectionStatus.value = 'connected'
  } catch (error) {
    console.error('Error loading instructors:', error)
    connectionStatus.value = 'disconnected'
    // Set a fallback instructor if loading fails
    instructors.value = [{
      id: 'fallback',
      name: 'Any Available Instructor',
      specialization: 'General',
      bio: 'Please contact us for instructor availability.'
    }]
  }
}

const getProgramName = (programId) => {
  const program = availablePrograms.value.find(p => p.id === programId)
  return program ? program.name : 'Unknown Program'
}

const getInstructorName = (instructorId) => {
  if (!instructorId) return null
  const instructor = instructors.value.find(i => i.id === instructorId)
  return instructor ? instructor.name : 'Unknown Instructor'
}

const getStatusClass = (status) => {
  const classes = {
    'confirmed': 'bg-success',
    'pending': 'bg-warning',
    'cancelled': 'bg-danger',
    'completed': 'bg-info'
  }
  return classes[status] || 'bg-secondary'
}

const getStatusColor = (status) => {
  const colors = {
    'confirmed': '#28a745',
    'pending': '#ffc107',
    'cancelled': '#dc3545',
    'completed': '#17a2b8'
  }
  return colors[status] || '#6c757d'
}

const formatDateTime = (date, time) => {
  const dateObj = new Date(date)
  return `${dateObj.toLocaleDateString()} at ${time}`
}

const canEditBooking = (booking) => {
  const bookingDate = new Date(`${booking.date}T${booking.time}`)
  const now = new Date()
  const hoursUntilBooking = (bookingDate - now) / (1000 * 60 * 60)
  
  return booking.status === 'confirmed' && hoursUntilBooking > 24
}

const canCancelBooking = (booking) => {
  const bookingDate = new Date(`${booking.date}T${booking.time}`)
  const now = new Date()
  const hoursUntilBooking = (bookingDate - now) / (1000 * 60 * 60)
  
  return booking.status === 'confirmed' && hoursUntilBooking > 2
}

const viewBooking = (booking) => {
  alert(`Booking Details:\n\nProgram: ${getProgramName(booking.programId)}\nDate: ${formatDateTime(booking.date, booking.time)}\nInstructor: ${getInstructorName(booking.instructorId)}\nStatus: ${booking.status}\nNotes: ${booking.notes || 'None'}`)
}

const editBooking = (booking) => {
  // Pre-fill form with existing booking data
  bookingForm.value = {
    program: booking.programId,
    instructor: booking.instructorId || '',
    date: booking.date,
    time: booking.time,
    notes: booking.notes || '',
    phone: booking.phone || '',
    emergencyContact: booking.emergencyContact || '',
    termsAgreed: true
  }
  
  showBookingModal()
}

const cancelBooking = async (booking) => {
  if (confirm('Are you sure you want to cancel this booking?')) {
    try {
      await firestoreService.updateBooking(booking.id, { 
        status: 'cancelled',
        updatedAt: new Date()
      })
      
      await loadUserBookings()
      alert('Booking cancelled successfully')
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert('Error cancelling booking. Please try again.')
    }
  }
}

const resetBookingForm = () => {
  bookingForm.value = {
    program: '',
    instructor: '',
    date: '',
    time: '',
    notes: '',
    phone: '',
    emergencyContact: '',
    termsAgreed: false
  }
}

const showTerms = () => {
  alert('Terms and Conditions:\n\n1. Bookings must be cancelled at least 2 hours in advance\n2. No-shows may result in future booking restrictions\n3. Emergency contact information is required\n4. Special requirements should be noted during booking\n5. Program capacity limits apply')
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadUserBookings(),
    loadPrograms(),
    loadInstructors()
  ])
  
  // Set up real-time listener for user bookings
  if (firebaseAuthStore.currentUser) {
    console.log('Setting up real-time listener for user bookings in AppointmentBooking')
    const unsubscribe = firestoreService.onUserBookingsSnapshot(
      firebaseAuthStore.currentUser.uid,
      (bookings) => {
        console.log('Real-time booking update received in AppointmentBooking:', bookings)
        userBookings.value = bookings
      }
    )
    
    // Store unsubscribe function for cleanup
    onUnmounted(() => {
      if (unsubscribe) unsubscribe()
    })
  }
  
  // Pre-select program if coming from Programs page
  const programId = route.query.program
  if (programId && availablePrograms.value.length > 0) {
    const program = availablePrograms.value.find(p => p.id === programId)
    if (program) {
      bookingForm.value.program = programId
      // Show booking modal immediately
      setTimeout(() => {
        showBookingModal()
      }, 500)
    }
  }
})
</script>

<style scoped>
.appointment-booking {
  padding: 1rem;
}

.booking-header {
  margin-bottom: 2rem;
  text-align: center;
}

.booking-header h3 {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.calendar-container {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.appointment-calendar {
  border-radius: 8px;
  overflow: hidden;
}

.booking-management {
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

.modal-header.bg-warning {
  background-color: #fff3cd !important;
  border-bottom-color: #ffeaa7;
}

.list-group-item-action:hover {
  background-color: #f8f9fa;
}

/* FullCalendar customizations */
:deep(.fc-event) {
  border-radius: 4px;
  font-size: 0.8rem;
  padding: 2px 4px;
}

:deep(.fc-event-title) {
  font-weight: 500;
}

:deep(.fc-daygrid-event) {
  margin: 1px 0;
}

:deep(.fc-toolbar-title) {
  font-weight: 600;
  color: #2c3e50;
}

:deep(.fc-button-primary) {
  background-color: #007bff;
  border-color: #007bff;
}

:deep(.fc-button-primary:hover) {
  background-color: #0056b3;
  border-color: #0056b3;
}

:deep(.fc-button-primary:focus) {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

:deep(.fc-daygrid-day-number) {
  color: #495057;
  font-weight: 500;
}

:deep(.fc-daygrid-day-number:hover) {
  color: #007bff;
}

:deep(.fc-day-today) {
  background-color: rgba(0, 123, 255, 0.1);
}

:deep(.fc-day-today .fc-daygrid-day-number) {
  color: #007bff;
  font-weight: 600;
}
</style>
