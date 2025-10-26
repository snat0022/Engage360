<template>
  <div class="container py-4">
    <h1 class="mb-4">Admin Dashboard</h1>

    <!-- Email Configuration Alert -->
    <div v-if="!emailService.isSendGridConfigured" class="row mb-4">
      <div class="col-12">
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>
          <strong>Email Service Not Configured:</strong> 
          Email notifications are currently in demo mode. To enable real email sending:
          <ol class="mb-2 mt-2">
            <li>Create a SendGrid account at <a href="https://sendgrid.com/" target="_blank">https://sendgrid.com/</a></li>
            <li>Get your API key from SendGrid dashboard</li>
            <li>Create a <code>.env</code> file in the project root</li>
            <li>Add <code>VITE_SENDGRID_API_KEY=your_actual_api_key</code></li>
            <li>Verify sender email <code>noreply@engage360.com</code> in SendGrid</li>
            <li>Restart the development server</li>
          </ol>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-body d-flex flex-wrap gap-2">
            <RouterLink to="/bulk-email" class="btn btn-outline-primary">
              <i class="fas fa-envelope-open-text me-2"></i> Bulk Email
            </RouterLink>
            <RouterLink to="/analytics" class="btn btn-outline-secondary">
              <i class="fas fa-chart-bar me-2"></i> Analytics
            </RouterLink>
            <RouterLink to="/ai-assistant" class="btn btn-outline-info">
              <i class="fas fa-robot me-2"></i> AI Assistant
            </RouterLink>
            <RouterLink to="/appointments" class="btn btn-outline-success">
              <i class="fas fa-calendar-check me-2"></i> Appointments
            </RouterLink>
            <button class="btn btn-outline-dark ms-auto" @click="loadUsersFromFirestore">
              <i class="fas fa-sync me-2"></i> Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Panel -->
    <div class="row mb-4">
      <div class="col-md-3" v-for="(stat, key) in stats" :key="key">
        <div class="card text-center shadow-sm">
          <div class="card-body">
            <h5 class="card-title">{{ stat.label }}</h5>
            <p class="display-6 fw-bold">{{ stat.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Export Panel -->
    <div class="row mb-5">
      <div class="col-12">
        <ExportPanel />
      </div>
    </div>

    <!-- User Registration Submissions Table -->
    <div class="row mb-5">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Program Registration Submissions</h5>
            <div>
              <button class="btn btn-outline-primary me-2" @click="loadUserSubmissions">Refresh</button>
              <button class="btn btn-outline-success" @click="exportToCSV">Export CSV</button>
            </div>
          </div>
          <div class="card-body">
            <div v-if="userSubmissions.length === 0" class="text-center py-4">
              <p class="text-muted">No program registrations found.</p>
              <p class="small text-muted">Registrations will appear here when users register for programs.</p>
            </div>
            <InteractiveTable
              v-else
              :data="userSubmissions"
              :columns="submissionColumns"
              title="Program Registrations"
              :searchable-fields="['name', 'email', 'phone', 'fitnessLevel', 'programs']"
            >
              <template #programs="{ value }">
                {{ value?.join(', ') || '-' }}
              </template>
              <template #submitted="{ value }">
                {{ formatDate(value) }}
              </template>
              <template #actions="{ item }">
                <button class="btn btn-sm btn-outline-info" @click="viewDetails(item)">
                  View Details
                  </button>
              </template>
            </InteractiveTable>
          </div>
        </div>
      </div>
    </div>

    <!-- Firebase Users Table -->
    <div class="row mb-5">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">User Management</h5>
            <div>
              <button class="btn btn-outline-primary me-2" @click="loadUsersFromFirestore">Refresh</button>
              <button class="btn btn-outline-success me-2" @click="exportUsersToCSV">Export Users</button>
              <div class="btn-group">
                <button class="btn btn-outline-warning dropdown-toggle" data-bs-toggle="dropdown">
                  Bulk Actions
            </button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" @click="bulkSuspendUsers">Suspend Selected</a></li>
                  <li><a class="dropdown-item" @click="bulkActivateUsers">Activate Selected</a></li>
                  <li><a class="dropdown-item" @click="bulkDeleteUsers">Delete Selected</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div v-if="firebaseUsers.length === 0" class="text-center py-4">
              <p class="text-muted">No Firebase users found.</p>
              <p class="small text-muted">Users will appear here when they register accounts.</p>
              <button class="btn btn-outline-primary mt-3" @click="migrateUsersFromLocalStorage">
                Migrate Users from Local Storage
              </button>
            </div>
            <InteractiveTable
              v-else
              :data="firebaseUsers"
              :columns="firebaseUserColumns"
              title="Firebase Users"
              :searchable-fields="['displayName', 'email', 'role']"
              ref="usersTable"
            >
              <template #role="{ value, item }">
                <div class="d-flex align-items-center gap-2">
                  <span :class="getActualRole(item.email) === 'admin' ? 'badge bg-danger' : 'badge bg-primary'">
                    {{ getActualRole(item.email) }}
                  </span>
                  <button 
                    v-if="getActualRole(item.email) !== 'admin'"
                    class="btn btn-sm btn-outline-success"
                    @click="promoteToAdmin(item)"
                    title="Promote to Admin"
                  >
                    ↑
                  </button>
                </div>
              </template>
              <template #emailVerified="{ value, item }">
                <div class="d-flex align-items-center gap-2">
                  <span :class="value ? 'text-success' : 'text-warning'">
                    {{ value ? '✓ Verified' : '⚠ Unverified' }}
                  </span>
                  <button 
                    v-if="!value"
                    class="btn btn-sm btn-outline-primary"
                    @click="sendVerificationEmail(item)"
                    title="Send Verification Email"
                  >
                    📧
                  </button>
                </div>
              </template>
              <template #status="{ value, item }">
                <div class="d-flex align-items-center gap-2">
                  <span :class="getUserStatus(item) === 'active' ? 'badge bg-success' : 'badge bg-warning'">
                    {{ getUserStatus(item) }}
                </span>
                  <button 
                    v-if="getUserStatus(item) === 'active'"
                    class="btn btn-sm btn-outline-warning"
                    @click="suspendUser(item)"
                    title="Suspend User"
                  >
                    ⏸️
                  </button>
                  <button 
                    v-if="getUserStatus(item) === 'suspended'"
                    class="btn btn-sm btn-outline-success"
                    @click="activateUser(item)"
                    title="Activate User"
                  >
                    ▶️
                  </button>
                </div>
              </template>
              <template #actions="{ item }">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-info" @click="viewUserDetails(item)">
                    View Details
                  </button>
                  <button 
                    v-if="getActualRole(item.email) === 'admin'"
                    class="btn btn-outline-warning"
                    @click="demoteFromAdmin(item)"
                  >
                    Demote
                  </button>
                  <button 
                    v-if="getActualRole(item.email) !== 'admin'"
                    class="btn btn-outline-danger"
                    @click="deleteUser(item)"
                    title="Delete User"
                  >
                    🗑️
                </button>
                </div>
              </template>
            </InteractiveTable>
          </div>
        </div>
      </div>
    </div>

    <!-- Analytics Dashboard -->
    <div class="row mb-5">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Analytics Dashboard</h5>
            <div>
              <button class="btn btn-outline-primary btn-sm" @click="refreshCharts">Refresh Charts</button>
            </div>
          </div>
          <div class="card-body">
            <div class="row g-4">
              <!-- Program Popularity Chart -->
              <div class="col-md-6">
                <h6>Most Popular Programs (by Appointments)</h6>
                <div class="chart-container" style="height: 300px;">
                  <canvas ref="programChart" width="400" height="300"></canvas>
                </div>
              </div>
              
              <!-- Registration Trends -->
              <div class="col-md-6">
                <h6>Daily Appointments (Last 7 Days)</h6>
                <div class="chart-container" style="height: 300px;">
                  <canvas ref="trendChart" width="400" height="300"></canvas>
                </div>
              </div>
              
              <!-- User Demographics -->
              <div class="col-md-4">
                <h6>Appointment Status Distribution</h6>
                <div class="chart-container" style="height: 250px;">
                  <canvas ref="fitnessChart" width="300" height="250"></canvas>
                </div>
              </div>
              
              <!-- User Growth -->
              <div class="col-md-4">
                <h6>User Growth (Last 30 Days)</h6>
                <div class="chart-container" style="height: 250px;">
                  <canvas ref="growthChart" width="300" height="250"></canvas>
                </div>
              </div>
              
              <!-- Email Verification Status -->
              <div class="col-md-4">
                <h6>Email Verification Status</h6>
                <div class="chart-container" style="height: 250px;">
                  <canvas ref="verificationChart" width="300" height="250"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- All Appointments Management -->
    <div class="row mb-5">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">All Appointments</h5>
            <div>
              <button class="btn btn-outline-primary me-2" @click="loadAllAppointments">Refresh</button>
              <button class="btn btn-outline-success" @click="exportAppointmentsToCSV">Export CSV</button>
              <button class="btn btn-outline-dark" @click="checkAppointmentsInFirestore">Check Firestore</button>
              <button class="btn btn-outline-danger" @click="checkAdminPermissions">Check Permissions</button>
              <button class="btn btn-success me-2" @click="confirmAllPendingAppointments" v-if="pendingAppointmentsCount > 0">
                <i class="fas fa-check-double me-1"></i>Confirm All Pending ({{ pendingAppointmentsCount }})
              </button>
              <span class="badge bg-info ms-2" v-if="allAppointments.length > 10">
                <i class="fas fa-info-circle me-1"></i>Scroll to view all {{ allAppointments.length }} appointments
              </span>
              <span class="badge bg-warning ms-2" v-if="pendingAppointmentsCount > 0">
                <i class="fas fa-clock me-1"></i>{{ pendingAppointmentsCount }} pending confirmation
              </span>
            </div>
          </div>
          <div class="card-body">
            <div v-if="allAppointments.length === 0" class="text-center py-4">
              <p class="text-muted">No appointments found.</p>
              <p class="small text-muted">Appointments will appear here when users book appointments.</p>
            </div>
            <!-- Pending Appointments Alert -->
            <div v-if="pendingAppointmentsCount > 0" class="alert alert-warning alert-dismissible fade show mb-3" role="alert">
              <i class="fas fa-exclamation-triangle me-2"></i>
              <strong>Action Required:</strong> You have {{ pendingAppointmentsCount }} appointment(s) pending confirmation. 
              Please review and confirm or reject these appointments.
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            <div class="table-responsive" style="max-height: 600px; overflow-y: auto; overflow-x: auto; position: relative;">
              <InteractiveTable
                :data="allAppointments"
                :columns="appointmentColumns"
                title="All Appointments"
                :searchable-fields="['userEmail', 'programName', 'instructorName', 'status', 'date', 'time']"
                class="table-sticky-header"
              >
              <template #programName="{ value }">
                {{ value || 'Unknown Program' }}
              </template>
              <template #instructorName="{ value }">
                {{ value || 'TBD' }}
              </template>
              <template #status="{ value }">
                <span :class="getAppointmentStatusClass(value)" class="badge">
                  {{ value }}
                </span>
              </template>
              <template #date="{ value }">
                {{ formatDate(value) }}
              </template>
              <template #createdAt="{ value }">
                {{ formatDate(value) }}
              </template>
              <template #actions="{ item }">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-info" @click="viewAppointmentDetails(item)">
                    View Details
                  </button>
                  <button class="btn btn-outline-warning" @click="editAppointment(item)">
                    Edit
                  </button>
                  <button class="btn btn-outline-success" @click="confirmAppointment(item)" 
                    v-if="item.status === 'pending'">
                    Confirm
                  </button>
                  <button class="btn btn-outline-danger" @click="rejectAppointment(item)" 
                    v-if="item.status === 'pending'">
                    Reject
                  </button>
                  <button class="btn btn-outline-danger" @click="cancelAppointment(item)" 
                    v-if="item.status === 'confirmed'">
                    Cancel
                  </button>
                </div>
              </template>
            </InteractiveTable>
            <!-- Scroll to top button for large tables -->
            <button 
              v-if="allAppointments.length > 15" 
              class="btn btn-outline-secondary btn-sm scroll-to-top"
              @click="scrollToTop"
              title="Scroll to top"
            >
              <i class="fas fa-arrow-up"></i>
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Calendar View -->
    <div class="row mb-5">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Appointments Calendar</h5>
            <span class="badge bg-success ms-2" v-if="allAppointments.length > 0">{{ allAppointments.length }} appointments</span>
          </div>
          <div class="card-body">
            <div class="calendar-container" style="height: 600px; overflow-y: auto; overflow-x: auto;">
              <div class="row g-2">
                <div class="col-12">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="mb-0">Calendar View</h6>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" @click="calendarView = 'month'" :class="{ active: calendarView === 'month' }">Month</button>
                      <button class="btn btn-outline-primary" @click="calendarView = 'week'" :class="{ active: calendarView === 'week' }">Week</button>
                      <button class="btn btn-outline-primary" @click="calendarView = 'day'" :class="{ active: calendarView === 'day' }">Day</button>
                    </div>
                  </div>
                </div>
                
                <!-- Calendar Grid -->
                <div class="col-12">
                  <div v-if="calendarView === 'month'" class="calendar-month">
                    <div class="calendar-header">
                      <div class="calendar-weekdays">
                        <div class="calendar-weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
                      </div>
                    </div>
                    <div class="calendar-grid">
                      <div 
                        v-for="date in calendarDates" 
                        :key="date.key"
                        class="calendar-day"
                        :class="{ 
                          'other-month': !date.currentMonth,
                          'today': date.isToday,
                          'has-appointments': date.appointments.length > 0
                        }"
                      >
                        <div class="calendar-day-number">{{ date.day }}</div>
                        <div class="calendar-appointments">
                          <div 
                            v-for="appointment in date.appointments.slice(0, 3)" 
                            :key="appointment.id"
                            class="calendar-appointment"
                            :class="`appointment-${appointment.status}`"
                            @click="viewAppointmentDetails(appointment)"
                            :title="`${appointment.userEmail} - ${appointment.programName} at ${appointment.time}`"
                          >
                            {{ appointment.time }} - {{ appointment.programName }}
                          </div>
                          <div v-if="date.appointments.length > 3" class="calendar-more">
                            +{{ date.appointments.length - 3 }} more
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div v-else-if="calendarView === 'week'" class="calendar-week">
                    <div class="calendar-week-header">
                      <div class="calendar-weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
                    </div>
                    <div class="calendar-week-grid">
                      <div 
                        v-for="date in weekDates" 
                        :key="date.key"
                        class="calendar-week-day"
                        :class="{ 'today': date.isToday }"
                      >
                        <div class="calendar-day-number">{{ date.day }}</div>
                        <div class="calendar-appointments">
                          <div 
                            v-for="appointment in date.appointments" 
                            :key="appointment.id"
                            class="calendar-appointment"
                            :class="`appointment-${appointment.status}`"
                            @click="viewAppointmentDetails(appointment)"
                          >
                            {{ appointment.time }} - {{ appointment.programName }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div v-else class="calendar-day">
                    <div class="calendar-day-header">
                      <h6>{{ selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</h6>
                    </div>
                    <div class="calendar-day-appointments">
                      <div 
                        v-for="appointment in dayAppointments" 
                        :key="appointment.id"
                        class="calendar-appointment-detail"
                        :class="`appointment-${appointment.status}`"
                        @click="viewAppointmentDetails(appointment)"
                      >
                        <div class="appointment-time">{{ appointment.time }}</div>
                        <div class="appointment-details">
                          <div class="appointment-program">{{ appointment.programName }}</div>
                          <div class="appointment-user">{{ appointment.userEmail }}</div>
                          <div class="appointment-instructor">{{ appointment.instructorName || 'TBD' }}</div>
                        </div>
                        <div class="appointment-status">
                          <span :class="getAppointmentStatusClass(appointment.status)" class="badge">
                            {{ appointment.status }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Program Management -->
    <div class="row mb-5">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Program Management</h5>
            <div>
              <button class="btn btn-primary" @click="addNewProgram">
                Add New Program
              </button>
            </div>
          </div>
          <div class="card-body">
            <div v-if="programs.length === 0" class="text-center py-4">
              <p class="text-muted">No programs found.</p>
            </div>
            <div v-else class="row g-3">
              <div class="col-md-6 col-lg-4" v-for="program in programs" :key="program.id">
                <div class="card h-100">
                  <div class="card-body">
                    <h6 class="card-title">{{ program.name }}</h6>
                    <p class="card-text small text-muted">{{ program.description }}</p>
                    <div class="mb-2">
                      <span class="badge bg-info me-1">{{ program.level }}</span>
                      <span class="badge bg-success">{{ program.price }}</span>
                    </div>
                    <div class="small text-muted mb-2">
                      <div>Duration: {{ program.duration }}</div>
                      <div>Schedule: {{ program.schedule }}</div>
                    </div>
                    <div class="btn-group btn-group-sm w-100">
                      <button class="btn btn-outline-primary" @click="editProgram(program)">
                        Edit
                      </button>
                      <button class="btn btn-outline-warning" @click="toggleProgramStatus(program)">
                        {{ program.status === 'active' ? 'Deactivate' : 'Activate' }}
                      </button>
                      <button class="btn btn-outline-danger" @click="deleteProgram(program)">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Activity Log -->
    <div class="row mb-5">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Admin Activity Log</h5>
            <button class="btn btn-outline-primary" @click="refreshActivityLog">Refresh</button>
          </div>
          <div class="card-body">
            <div v-if="activityLog.length === 0" class="text-center py-4">
              <p class="text-muted">No admin activities logged yet.</p>
            </div>
            <div v-else class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Target</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="log in activityLog" :key="log.id">
                    <td>{{ formatDate(log.timestamp) }}</td>
                    <td>{{ log.adminEmail }}</td>
                    <td><span class="badge" :class="getActionBadgeClass(log.action)">{{ log.action }}</span></td>
                    <td>{{ log.targetEmail || 'N/A' }}</td>
                    <td>{{ log.details || 'N/A' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- System Information -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">System Information</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <h6>Firebase Project</h6>
                <p class="text-muted mb-0">Project ID: week7-shreyas</p>
                <p class="text-muted mb-0">Current User: {{ firebaseAuthStore.currentUser?.email || 'Not logged in' }}</p>
                <p class="text-muted mb-0">User Role: {{ currentUserRole || 'Loading...' }}</p>
              </div>
              <div class="col-md-6">
                <h6>Application Status</h6>
                <p class="text-muted mb-0">Last Updated: {{ lastUpdated }}</p>
                <p class="text-muted mb-0">Total Submissions: {{ userSubmissions.length }}</p>
                <p class="text-muted mb-0">Firebase Users: {{ firebaseUsers.length }}</p>
                <p class="text-muted mb-0">Total Appointments: {{ allAppointments.length }}</p>
                <p class="text-muted mb-0">Confirmed Appointments: {{ allAppointments.filter(a => a.status === 'confirmed').length }}</p>
                <p class="text-warning mb-0" v-if="pendingAppointmentsCount > 0">
                  <i class="fas fa-exclamation-triangle me-1"></i>Pending Appointments: {{ pendingAppointmentsCount }}
                </p>
                <p class="text-info mb-0">
                  <i class="fas fa-envelope me-1"></i>Email Service: {{ emailService.isSendGridConfigured ? 'SendGrid Active' : 'Demo Mode' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Add/Edit Program Modal -->
  <div class="modal fade" id="programModal" tabindex="-1" aria-labelledby="programModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="programModalLabel">
            {{ editingProgram ? 'Edit Program' : 'Add New Program' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveProgram">
            <div class="row g-3">
              <div class="col-md-6">
                <label for="programName" class="form-label">Program Name *</label>
                <input type="text" id="programName" v-model="programForm.name" class="form-control" required>
              </div>
              <div class="col-md-6">
                <label for="programLevel" class="form-label">Level *</label>
                <select id="programLevel" v-model="programForm.level" class="form-select" required>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>
              <div class="col-12">
                <label for="programDescription" class="form-label">Description *</label>
                <textarea id="programDescription" v-model="programForm.description" class="form-control" rows="3" required></textarea>
              </div>
              <div class="col-md-4">
                <label for="programDuration" class="form-label">Duration *</label>
                <input type="text" id="programDuration" v-model="programForm.duration" class="form-control" required>
              </div>
              <div class="col-md-4">
                <label for="programSchedule" class="form-label">Schedule *</label>
                <input type="text" id="programSchedule" v-model="programForm.schedule" class="form-control" required>
              </div>
              <div class="col-md-4">
                <label for="programPrice" class="form-label">Price *</label>
                <input type="text" id="programPrice" v-model="programForm.price" class="form-control" required>
              </div>
              <div class="col-12">
                <label for="programFeatures" class="form-label">Features (comma-separated)</label>
                <input type="text" id="programFeatures" v-model="programFeaturesText" class="form-control" placeholder="Equipment Provided, All Ages, Beginner Friendly">
              </div>
              <div class="col-md-6">
                <label for="programImage" class="form-label">Image URL</label>
                <input type="url" id="programImage" v-model="programForm.image" class="form-control">
              </div>
              <div class="col-md-6">
                <label for="programStatus" class="form-label">Status</label>
                <select id="programStatus" v-model="programForm.status" class="form-select">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="savingProgram">
                {{ savingProgram ? 'Saving...' : (editingProgram ? 'Update Program' : 'Add Program') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Admin Edit Appointment Modal -->
  <div class="modal fade" id="adminEditAppointmentModal" tabindex="-1" aria-labelledby="adminEditAppointmentModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="adminEditAppointmentModalLabel">Edit Appointment</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveAdminEditAppointment">
            <div class="row g-3">
              <div class="col-md-6">
                <label for="adminEditProgram" class="form-label">Program</label>
                <select id="adminEditProgram" v-model="adminEditForm.programId" class="form-select" required>
                  <option value="" disabled>Select a program</option>
                  <option v-for="p in programs" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
              </div>
              <div class="col-md-6">
                <label for="adminEditInstructor" class="form-label">Instructor (Optional)</label>
                <select id="adminEditInstructor" v-model="adminEditForm.instructorId" class="form-select">
                  <option value="">No specific instructor</option>
                  <option v-for="i in instructors" :key="i.id" :value="i.id">{{ i.name }}</option>
                </select>
              </div>
              <div class="col-md-6">
                <label for="adminEditDate" class="form-label">Date</label>
                <input type="date" id="adminEditDate" v-model="adminEditForm.date" class="form-control" required>
              </div>
              <div class="col-md-6">
                <label for="adminEditTime" class="form-label">Time</label>
                <select id="adminEditTime" v-model="adminEditForm.time" class="form-select" required>
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
                <label for="adminEditPhone" class="form-label">Phone Number</label>
                <input type="tel" id="adminEditPhone" v-model="adminEditForm.phone" class="form-control" placeholder="Phone number">
              </div>
              <div class="col-md-6">
                <label for="adminEditEmergencyContact" class="form-label">Emergency Contact</label>
                <input type="text" id="adminEditEmergencyContact" v-model="adminEditForm.emergencyContact" class="form-control" placeholder="Emergency contact name">
              </div>
              <div class="col-md-6">
                <label for="adminEditStatus" class="form-label">Status</label>
                <select id="adminEditStatus" v-model="adminEditForm.status" class="form-select" required>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div class="col-12">
                <label for="adminEditNotes" class="form-label">Notes</label>
                <textarea id="adminEditNotes" v-model="adminEditForm.notes" class="form-control" rows="3" placeholder="Any additional notes or special requirements"></textarea>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="cancelAdminEditAppointment">Cancel</button>
          <button type="button" class="btn btn-primary" @click="saveAdminEditAppointment">Save Changes</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { firebaseAuthStore } from '@/stores/firebaseAuth'
import { firestoreService } from '@/services/firestoreService'
import { emailService } from '@/services/emailService'
import InteractiveTable from '@/components/InteractiveTable.vue'
import EmailComposer from '@/components/EmailComposer.vue'
import ExportPanel from '@/components/ExportPanel.vue'
import * as bootstrap from 'bootstrap'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const userSubmissions = ref([])
const firebaseUsers = ref([])
const adminRoles = ref([])
const currentUserRole = ref('Loading...')
const activityLog = ref([])
const programs = ref([])
const allAppointments = ref([])
const instructors = ref([])
const editingProgram = ref(null)
const savingProgram = ref(false)
const programForm = ref({
  name: '',
  description: '',
  level: 'Beginner',
  duration: '',
  schedule: '',
  price: '',
  features: [],
  image: '',
  status: 'active'
})
const programFeaturesText = ref('')

// Chart refs
const programChart = ref(null)
const trendChart = ref(null)
const fitnessChart = ref(null)
const growthChart = ref(null)
const verificationChart = ref(null)

// Calendar refs
const calendarView = ref('month')
const selectedDate = ref(new Date())
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Auto-refresh interval
let refreshInterval = null

let unsubscribeUsers = null
let unsubscribeRegistrations = null
let unsubscribeAdminRoles = null
let unsubscribeActivityLog = null
let unsubscribePrograms = null
let unsubscribeAppointments = null

// Table column definitions
const submissionColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'phone', label: 'Phone', sortable: true },
  { key: 'fitnessLevel', label: 'Fitness Level', sortable: true },
  { key: 'programs', label: 'Selected Programs', sortable: false },
  { key: 'submitted', label: 'Submitted', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
]

const firebaseUserColumns = [
  { key: 'displayName', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'emailVerified', label: 'Email Verified', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'createdAt', label: 'Created', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
]

const appointmentColumns = [
  { key: 'userEmail', label: 'User Email', sortable: true },
  { key: 'programName', label: 'Program', sortable: true },
  { key: 'instructorName', label: 'Instructor', sortable: true },
  { key: 'date', label: 'Date', sortable: true },
  { key: 'time', label: 'Time', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'createdAt', label: 'Booked On', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
]

const stats = computed(() => ({
  total: { label: "Total Submissions", value: userSubmissions.value.length },
  firebase: { label: "Firebase Users", value: firebaseUsers.value.length },
  programs: { label: "Program Registrations", value: userSubmissions.value.length },
  verified: { label: "Verified Users", value: firebaseUsers.value.filter(u => u.emailVerified).length },
  appointments: { label: "Total Appointments", value: allAppointments.value.length },
  confirmedAppointments: { label: "Confirmed Appointments", value: allAppointments.value.filter(a => a.status === 'confirmed').length },
  pendingAppointments: { label: "Pending Appointments", value: allAppointments.value.filter(a => a.status === 'pending').length }
}))

const pendingAppointmentsCount = computed(() => {
  return allAppointments.value.filter(a => a.status === 'pending').length
})

// Calendar computed properties
const calendarDates = computed(() => {
  console.log('calendarDates computed property triggered, allAppointments.length:', allAppointments.value.length)
  const today = new Date()
  const currentMonth = selectedDate.value.getMonth()
  const currentYear = selectedDate.value.getFullYear()
  
  // Get first day of month and how many days to show from previous month
  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const dates = []
  for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const dateStr = formatDateForCalendar(date)
    const appointments = allAppointments.value.filter(apt => {
      // Handle both string dates and Date objects
      const aptDate = apt.date instanceof Date ? apt.date : new Date(apt.date)
      const aptDateStr = formatDateForCalendar(aptDate)
      return aptDateStr === dateStr
    })
    
    if (appointments.length > 0) {
      console.log(`Found ${appointments.length} appointments for ${dateStr}:`, appointments)
    }
    
    dates.push({
      key: dateStr,
      day: date.getDate(),
      date: date,
      currentMonth: date.getMonth() === currentMonth,
      isToday: date.toDateString() === today.toDateString(),
      appointments: appointments
    })
  }
  
  console.log('calendarDates computed - total dates with appointments:', dates.filter(d => d.appointments.length > 0).length)
  return dates
})

const weekDates = computed(() => {
  const today = new Date()
  const startOfWeek = new Date(selectedDate.value)
  startOfWeek.setDate(selectedDate.value.getDate() - selectedDate.value.getDay())
  
  const dates = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    
    const dateStr = formatDateForCalendar(date)
    const appointments = allAppointments.value.filter(apt => {
      // Handle both string dates and Date objects
      const aptDate = apt.date instanceof Date ? apt.date : new Date(apt.date)
      const aptDateStr = formatDateForCalendar(aptDate)
      return aptDateStr === dateStr
    })
    
    dates.push({
      key: dateStr,
      day: date.getDate(),
      date: date,
      isToday: date.toDateString() === today.toDateString(),
      appointments: appointments
    })
  }
  
  return dates
})

const dayAppointments = computed(() => {
  const dateStr = formatDateForCalendar(selectedDate.value)
  return allAppointments.value
    .filter(apt => {
      // Handle both string dates and Date objects
      const aptDate = apt.date instanceof Date ? apt.date : new Date(apt.date)
      const aptDateStr = formatDateForCalendar(aptDate)
      return aptDateStr === dateStr
    })
    .sort((a, b) => a.time.localeCompare(b.time))
})

const lastUpdated = ref(new Date().toLocaleString())

async function loadCurrentUserRole() {
  try {
    const role = await firebaseAuthStore.getUserRole()
    currentUserRole.value = role || 'user'
  } catch (error) {
    console.error('Error loading user role:', error)
    currentUserRole.value = 'error'
  }
}

function getActualRole(email) {
  const adminRole = adminRoles.value.find(role => role.email === email)
  return adminRole?.isAdmin ? 'admin' : 'user'
}

function getUserStatus(user) {
  return user.status || 'active'
}

async function suspendUser(user) {
  if (confirm(`Are you sure you want to suspend ${user.email}?`)) {
    try {
      await firestoreService.updateUser(user.id, { status: 'suspended' })
      await logAdminActivity('SUSPEND', user.email, `Suspended user ${user.email}`)
      alert(`User ${user.email} has been suspended.`)
    } catch (error) {
      alert(`Error suspending user: ${error.message}`)
    }
  }
}

async function activateUser(user) {
  if (confirm(`Are you sure you want to activate ${user.email}?`)) {
    try {
      await firestoreService.updateUser(user.id, { status: 'active' })
      await logAdminActivity('ACTIVATE', user.email, `Activated user ${user.email}`)
      alert(`User ${user.email} has been activated.`)
    } catch (error) {
      alert(`Error activating user: ${error.message}`)
    }
  }
}

async function deleteUser(user) {
  if (confirm(`Are you sure you want to DELETE ${user.email}? This action cannot be undone!`)) {
    try {
      await firestoreService.deleteUser(user.id)
      await logAdminActivity('DELETE', user.email, `Deleted user ${user.email}`)
      alert(`User ${user.email} has been deleted.`)
    } catch (error) {
      alert(`Error deleting user: ${error.message}`)
    }
  }
}

async function refreshUsers() {
  try {
    // Force refresh the users list
    const users = await firestoreService.getAllUsers()
    firebaseUsers.value = users.map(user => ({
      ...user,
      role: getActualRole(user.email),
      createdAt: user.createdAt?.toDate?.() || new Date()
    }))
    alert('Users list refreshed successfully.')
  } catch (error) {
    alert(`Error refreshing users: ${error.message}`)
  }
}

function exportUsersToCSV() {
  const headers = ['Name', 'Email', 'Role', 'Email Verified', 'Status', 'Created']
  const rows = firebaseUsers.value.map(user => [
    user.displayName || 'N/A',
    user.email,
    getActualRole(user.email),
    user.emailVerified ? 'Yes' : 'No',
    getUserStatus(user),
    formatDate(user.createdAt)
  ])

  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'users.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function bulkSuspendUsers() {
  const selectedUsers = getSelectedUsers()
  if (selectedUsers.length === 0) {
    alert('Please select users first.')
    return
  }
  
  if (confirm(`Are you sure you want to suspend ${selectedUsers.length} users?`)) {
    selectedUsers.forEach(user => {
      if (getActualRole(user.email) !== 'admin') {
        firestoreService.updateUser(user.id, { status: 'suspended' })
      }
    })
    alert(`${selectedUsers.length} users have been suspended.`)
  }
}

async function migrateUsersFromLocalStorage() {
  try {
    console.log('Migrating users from localStorage to Firestore...')
    
    // Get users from localStorage
    const localUsers = JSON.parse(localStorage.getItem('firebase-users') || '[]')
    console.log('Found local users:', localUsers)
    
    if (localUsers.length === 0) {
      alert('No users found in localStorage. Users will appear here when they register new accounts.')
      return
    }
    
    // Migrate each user to Firestore
    let migratedCount = 0
    for (const user of localUsers) {
      try {
        await firestoreService.createUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          role: user.role || 'user',
          status: user.status || 'active',
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date()
        })
        migratedCount++
        console.log(`Migrated user: ${user.email}`)
      } catch (error) {
        console.error(`Error migrating user ${user.email}:`, error)
      }
    }
    
    // Clear localStorage after successful migration
    if (migratedCount > 0) {
      localStorage.removeItem('firebase-users')
      alert(`Successfully migrated ${migratedCount} users to Firestore!`)
      
      // Refresh the users list
      await loadUsersFromFirestore()
    } else {
      alert('No users could be migrated. Please check the console for errors.')
    }
  } catch (error) {
    console.error('Error migrating users:', error)
    alert(`Error migrating users: ${error.message}`)
  }
}

async function loadUsersFromFirestore() {
  try {
    console.log('Refreshing users...')
    
    // Load users from Firestore
    const users = await firestoreService.getAllUsers()
    console.log('Loaded users from Firestore:', users)
    
    firebaseUsers.value = users.map(user => ({
      ...user,
      role: getActualRole(user.email),
      createdAt: user.createdAt?.toDate?.() || new Date()
    }))
    
    lastUpdated.value = new Date().toLocaleString()
    console.log('Updated firebaseUsers:', firebaseUsers.value)
  } catch (error) {
    console.error('Error refreshing users:', error)
    alert(`Error refreshing users: ${error.message}`)
  }
}

function bulkActivateUsers() {
  const selectedUsers = getSelectedUsers()
  if (selectedUsers.length === 0) {
    alert('Please select users first.')
    return
  }
  
  if (confirm(`Are you sure you want to activate ${selectedUsers.length} users?`)) {
    selectedUsers.forEach(user => {
      firestoreService.updateUser(user.id, { status: 'active' })
    })
    alert(`${selectedUsers.length} users have been activated.`)
  }
}

function bulkDeleteUsers() {
  const selectedUsers = getSelectedUsers()
  if (selectedUsers.length === 0) {
    alert('Please select users first.')
    return
  }
  
  if (confirm(`Are you sure you want to DELETE ${selectedUsers.length} users? This action cannot be undone!`)) {
    selectedUsers.forEach(user => {
      if (getActualRole(user.email) !== 'admin') {
        firestoreService.deleteUser(user.id)
      }
    })
    alert(`${selectedUsers.length} users have been deleted.`)
  }
}

function getSelectedUsers() {
  // This would need to be implemented in the InteractiveTable component
  // For now, return empty array
  return []
}

async function logAdminActivity(action, targetEmail, details) {
  try {
    await firestoreService.logAdminActivity({
      adminEmail: firebaseAuthStore.currentUser.email,
      action,
      targetEmail,
      details,
      timestamp: new Date()
    })
  } catch (error) {
    console.error('Error logging admin activity:', error)
  }
}

function getActionBadgeClass(action) {
  switch (action) {
    case 'PROMOTE': return 'bg-success'
    case 'DEMOTE': return 'bg-warning'
    case 'SUSPEND': return 'bg-danger'
    case 'ACTIVATE': return 'bg-success'
    case 'DELETE': return 'bg-danger'
    case 'SEND_VERIFICATION': return 'bg-info'
    default: return 'bg-secondary'
  }
}

async function refreshActivityLog() {
  try {
    const logs = await firestoreService.getAdminActivityLog()
    activityLog.value = logs
    alert('Activity log refreshed successfully.')
  } catch (error) {
    alert(`Error refreshing activity log: ${error.message}`)
  }
}

// Program Management Functions
function addNewProgram() {
  console.log('addNewProgram called')
  resetProgramForm()
  editingProgram.value = null
  // Show modal using Bootstrap
  const modalElement = document.getElementById('programModal')
  console.log('Modal element:', modalElement)
  if (modalElement) {
    const modal = new bootstrap.Modal(modalElement)
    console.log('Bootstrap modal created:', modal)
    modal.show()
  } else {
    console.error('Modal element not found!')
  }
}

function editProgram(program) {
  editingProgram.value = program
  programForm.value = { ...program }
  programFeaturesText.value = program.features ? program.features.join(', ') : ''
  // Show modal using Bootstrap
  const modal = new bootstrap.Modal(document.getElementById('programModal'))
  modal.show()
}

async function saveProgram() {
  savingProgram.value = true
  try {
    // Convert features text to array
    programForm.value.features = programFeaturesText.value
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0)

    if (editingProgram.value) {
      // Update existing program
      await firestoreService.updateProgram(editingProgram.value.id, programForm.value)
      await logAdminActivity('UPDATE_PROGRAM', null, `Updated program: ${programForm.value.name}`)
      alert('Program updated successfully!')
    } else {
      // Add new program
      await firestoreService.createProgram(programForm.value)
      await logAdminActivity('CREATE_PROGRAM', null, `Created program: ${programForm.value.name}`)
      alert('Program created successfully!')
    }

    // Reset form
    resetProgramForm()
    
    // Hide modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('programModal'))
    modal.hide()
  } catch (error) {
    alert(`Error saving program: ${error.message}`)
  } finally {
    savingProgram.value = false
  }
}

function resetProgramForm() {
  programForm.value = {
    name: '',
    description: '',
    level: 'Beginner',
    duration: '',
    schedule: '',
    price: '',
    features: [],
    image: '',
    status: 'active'
  }
  programFeaturesText.value = ''
  editingProgram.value = null
}

async function toggleProgramStatus(program) {
  const newStatus = program.status === 'active' ? 'inactive' : 'active'
  const action = newStatus === 'active' ? 'ACTIVATE_PROGRAM' : 'DEACTIVATE_PROGRAM'
  
  if (confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} ${program.name}?`)) {
    try {
      await firestoreService.updateProgram(program.id, { status: newStatus })
      await logAdminActivity(action, null, `${newStatus === 'active' ? 'Activated' : 'Deactivated'} program: ${program.name}`)
      alert(`Program ${program.name} has been ${newStatus === 'active' ? 'activated' : 'deactivated'}.`)
    } catch (error) {
      alert(`Error updating program status: ${error.message}`)
    }
  }
}

async function deleteProgram(program) {
  if (confirm(`Are you sure you want to DELETE ${program.name}? This action cannot be undone!`)) {
    try {
      await firestoreService.deleteProgram(program.id)
      await logAdminActivity('DELETE_PROGRAM', null, `Deleted program: ${program.name}`)
      alert(`Program ${program.name} has been deleted.`)
    } catch (error) {
      alert(`Error deleting program: ${error.message}`)
    }
  }
}

async function promoteToAdmin(user) {
  if (confirm(`Are you sure you want to promote ${user.email} to admin?`)) {
    try {
      await firestoreService.setAdminRole(user.email, true)
      await logAdminActivity('PROMOTE', user.email, `Promoted ${user.email} to admin`)
      alert(`User ${user.email} has been promoted to admin.`)
    } catch (error) {
      alert(`Error promoting user: ${error.message}`)
    }
  }
}

async function demoteFromAdmin(user) {
  if (confirm(`Are you sure you want to demote ${user.email} from admin?`)) {
    try {
      await firestoreService.setAdminRole(user.email, false)
      await logAdminActivity('DEMOTE', user.email, `Demoted ${user.email} from admin`)
      alert(`User ${user.email} has been demoted from admin.`)
    } catch (error) {
      alert(`Error demoting user: ${error.message}`)
    }
  }
}

async function sendVerificationEmail(user) {
  try {
    await firebaseAuthStore.sendEmailVerification()
    await logAdminActivity('SEND_VERIFICATION', user.email, `Sent verification email to ${user.email}`)
    alert(`Verification email sent to ${user.email}.`)
  } catch (error) {
    alert(`Error sending verification email: ${error.message}`)
  }
}

function exportToCSV() {
  const headers = ['Name', 'Email', 'Phone', 'Fitness Level', 'Programs', 'Health Conditions', 'Timestamp']
  const rows = userSubmissions.value.map(entry => [
    entry.name,
    entry.email,
    entry.phone || '',
    entry.fitnessLevel || '',
    entry.programs?.join(' | ') || '',
    entry.healthConditions || '',
    entry.timestamp
  ])

  const csvContent = [headers, ...rows].map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `program-registrations-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function viewDetails(item) {
  alert(`Registration Details:\n\nName: ${item.name}\nEmail: ${item.email}\nPhone: ${item.phone || 'N/A'}\nFitness Level: ${item.fitnessLevel}\nPrograms: ${item.programs?.join(', ') || 'None'}\nHealth Conditions: ${item.healthConditions || 'None'}\nSubmitted: ${formatDate(item.submitted)}`)
}

function viewUserDetails(item) {
  alert(`User Details:\n\nName: ${item.displayName || 'N/A'}\nEmail: ${item.email}\nRole: ${getActualRole(item.email)}\nEmail Verified: ${item.emailVerified ? 'Yes' : 'No'}\nCreated: ${formatDate(item.createdAt)}`)
}

const formatDate = (val) => {
  if (!val) return 'N/A'
  const d = new Date(val)
  return isNaN(d) ? 'N/A' : d.toLocaleString()
}

// Appointment Management Functions
async function loadAllAppointments() {
  try {
    console.log('Loading all appointments...')
    const appointments = await firestoreService.getAllBookings()
    console.log('Raw appointments from Firestore:', appointments)
    
    allAppointments.value = appointments.map(appointment => ({
      ...appointment,
      programName: getProgramName(appointment.programId),
      instructorName: getInstructorName(appointment.instructorId),
      createdAt: appointment.createdAt?.toDate?.() || new Date()
    }))
    
    console.log('Processed appointments:', allAppointments.value)
    lastUpdated.value = new Date().toLocaleString()
    
    if (appointments.length === 0) {
      console.log('No appointments found in Firestore')
    } else {
      console.log(`Found ${appointments.length} appointments`)
    }
  } catch (error) {
    console.error('Error loading appointments:', error)
    alert(`Error loading appointments: ${error.message}`)
  }
}

async function loadInstructors() {
  try {
    const instructorsData = await firestoreService.getAllInstructors()
    instructors.value = instructorsData
  } catch (error) {
    console.error('Error loading instructors:', error)
    instructors.value = []
  }
}

function getProgramName(programId) {
  const program = programs.value.find(p => p.id === programId)
  return program ? program.name : 'Unknown Program'
}

function getInstructorName(instructorId) {
  if (!instructorId) return null
  // For now, return a placeholder since we don't have instructors loaded in admin
  return 'Instructor ' + instructorId.substring(0, 8)
}

function getAppointmentStatusClass(status) {
  const classes = {
    'confirmed': 'bg-success',
    'pending': 'bg-warning',
    'cancelled': 'bg-danger',
    'completed': 'bg-info'
  }
  return classes[status] || 'bg-secondary'
}

function viewAppointmentDetails(appointment) {
  alert(`Appointment Details:\n\nUser: ${appointment.userEmail}\nProgram: ${appointment.programName}\nInstructor: ${appointment.instructorName || 'TBD'}\nDate: ${formatDate(appointment.date)}\nTime: ${appointment.time}\nStatus: ${appointment.status}\nPhone: ${appointment.phone || 'N/A'}\nNotes: ${appointment.notes || 'None'}\nBooked: ${formatDate(appointment.createdAt)}`)
}

// Admin edit appointment functionality
const editingAppointment = ref(null)
const adminEditForm = ref({
  programId: '',
  instructorId: '',
  date: '',
  time: '',
  notes: '',
  phone: '',
  emergencyContact: '',
  status: ''
})

const saveAdminEditAppointment = async () => {
  if (!editingAppointment.value) return
  
  console.log('Saving admin edit appointment:', editingAppointment.value)
  console.log('Admin edit form data:', adminEditForm.value)
  
  try {
    const updatedData = {
      programId: adminEditForm.value.programId,
      instructorId: adminEditForm.value.instructorId || null,
      date: adminEditForm.value.date,
      time: adminEditForm.value.time,
      notes: adminEditForm.value.notes,
      phone: adminEditForm.value.phone,
      emergencyContact: adminEditForm.value.emergencyContact,
      status: adminEditForm.value.status,
      updatedAt: new Date()
    }
    
    console.log('Admin updated data to save:', updatedData)
    
    await firestoreService.updateBooking(editingAppointment.value.id, updatedData)
    await logAdminActivity('EDIT_APPOINTMENT', editingAppointment.value.userEmail, `Edited appointment for ${editingAppointment.value.userEmail}`)
    await loadAllAppointments()
    
    // Hide modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('adminEditAppointmentModal'))
    if (modal) {
      modal.hide()
    }
    
    alert('Appointment updated successfully!')
    editingAppointment.value = null
  } catch (error) {
    console.error('Error updating appointment:', error)
    alert('Failed to update appointment. Please try again.')
  }
}

const cancelAdminEditAppointment = () => {
  editingAppointment.value = null
  const modal = bootstrap.Modal.getInstance(document.getElementById('adminEditAppointmentModal'))
  modal.hide()
}

const scrollToTop = () => {
  const tableContainer = document.querySelector('.table-responsive')
  if (tableContainer) {
    tableContainer.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const confirmAllPendingAppointments = async () => {
  const pendingAppointments = allAppointments.value.filter(a => a.status === 'pending')
  
  if (pendingAppointments.length === 0) {
    alert('No pending appointments to confirm.')
    return
  }
  
  const confirmMessage = `Are you sure you want to confirm ALL ${pendingAppointments.length} pending appointments?\n\nThis will:\n- Send confirmation emails to all users\n- Update all appointment statuses to "confirmed"\n- Log admin activity for each confirmation\n\nThis action cannot be undone.`
  
  if (confirm(confirmMessage)) {
    try {
      let successCount = 0
      let errorCount = 0
      
      for (const appointment of pendingAppointments) {
        try {
          await firestoreService.updateBooking(appointment.id, { 
            status: 'confirmed',
            updatedAt: new Date()
          })
          
          await logAdminActivity('CONFIRM_APPOINTMENT', appointment.userEmail, `Confirmed appointment for ${appointment.userEmail}`)
          
          // Send confirmation email
          try {
            const emailResult = await emailService.sendEmail({
              to: appointment.userEmail,
              subject: 'Appointment Confirmed - Engage360',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #28a745;">Appointment Confirmed!</h2>
                  <p>Dear User,</p>
                  <p>Great news! Your appointment has been confirmed.</p>
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3>Appointment Details:</h3>
                    <p><strong>Program:</strong> ${appointment.programName}</p>
                    <p><strong>Date:</strong> ${formatDate(appointment.date)}</p>
                    <p><strong>Time:</strong> ${appointment.time}</p>
                    <p><strong>Instructor:</strong> ${appointment.instructorName || 'TBD'}</p>
                    <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">CONFIRMED</span></p>
                  </div>
                  <p>Please arrive 10 minutes before your scheduled time.</p>
                  <p>Thank you for choosing Engage360!</p>
                </div>
              `
            })
            
            if (emailResult.demo) {
              console.log(`Confirmation email would be sent to ${appointment.userEmail} (SendGrid not configured)`)
            } else {
              console.log(`Confirmation email sent successfully to ${appointment.userEmail}`)
            }
          } catch (emailError) {
            console.error(`Failed to send confirmation email to ${appointment.userEmail}:`, emailError)
            errorCount++
          }
          
          successCount++
        } catch (error) {
          console.error(`Error confirming appointment ${appointment.id}:`, error)
          errorCount++
        }
      }
      
      await loadAllAppointments()
      
      if (errorCount === 0) {
        alert(`Successfully confirmed all ${successCount} pending appointments!`)
      } else {
        alert(`Confirmed ${successCount} appointments successfully. ${errorCount} appointments failed to confirm.`)
      }
    } catch (error) {
      console.error('Error confirming pending appointments:', error)
      alert('Error confirming appointments. Please try again.')
    }
  }
}

function editAppointment(appointment) {
  console.log('Admin edit appointment clicked:', appointment)
  editingAppointment.value = appointment
  adminEditForm.value = {
    programId: appointment.programId,
    instructorId: appointment.instructorId || '',
    date: appointment.date,
    time: appointment.time,
    notes: appointment.notes || '',
    phone: appointment.phone || '',
    emergencyContact: appointment.emergencyContact || '',
    status: appointment.status
  }
  
  console.log('Admin edit form populated:', adminEditForm.value)
  
  // Show edit modal
  try {
    const modalElement = document.getElementById('adminEditAppointmentModal')
    console.log('Admin modal element found:', modalElement)
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement)
      modal.show()
      console.log('Admin modal shown successfully')
    } else {
      console.error('Admin modal element not found')
      alert('Admin modal not found. Please refresh the page.')
    }
  } catch (error) {
    console.error('Error showing admin modal:', error)
    alert('Error opening admin edit modal: ' + error.message)
  }
}

async function confirmAppointment(appointment) {
  if (confirm(`Are you sure you want to confirm this appointment?\n\nUser: ${appointment.userEmail}\nProgram: ${appointment.programName}\nDate: ${formatDate(appointment.date)} at ${appointment.time}`)) {
    try {
      await firestoreService.updateBooking(appointment.id, { 
        status: 'confirmed',
        updatedAt: new Date()
      })
      await logAdminActivity('CONFIRM_APPOINTMENT', appointment.userEmail, `Confirmed appointment for ${appointment.userEmail}`)
      
          // Send confirmation email to user
          try {
            const emailResult = await emailService.sendEmail({
              to: appointment.userEmail,
              subject: 'Appointment Confirmed - Engage360',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #28a745;">Appointment Confirmed!</h2>
                  <p>Dear User,</p>
                  <p>Great news! Your appointment has been confirmed.</p>
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3>Appointment Details:</h3>
                    <p><strong>Program:</strong> ${appointment.programName}</p>
                    <p><strong>Date:</strong> ${formatDate(appointment.date)}</p>
                    <p><strong>Time:</strong> ${appointment.time}</p>
                    <p><strong>Instructor:</strong> ${appointment.instructorName || 'TBD'}</p>
                    <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">CONFIRMED</span></p>
                  </div>
                  <p>Please arrive 10 minutes before your scheduled time.</p>
                  <p>If you need to reschedule or cancel, please contact us at least 2 hours in advance.</p>
                  <p>Thank you for choosing Engage360!</p>
                </div>
              `
            })
            
            if (emailResult.demo) {
              console.log('Confirmation email would be sent (SendGrid not configured)')
            } else {
              console.log('Confirmation email sent successfully')
            }
          } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError)
            alert(`Appointment confirmed but email notification failed: ${emailError.message}`)
          }
      
      await loadAllAppointments()
      alert('Appointment confirmed successfully and user has been notified via email')
    } catch (error) {
      console.error('Error confirming appointment:', error)
      alert('Error confirming appointment. Please try again.')
    }
  }
}

async function rejectAppointment(appointment) {
  if (confirm(`Are you sure you want to reject this appointment?\n\nUser: ${appointment.userEmail}\nProgram: ${appointment.programName}\nDate: ${formatDate(appointment.date)} at ${appointment.time}`)) {
    try {
      await firestoreService.updateBooking(appointment.id, { 
        status: 'rejected',
        updatedAt: new Date()
      })
      await logAdminActivity('REJECT_APPOINTMENT', appointment.userEmail, `Rejected appointment for ${appointment.userEmail}`)
      
          // Send rejection email to user
          try {
            const emailResult = await emailService.sendEmail({
              to: appointment.userEmail,
              subject: 'Appointment Request Declined - Engage360',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #dc3545;">Appointment Request Declined</h2>
                  <p>Dear User,</p>
                  <p>We regret to inform you that your appointment request has been declined.</p>
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3>Appointment Details:</h3>
                    <p><strong>Program:</strong> ${appointment.programName}</p>
                    <p><strong>Date:</strong> ${formatDate(appointment.date)}</p>
                    <p><strong>Time:</strong> ${appointment.time}</p>
                    <p><strong>Instructor:</strong> ${appointment.instructorName || 'TBD'}</p>
                    <p><strong>Status:</strong> <span style="color: #dc3545; font-weight: bold;">DECLINED</span></p>
                  </div>
                  <p>This may be due to scheduling conflicts, instructor availability, or other factors.</p>
                  <p>Please feel free to book another appointment at a different time or contact us for assistance.</p>
                  <p>We apologize for any inconvenience.</p>
                  <p>Thank you for your understanding.</p>
                </div>
              `
            })
            
            if (emailResult.demo) {
              console.log('Rejection email would be sent (SendGrid not configured)')
            } else {
              console.log('Rejection email sent successfully')
            }
          } catch (emailError) {
            console.error('Failed to send rejection email:', emailError)
            alert(`Appointment rejected but email notification failed: ${emailError.message}`)
          }
      
      await loadAllAppointments()
      alert('Appointment rejected and user has been notified via email')
    } catch (error) {
      console.error('Error rejecting appointment:', error)
      alert('Error rejecting appointment. Please try again.')
    }
  }
}

async function cancelAppointment(appointment) {
  if (confirm(`Are you sure you want to cancel this appointment?\n\nUser: ${appointment.userEmail}\nProgram: ${appointment.programName}\nDate: ${formatDate(appointment.date)} at ${appointment.time}`)) {
    try {
      await firestoreService.updateBooking(appointment.id, { 
        status: 'cancelled',
        updatedAt: new Date()
      })
      await logAdminActivity('CANCEL_APPOINTMENT', appointment.userEmail, `Cancelled appointment for ${appointment.userEmail}`)
      await loadAllAppointments()
      alert('Appointment cancelled successfully')
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      alert('Error cancelling appointment. Please try again.')
    }
  }
}

function exportAppointmentsToCSV() {
  const headers = ['User Email', 'Program', 'Instructor', 'Date', 'Time', 'Status', 'Phone', 'Notes', 'Booked On']
  const rows = allAppointments.value.map(appointment => [
    appointment.userEmail,
    appointment.programName,
    appointment.instructorName || 'TBD',
    formatDate(appointment.date),
    appointment.time,
    appointment.status,
    appointment.phone || '',
    appointment.notes || '',
    formatDate(appointment.createdAt)
  ])

  const csvContent = [headers, ...rows].map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `appointments-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Calendar Functions
function refreshCalendar() {
  console.log('refreshCalendar: Manually refreshing calendar')
  loadAllAppointments()
}

function forceCalendarUpdate() {
  console.log('forceCalendarUpdate: Forcing calendar update')
  // Force reactivity by reassigning the computed values
  const currentAppointments = [...allAppointments.value]
  allAppointments.value = []
  setTimeout(() => {
    allAppointments.value = currentAppointments
    console.log('forceCalendarUpdate: Calendar update forced')
  }, 100)
}

// Helper function to format dates consistently for calendar
function formatDateForCalendar(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function debugCalendarData() {
  console.log('=== CALENDAR DEBUG ===')
  console.log('allAppointments.value:', allAppointments.value)
  console.log('allAppointments.length:', allAppointments.value.length)
  
  // Check date formats
  allAppointments.value.forEach((apt, index) => {
    console.log(`Appointment ${index}:`, {
      id: apt.id,
      date: apt.date,
      dateType: typeof apt.date,
      formattedDate: formatDateForCalendar(new Date(apt.date)),
      time: apt.time,
      userEmail: apt.userEmail,
      programName: apt.programName
    })
  })
  
  // Check calendar computed properties
  console.log('calendarDates computed result:', calendarDates.value)
  console.log('calendarDates length:', calendarDates.value.length)
  
  // Check dates with appointments
  const datesWithAppointments = calendarDates.value.filter(d => d.appointments.length > 0)
  console.log('Dates with appointments:', datesWithAppointments)
  
  // Check if real-time listener is active
  console.log('Real-time listener status:', unsubscribeAppointments ? 'Active' : 'Not set up')
  
  alert(`Calendar Debug Complete!\n\nFound ${allAppointments.value.length} appointments\n${datesWithAppointments.length} dates have appointments\nReal-time listener: ${unsubscribeAppointments ? 'Active' : 'Not set up'}\nCheck console for detailed logs.`)
}

function testRealTimeListener() {
  console.log('=== TESTING REAL-TIME LISTENER ===')
  console.log('Current listener:', unsubscribeAppointments)
  
  if (unsubscribeAppointments) {
    console.log('Listener is active, testing manual trigger...')
    // Manually trigger the listener by calling loadAllAppointments
    loadAllAppointments()
  } else {
    console.log('Listener is not active, setting up new listener...')
    // Re-setup the listener
    unsubscribeAppointments = firestoreService.onBookingsSnapshot((appointments) => {
      console.log('TEST: Real-time appointments update received:', appointments)
      allAppointments.value = appointments.map(appointment => ({
        ...appointment,
        programName: getProgramName(appointment.programId),
        instructorName: getInstructorName(appointment.instructorId),
        createdAt: appointment.createdAt?.toDate?.() || new Date()
      }))
      console.log('TEST: Updated allAppointments.value:', allAppointments.value)
      lastUpdated.value = new Date().toLocaleString()
      console.log('TEST: Calendar should now update with', allAppointments.value.length, 'appointments')
    })
  }
  
  alert('Real-time listener test completed. Check console for logs.')
}

// Test Functions
async function checkAppointmentsInFirestore() {
  try {
    console.log('Checking appointments directly in Firestore...')
    
    // Use the getAllBookings function to check what's actually in Firestore
    const appointments = await firestoreService.getAllBookings()
    console.log('Direct Firestore query result:', appointments)
    
    if (appointments.length === 0) {
      alert('No appointments found in Firestore database.\n\nThis could mean:\n1. No appointments have been created yet\n2. Firestore rules are blocking access\n3. There\'s a connection issue')
    } else {
      alert(`Found ${appointments.length} appointments in Firestore:\n\n${appointments.map(apt => `- ${apt.userEmail} on ${apt.date} at ${apt.time}`).join('\n')}\n\nCheck console for full details.`)
    }
    
  } catch (error) {
    console.error('Error checking Firestore appointments:', error)
    alert(`Error checking Firestore: ${error.message}`)
  }
}

async function checkAdminPermissions() {
  try {
    console.log('=== CHECKING ADMIN PERMISSIONS ===')
    console.log('Current user:', firebaseAuthStore.currentUser)
    console.log('User email:', firebaseAuthStore.currentUser?.email)
    console.log('User UID:', firebaseAuthStore.currentUser?.uid)
    
    // Check if user has admin role
    const userRole = await firebaseAuthStore.getUserRole()
    console.log('User role:', userRole)
    
    // Test Firestore access
    console.log('Testing Firestore access...')
    const testAppointments = await firestoreService.getAllBookings()
    console.log('Firestore access test result:', testAppointments.length, 'appointments')
    
    // Test real-time listener setup
    console.log('Real-time listener status:', unsubscribeAppointments ? 'Active' : 'Not set up')
    
    alert(`Admin Permission Check:\n\nUser: ${firebaseAuthStore.currentUser?.email}\nRole: ${userRole}\nFirestore Access: ${testAppointments.length} appointments found\nReal-time Listener: ${unsubscribeAppointments ? 'Active' : 'Not set up'}\n\nCheck console for detailed logs.`)
    
  } catch (error) {
    console.error('Error checking admin permissions:', error)
    alert(`Error checking permissions: ${error.message}`)
  }
}

// Analytics Functions
function initializeCharts() {
  // Initialize charts with Chart.js using Vue refs
  const charts = [
    { ref: programChart, type: 'programChart' },
    { ref: trendChart, type: 'trendChart' },
    { ref: fitnessChart, type: 'fitnessChart' },
    { ref: growthChart, type: 'growthChart' },
    { ref: verificationChart, type: 'verificationChart' }
  ]
  
  charts.forEach(({ ref: chartRef, type }) => {
    if (chartRef.value) {
      const ctx = chartRef.value.getContext('2d')
      const data = getChartData(type)
      
      // Destroy existing chart if it exists
      if (chartRef.value.chart) {
        chartRef.value.chart.destroy()
      }
      
      const newChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: [{
            label: data.label || 'Count',
            data: data.data,
            backgroundColor: [
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 99, 132, 0.8)',
              'rgba(255, 205, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)',
              'rgba(199, 199, 199, 0.8)'
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 205, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(199, 199, 199, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
      
      // Store chart reference for future updates
      chartRef.value.chart = newChart
    }
  })
}

function refreshCharts() {
  console.log('Refreshing charts with real data...')
  initializeCharts()
}

function getChartData(chartType) {
  console.log(`Getting chart data for ${chartType}`)
  console.log('allAppointments.value:', allAppointments.value)
  console.log('userSubmissions.value:', userSubmissions.value)
  console.log('firebaseUsers.value:', firebaseUsers.value)
  
  switch (chartType) {
    case 'programChart':
      // Real data: Most popular programs from appointments
      const programCounts = {}
      allAppointments.value.forEach(appointment => {
        if (appointment.programName && appointment.programName !== 'Unknown Program') {
          programCounts[appointment.programName] = (programCounts[appointment.programName] || 0) + 1
        }
      })
      
      // Sort programs by count (most popular first)
      const sortedPrograms = Object.entries(programCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 7) // Top 7 programs
      
      const programLabels = sortedPrograms.map(([name]) => name)
      const programData = sortedPrograms.map(([, count]) => count)
      
      console.log('Program chart data:', { programCounts, sortedPrograms, programLabels, programData })
      
      return {
        labels: programLabels.length > 0 ? programLabels : ['No Programs'],
        data: programData.length > 0 ? programData : [0],
        label: 'Appointment Bookings'
      }
      
    case 'trendChart':
      // Real data: Daily appointment bookings from the last 7 days
      const last7Days = []
      const today = new Date()
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        last7Days.push(date)
      }
      
      const dayLabels = last7Days.map(date => date.toLocaleDateString('en-US', { weekday: 'short' }))
      const dayData = last7Days.map(date => {
        const dateStr = formatDateForCalendar(date)
        return allAppointments.value.filter(apt => {
          const aptDate = apt.date instanceof Date ? apt.date : new Date(apt.date)
          const aptDateStr = formatDateForCalendar(aptDate)
          return aptDateStr === dateStr
        }).length
      })
      
      return {
        labels: dayLabels,
        data: dayData,
        label: 'Daily Appointments'
      }
      
    case 'fitnessChart':
      // Real data: Appointment status distribution
      const statusCounts = { 'Confirmed': 0, 'Pending': 0, 'Cancelled': 0, 'Rejected': 0 }
      allAppointments.value.forEach(appointment => {
        const status = appointment.status || 'Pending'
        if (status.toLowerCase().includes('confirm')) statusCounts['Confirmed']++
        else if (status.toLowerCase().includes('cancel')) statusCounts['Cancelled']++
        else if (status.toLowerCase().includes('reject')) statusCounts['Rejected']++
        else statusCounts['Pending']++
      })
      
      return {
        labels: Object.keys(statusCounts),
        data: Object.values(statusCounts),
        label: 'Appointment Status'
      }
      
    case 'growthChart':
      // Real data: Weekly user registrations from the last 4 weeks
      const last4Weeks = []
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - (today.getDay() + 28)) // Start 4 weeks ago
      
      for (let i = 0; i < 4; i++) {
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        last4Weeks.push({ start: new Date(weekStart), end: new Date(weekEnd) })
        weekStart.setDate(weekStart.getDate() + 7)
      }
      
      const weekLabels = last4Weeks.map((week, index) => `Week ${index + 1}`)
      const weekData = last4Weeks.map(week => {
        return firebaseUsers.value.filter(user => {
          const userDate = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt)
          return userDate >= week.start && userDate <= week.end
        }).length
      })
      
      return {
        labels: weekLabels,
        data: weekData,
        label: 'New Users'
      }
      
    case 'verificationChart':
      // Real data: Email verification status
      const verifiedCount = firebaseUsers.value.filter(u => u.emailVerified).length
      const unverifiedCount = firebaseUsers.value.filter(u => !u.emailVerified).length
      
      return {
        labels: ['Verified', 'Unverified'],
        data: [verifiedCount, unverifiedCount],
        label: 'Email Verification'
      }
      
    default:
      return { labels: [], data: [], label: '' }
  }
}

onMounted(async () => {
  try {
    // Load current user role
    await loadCurrentUserRole()
    
    // Load appointments
    await loadAllAppointments()
    
    // Load instructors
    await loadInstructors()
    
    // Set up real-time listeners
    unsubscribeUsers = firestoreService.onUsersSnapshot((users) => {
      firebaseUsers.value = users.map(user => ({
        ...user,
        role: getActualRole(user.email),
        createdAt: user.createdAt?.toDate?.() || new Date()
      }))
      lastUpdated.value = new Date().toLocaleString()
      // Refresh charts when user data changes
      setTimeout(() => refreshCharts(), 500)
    })

    unsubscribeRegistrations = firestoreService.onRegistrationsSnapshot((registrations) => {
      userSubmissions.value = registrations.map(reg => ({
        ...reg,
        name: `${reg.firstName || ''} ${reg.lastName || ''}`.trim(),
        submitted: reg.createdAt?.toDate?.() || new Date(),
        programs: reg.selectedPrograms || reg.interests || []
      }))
      lastUpdated.value = new Date().toLocaleString()
      // Refresh charts when registration data changes
      setTimeout(() => refreshCharts(), 500)
    })

    unsubscribeAdminRoles = firestoreService.onAdminRolesSnapshot((roles) => {
      adminRoles.value = roles
      lastUpdated.value = new Date().toLocaleString()
    })

    unsubscribeActivityLog = firestoreService.onAdminActivityLogSnapshot((activities) => {
      activityLog.value = activities.map(activity => ({
        ...activity,
        timestamp: activity.createdAt?.toDate?.() || new Date()
      }))
      lastUpdated.value = new Date().toLocaleString()
    })

    unsubscribePrograms = firestoreService.onProgramsSnapshot((programsData) => {
      programs.value = programsData.map(program => ({
        ...program,
        createdAt: program.createdAt?.toDate?.() || new Date()
      }))
      lastUpdated.value = new Date().toLocaleString()
    })

    unsubscribeAppointments = firestoreService.onBookingsSnapshot((appointments) => {
      console.log('Real-time appointments update received:', appointments)
      allAppointments.value = appointments.map(appointment => ({
        ...appointment,
        programName: getProgramName(appointment.programId),
        instructorName: getInstructorName(appointment.instructorId),
        createdAt: appointment.createdAt?.toDate?.() || new Date()
      }))
      console.log('Updated allAppointments.value:', allAppointments.value)
      lastUpdated.value = new Date().toLocaleString()
      console.log('Calendar should now update with', allAppointments.value.length, 'appointments')
      // Refresh charts when appointment data changes
      setTimeout(() => refreshCharts(), 500)
    })

    // Initialize charts after a short delay to ensure DOM is ready
    setTimeout(() => {
      initializeCharts()
    }, 1000)

    // Set up auto-refresh for calendar (every 30 seconds)
    refreshInterval = setInterval(() => {
      console.log('Auto-refreshing appointments...')
      loadAllAppointments()
    }, 30000)

  } catch (error) {
    console.error('Error setting up real-time listeners:', error)
  }
})

onUnmounted(() => {
  if (unsubscribeUsers) unsubscribeUsers()
  if (unsubscribeRegistrations) unsubscribeRegistrations()
  if (unsubscribeAdminRoles) unsubscribeAdminRoles()
  if (unsubscribeActivityLog) unsubscribeActivityLog()
  if (unsubscribePrograms) unsubscribePrograms()
  if (unsubscribeAppointments) unsubscribeAppointments()
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<style scoped>
.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.badge {
  font-size: 0.75em;
}

/* Ensure all table headers are visible */
:deep(.table thead) {
  display: table-header-group !important;
}

:deep(.table thead th) {
  display: table-cell !important;
  visibility: visible !important;
  opacity: 1 !important;
  color: #fff !important;
  background-color: #212529 !important;
  padding: 0.75rem 0.5rem;
  font-weight: 600;
  text-align: left;
  border: 1px solid #454d55;
}

/* Calendar Styles */
.calendar-container {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  height: 600px;
  overflow-y: auto;
  overflow-x: auto;
}

/* Table Scrolling Styles */
.table-responsive {
  border-radius: 8px;
}

/* Ensure table headers are always visible */
.table-responsive :deep(.table thead) {
  display: table-header-group !important;
}

.table-responsive :deep(.table thead th) {
  display: table-cell !important;
  visibility: visible !important;
  opacity: 1 !important;
  color: #fff !important;
  background-color: #212529 !important;
  padding: 0.75rem 0.5rem;
  font-weight: 600;
  text-align: left;
}

.table-responsive::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-responsive::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-responsive::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.table-responsive::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.table-sticky-header :deep(.table thead th) {
  position: sticky;
  top: 0;
  background-color: #f8f9fa;
  z-index: 10;
  border-bottom: 2px solid #dee2e6;
  display: table-cell !important;
  visibility: visible !important;
}

.scroll-to-top {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 20;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.calendar-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.calendar-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.calendar-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.calendar-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.calendar-header {
  margin-bottom: 1rem;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #dee2e6;
  border-radius: 4px;
  overflow: hidden;
}

.calendar-weekday {
  background-color: #f8f9fa;
  padding: 0.5rem;
  text-align: center;
  font-weight: 600;
  color: #495057;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #dee2e6;
  border-radius: 4px;
  overflow: hidden;
}

.calendar-day {
  background-color: white;
  min-height: 120px;
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  position: relative;
}

.calendar-day.other-month {
  background-color: #f8f9fa;
  color: #6c757d;
}

.calendar-day.today {
  background-color: #e3f2fd;
  border-color: #2196f3;
}

.calendar-day.has-appointments {
  background-color: #f0f8ff;
}

.calendar-day-number {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.calendar-appointments {
  font-size: 0.75rem;
}

.calendar-appointment {
  background-color: #e8f5e8;
  border-left: 3px solid #28a745;
  padding: 0.25rem;
  margin-bottom: 0.25rem;
  border-radius: 2px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.calendar-appointment.appointment-confirmed {
  background-color: #e8f5e8;
  border-left-color: #28a745;
}

.calendar-appointment.appointment-pending {
  background-color: #fff3cd;
  border-left-color: #ffc107;
}

.calendar-appointment.appointment-cancelled {
  background-color: #f8d7da;
  border-left-color: #dc3545;
}

.calendar-appointment.appointment-completed {
  background-color: #d1ecf1;
  border-left-color: #17a2b8;
}

.calendar-more {
  font-size: 0.7rem;
  color: #6c757d;
  text-align: center;
  font-style: italic;
}

.calendar-week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #dee2e6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.calendar-week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #dee2e6;
  border-radius: 4px;
  overflow: hidden;
}

.calendar-week-day {
  background-color: white;
  min-height: 200px;
  padding: 0.5rem;
  border: 1px solid #dee2e6;
}

.calendar-week-day.today {
  background-color: #e3f2fd;
  border-color: #2196f3;
}

.calendar-day-header {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #dee2e6;
}

.calendar-day-appointments {
  max-height: 500px;
  overflow-y: auto;
}

.calendar-appointment-detail {
  display: flex;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  border-left: 4px solid #dee2e6;
  cursor: pointer;
  transition: all 0.2s ease;
}

.calendar-appointment-detail:hover {
  background-color: #f8f9fa;
  transform: translateX(2px);
}

.calendar-appointment-detail.appointment-confirmed {
  border-left-color: #28a745;
  background-color: #f8fff8;
}

.calendar-appointment-detail.appointment-pending {
  border-left-color: #ffc107;
  background-color: #fffef8;
}

.calendar-appointment-detail.appointment-cancelled {
  border-left-color: #dc3545;
  background-color: #fff8f8;
}

.calendar-appointment-detail.appointment-completed {
  border-left-color: #17a2b8;
  background-color: #f8feff;
}

.appointment-time {
  font-weight: 600;
  min-width: 80px;
  color: #495057;
}

.appointment-details {
  flex: 1;
  margin-left: 1rem;
}

.appointment-program {
  font-weight: 600;
  color: #212529;
}

.appointment-user {
  font-size: 0.9rem;
  color: #6c757d;
}

.appointment-instructor {
  font-size: 0.8rem;
  color: #6c757d;
}

.appointment-status {
  margin-left: 1rem;
}

.btn-group .btn.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}
</style>