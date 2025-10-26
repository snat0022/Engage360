<template>
  <div class="container py-4">
    <h2 class="mb-3"><i class="fas fa-calendar-plus me-2"></i>Book Appointment</h2>
    <p class="text-muted mb-4">Fill in the details to book your appointment.</p>

    <div class="card shadow-sm">
      <div class="card-body">
        <form @submit.prevent="submitBooking">
          <div class="row g-3">
            <div class="col-md-6">
              <label for="programSelect" class="form-label">Program/Service *</label>
              <select id="programSelect" v-model="bookingForm.program" class="form-select" required :disabled="programsLoading">
                <option value="">{{ programsLoading ? 'Loading programs...' : 'Select a program' }}</option>
                <option v-if="!programsLoading && availablePrograms.length === 0" disabled>No programs found</option>
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
                <option 
                  v-for="slot in availableTimeSlots" 
                  :key="slot" 
                  :value="slot"
                  :disabled="isSlotUnavailable(slot)"
                >
                  {{ slot }}
                  <span v-if="isSlotUnavailable(slot)"> (unavailable)</span>
                </option>
              </select>
            </div>
            <div class="col-12">
              <div class="form-check mt-2">
                <input class="form-check-input" type="checkbox" id="recurring" v-model="bookingForm.recurring">
                <label class="form-check-label" for="recurring">
                  Repeat weekly
                </label>
              </div>
            </div>
            <div class="col-md-6" v-if="bookingForm.recurring">
              <label for="recurrenceWeeks" class="form-label">Number of weeks</label>
              <input id="recurrenceWeeks" type="number" min="1" max="12" class="form-control" v-model.number="bookingForm.recurrenceWeeks">
            </div>
            <div class="col-12">
              <label for="bookingNotes" class="form-label">Special Requirements or Notes</label>
              <textarea id="bookingNotes" v-model="bookingForm.notes" class="form-control" rows="3" placeholder="Any special requirements, accessibility needs, or additional information..."></textarea>
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

          <div class="d-flex gap-2 mt-4">
            <RouterLink to="/appointments" class="btn btn-outline-secondary"><i class="fas fa-arrow-left me-2"></i>Back</RouterLink>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <i class="fas fa-calendar-check me-2"></i>{{ submitting ? 'Booking...' : 'Book Appointment' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Upcoming bookings management -->
    <div class="card shadow-sm mt-4">
      <div class="card-header">
        <h5 class="mb-0"><i class="fas fa-list me-2"></i>Upcoming My Bookings</h5>
      </div>
      <div class="card-body">
        <div v-if="myBookings.length === 0" class="text-muted">No upcoming bookings.</div>
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Program</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in myBookings" :key="b.id">
                <td>{{ getProgramName(b.programId) }}</td>
                <td>{{ b.date }}</td>
                <td>{{ b.time }}</td>
                <td>
                  <span class="badge bg-success" v-if="b.status==='confirmed'">confirmed</span>
                  <span class="badge bg-warning" v-else-if="b.status==='pending'">pending</span>
                  <span class="badge bg-danger" v-else-if="b.status==='rejected'">rejected</span>
                  <span class="badge bg-secondary" v-else>{{ b.status }}</span>
                </td>
                <td class="d-flex gap-2">
                  <button class="btn btn-outline-info btn-sm" @click="editBooking(b)"><i class="fas fa-edit"></i> Edit</button>
                  <button class="btn btn-outline-primary btn-sm" @click="startReschedule(b)"><i class="fas fa-exchange-alt"></i> Reschedule</button>
                  <button class="btn btn-outline-danger btn-sm" @click="cancelBooking(b)"><i class="fas fa-times"></i> Cancel</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Booking Modal -->
  <div class="modal fade" id="editBookingModal" tabindex="-1" aria-labelledby="editBookingModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="editBookingModalLabel">Edit Booking</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveEditBooking">
            <div class="row g-3">
              <div class="col-md-6">
                <label for="editProgram" class="form-label">Program</label>
                <select id="editProgram" v-model="editForm.program" class="form-select" required>
                  <option value="" disabled>Select a program</option>
                  <option v-for="p in availablePrograms" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
              </div>
              <div class="col-md-6">
                <label for="editInstructor" class="form-label">Instructor (Optional)</label>
                <select id="editInstructor" v-model="editForm.instructor" class="form-select">
                  <option value="">No specific instructor</option>
                  <option v-for="i in instructors" :key="i.id" :value="i.id">{{ i.name }}</option>
                </select>
              </div>
              <div class="col-md-6">
                <label for="editDate" class="form-label">Date</label>
                <input type="date" id="editDate" v-model="editForm.date" class="form-control" required>
              </div>
              <div class="col-md-6">
                <label for="editTime" class="form-label">Time</label>
                <select id="editTime" v-model="editForm.time" class="form-select" required>
                  <option value="" disabled>Select time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                </select>
              </div>
              <div class="col-md-6">
                <label for="editPhone" class="form-label">Phone Number</label>
                <input type="tel" id="editPhone" v-model="editForm.phone" class="form-control" placeholder="Your phone number">
              </div>
              <div class="col-md-6">
                <label for="editEmergencyContact" class="form-label">Emergency Contact</label>
                <input type="text" id="editEmergencyContact" v-model="editForm.emergencyContact" class="form-control" placeholder="Emergency contact name">
              </div>
              <div class="col-12">
                <label for="editNotes" class="form-label">Notes</label>
                <textarea id="editNotes" v-model="editForm.notes" class="form-control" rows="3" placeholder="Any additional notes or special requirements"></textarea>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="cancelEditBooking">Cancel</button>
          <button type="button" class="btn btn-primary" @click="saveEditBooking">Save Changes</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { firestoreService } from '@/services/firestoreService'
import { seedPrograms } from '@/utils/seedPrograms'
import { firebaseAuthStore } from '@/stores/firebaseAuth'
import { emailService } from '@/services/emailService'
import * as bootstrap from 'bootstrap'

const route = useRoute()
const router = useRouter()

const submitting = ref(false)
const availablePrograms = ref([])
const programsLoading = ref(true)
const instructors = ref([])
const dayBookings = ref([])
const myBookings = ref([])
const rescheduleFromId = ref(null)

const bookingForm = ref({
  program: '',
  instructor: '',
  date: '',
  time: '',
  notes: '',
  phone: '',
  emergencyContact: '',
  termsAgreed: false,
  recurring: false,
  recurrenceWeeks: 1
})

const availableTimeSlots = ref([
  '06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'
])

const isSlotUnavailable = (slot) => {
  if (!bookingForm.value.program || !bookingForm.value.date) return false
  const sameTime = dayBookings.value.filter(b => b.time === slot)
  if (bookingForm.value.instructor) {
    return sameTime.some(b => b.instructorId === bookingForm.value.instructor)
  }
  const program = availablePrograms.value.find(p => p.id === bookingForm.value.program)
  if (!program) return false
  return sameTime.length >= (program.maxCapacity || 1)
}

const getProgramName = (programId) => {
  const p = availablePrograms.value.find(x => x.id === programId)
  return p ? p.name : 'Unknown Program'
}

const showTerms = () => {
  alert('Terms and Conditions:\n\n1. Bookings must be cancelled at least 2 hours in advance\n2. No-shows may result in future booking restrictions\n3. Emergency contact information is required\n4. Special requirements should be noted during booking\n5. Program capacity limits apply')
}

const loadPrograms = async () => {
  programsLoading.value = true
  try {
    const programs = await firestoreService.getAllPrograms()
    console.log('Loaded programs:', programs)
    // Do not filter by status; show everything available
    availablePrograms.value = Array.isArray(programs) ? programs : []
    if (availablePrograms.value.length === 0) {
      // Seed defaults if none exist, then reload
      await seedPrograms()
      const seeded = await firestoreService.getAllPrograms()
      availablePrograms.value = Array.isArray(seeded) ? seeded : []
    }
  } catch (e) {
    console.error('Error loading programs:', e)
    availablePrograms.value = []
  }
  programsLoading.value = false
}

const loadInstructors = async () => {
  try {
    const instructorsData = await firestoreService.getAllInstructors()
    console.log('Loaded instructors:', instructorsData)
    instructors.value = instructorsData
  } catch (error) {
    console.error('Error loading instructors:', error)
    instructors.value = []
  }
}

const loadDayBookings = async () => {
  if (!bookingForm.value.program || !bookingForm.value.date) { dayBookings.value = []; return }
  dayBookings.value = await firestoreService.getProgramBookings(bookingForm.value.program, bookingForm.value.date)
}

const loadMyBookings = async () => {
  try {
    const bookings = await firestoreService.getUserBookings(firebaseAuthStore.currentUser.uid)
    myBookings.value = bookings.filter(b => b.status !== 'cancelled')
  } catch (e) {
    console.error('Error loading my bookings:', e)
    myBookings.value = []
  }
}

const checkBookingConflicts = async (date, time) => {
  const conflicts = []
  if (bookingForm.value.instructor) {
    const instructorBookings = await firestoreService.getInstructorBookings(
      bookingForm.value.instructor,
      date,
      time
    )
    if (instructorBookings.length > 0) {
      conflicts.push('Instructor is already booked at this time')
    }
  }
  const programBookings = await firestoreService.getProgramBookings(
    bookingForm.value.program,
    date,
    time
  )
  const program = availablePrograms.value.find(p => p.id === bookingForm.value.program)
  if (program && programBookings.length >= program.maxCapacity) {
    conflicts.push(`Program is at maximum capacity (${program.maxCapacity} participants)`) 
  }
  return conflicts
}

const submitBooking = async () => {
  if (!bookingForm.value.termsAgreed) {
    alert('Please agree to the terms and conditions')
    return
  }
  submitting.value = true
  try {
    const conflicts = await checkBookingConflicts(bookingForm.value.date, bookingForm.value.time)
    if (conflicts.length) {
      alert(`Conflict:\n- ${conflicts.join('\n- ')}`)
      return
    }
    const dates = [bookingForm.value.date]
    if (bookingForm.value.recurring && Number(bookingForm.value.recurrenceWeeks) > 1) {
      const start = new Date(bookingForm.value.date)
      for (let i = 1; i < Number(bookingForm.value.recurrenceWeeks); i++) {
        const d = new Date(start); d.setDate(d.getDate() + i * 7)
        dates.push(d.toISOString().split('T')[0])
      }
    }
    let createdCount = 0
    for (const d of dates) {
      const c = await checkBookingConflicts(d, bookingForm.value.time)
      if (c.length) continue
      const booking = {
        userId: firebaseAuthStore.currentUser.uid,
        userEmail: firebaseAuthStore.currentUser.email,
        programId: bookingForm.value.program,
        instructorId: bookingForm.value.instructor || null,
        date: d,
        time: bookingForm.value.time,
        notes: bookingForm.value.notes,
        phone: bookingForm.value.phone,
        emergencyContact: bookingForm.value.emergencyContact,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      await firestoreService.createBooking(booking)
      createdCount++
    }

    // If rescheduling, cancel the original after creating the new one(s)
    if (rescheduleFromId.value) {
      try {
        await firestoreService.updateBooking(rescheduleFromId.value, { status: 'cancelled', updatedAt: new Date() })
        rescheduleFromId.value = null
      } catch (e) { console.error('Error cancelling original booking during reschedule:', e) }
    }

    try {
      const pName = getProgramName(bookingForm.value.program)
      const when = `${bookingForm.value.date} ${bookingForm.value.time}`
      await emailService.sendEmail({
        to: firebaseAuthStore.currentUser.email,
        subject: `Booking submitted: ${pName}`,
        text: `Your booking for ${pName} on ${when} has been submitted and is pending admin approval.`,
        html: `<p>Your booking for <strong>${pName}</strong> on <strong>${when}</strong> has been submitted and is pending admin approval. You will be notified once it's confirmed.</p>`
      })
    } catch {}

    generateIcsAndDownload()

    alert(createdCount > 1 ? `Booked ${createdCount} sessions successfully! Your appointments are pending admin approval.` : 'Appointment booked successfully! Your appointment is pending admin approval.')
    await loadMyBookings()
    router.push('/appointments')
  } catch (e) {
    console.error('Error booking appointment:', e)
    alert('Error booking appointment. Please try again.')
  } finally {
    submitting.value = false
  }
}

const generateIcsAndDownload = () => {
  const title = getProgramName(bookingForm.value.program)
  const start = new Date(`${bookingForm.value.date}T${bookingForm.value.time}:00`)
  const end = new Date(start.getTime() + 60*60*1000)
  const dt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Engage360//Booking//EN','BEGIN:VEVENT',
    `UID:${Date.now()}@engage360` ,
    `DTSTAMP:${dt(new Date())}`,
    `DTSTART:${dt(start)}`,
    `DTEND:${dt(end)}`,
    `SUMMARY:${title}`,
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n')
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title.replace(/\s+/g,'_')}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  console.log('BookingPage mounted, loading data...')
  try {
    await Promise.all([loadPrograms(), loadInstructors(), loadMyBookings()])
    console.log('Data loaded:', {
      programs: availablePrograms.value.length,
      instructors: instructors.value.length,
      bookings: myBookings.value.length
    })
    
    const programId = route.query.program
    if (programId) {
      bookingForm.value.program = programId
    }
    
    // Set up real-time listener for user bookings
    if (firebaseAuthStore.currentUser) {
      console.log('Setting up real-time listener for user bookings')
      const unsubscribe = firestoreService.onUserBookingsSnapshot(
        firebaseAuthStore.currentUser.uid,
        (bookings) => {
          console.log('Real-time booking update received:', bookings)
          myBookings.value = bookings.filter(b => b.status !== 'cancelled')
        }
      )
      
      // Store unsubscribe function for cleanup
      onUnmounted(() => {
        if (unsubscribe) unsubscribe()
      })
    }
  } catch (error) {
    console.error('Error loading data in onMounted:', error)
  }
})

watch(() => [bookingForm.value.program, bookingForm.value.date], loadDayBookings)

// Actions
const startReschedule = (b) => {
  rescheduleFromId.value = b.id
  bookingForm.value.program = b.programId
  bookingForm.value.instructor = b.instructorId || ''
  bookingForm.value.date = b.date
  bookingForm.value.time = b.time
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelBooking = async (b) => {
  if (!confirm('Cancel this booking?')) return
  try {
    await firestoreService.updateBooking(b.id, { status: 'cancelled', updatedAt: new Date() })
    await loadMyBookings()
    alert('Booking cancelled')
  } catch (e) {
    console.error('Error cancelling booking:', e)
    alert('Failed to cancel booking')
  }
}

// Edit booking functionality
const editingBooking = ref(null)
const editForm = ref({
  program: '',
  instructor: '',
  date: '',
  time: '',
  notes: '',
  phone: '',
  emergencyContact: ''
})

const editBooking = (booking) => {
  console.log('Edit booking clicked:', booking)
  editingBooking.value = booking
  editForm.value = {
    program: booking.programId,
    instructor: booking.instructorId || '',
    date: booking.date,
    time: booking.time,
    notes: booking.notes || '',
    phone: booking.phone || '',
    emergencyContact: booking.emergencyContact || ''
  }
  
  console.log('Edit form populated:', editForm.value)
  
  // Show edit modal
  try {
    const modalElement = document.getElementById('editBookingModal')
    console.log('Modal element found:', modalElement)
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement)
      modal.show()
      console.log('Modal shown successfully')
    } else {
      console.error('Modal element not found')
      alert('Modal not found. Please refresh the page.')
    }
  } catch (error) {
    console.error('Error showing modal:', error)
    alert('Error opening edit modal: ' + error.message)
  }
}

const saveEditBooking = async () => {
  if (!editingBooking.value) return
  
  console.log('Saving edit booking:', editingBooking.value)
  console.log('Edit form data:', editForm.value)
  
  try {
    const updatedData = {
      programId: editForm.value.program,
      instructorId: editForm.value.instructor || null,
      date: editForm.value.date,
      time: editForm.value.time,
      notes: editForm.value.notes,
      phone: editForm.value.phone,
      emergencyContact: editForm.value.emergencyContact,
      updatedAt: new Date()
    }
    
    console.log('Updated data to save:', updatedData)
    
    await firestoreService.updateBooking(editingBooking.value.id, updatedData)
    await loadMyBookings()
    
    // Hide modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editBookingModal'))
    if (modal) {
      modal.hide()
    }
    
    alert('Booking updated successfully!')
    editingBooking.value = null
  } catch (error) {
    console.error('Error updating booking:', error)
    alert('Failed to update booking. Please try again.')
  }
}

const cancelEditBooking = () => {
  editingBooking.value = null
  const modal = bootstrap.Modal.getInstance(document.getElementById('editBookingModal'))
  modal.hide()
}
</script>

<style scoped>
.container { max-width: 900px; }
.form-select option[disabled] { color: #999; }
</style>


