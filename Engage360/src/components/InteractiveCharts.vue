<template>
  <div class="interactive-charts">
    <div class="charts-header">
      <h3><i class="fas fa-chart-bar"></i> Interactive Analytics Dashboard</h3>
      <p class="text-muted">Real-time data visualization from Firestore</p>
    </div>

    <!-- Chart Controls -->
    <div class="chart-controls">
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <label for="timeRange" class="form-label">Time Range</label>
          <select id="timeRange" v-model="selectedTimeRange" @change="updateCharts" class="form-select">
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <div class="col-md-3">
          <label for="chartType" class="form-label">Chart Type</label>
              <select id="chartType" v-model="selectedChartType" @change="updateCharts" class="form-select">
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="doughnut">Doughnut Chart</option>
              </select>
        </div>
        <div class="col-md-3">
          <label for="dataCategory" class="form-label">Data Category</label>
          <select id="dataCategory" v-model="selectedDataCategory" @change="updateCharts" class="form-select">
            <option value="users">Users</option>
            <option value="programs">Programs</option>
            <option value="bookings">Bookings</option>
            <option value="emails">Email Campaigns</option>
            <option value="revenue">Revenue</option>
          </select>
        </div>
        <div class="col-md-3">
          <div class="d-flex align-items-end h-100">
            <button @click="refreshData" class="btn btn-primary" :disabled="loading">
              <i class="fas fa-sync" :class="{ 'fa-spin': loading }"></i>
              {{ loading ? 'Loading...' : 'Refresh' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="charts-grid">
      <!-- Main Chart -->
      <div class="chart-container main-chart">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5>{{ getChartTitle() }}</h5>
            <div class="chart-actions">
              <button @click="exportChart" class="btn btn-outline-secondary btn-sm">
                <i class="fas fa-download"></i> Export
              </button>
              <button @click="fullscreenChart" class="btn btn-outline-secondary btn-sm">
                <i class="fas fa-expand"></i> Fullscreen
              </button>
            </div>
          </div>
          <div class="card-body">
            <div class="chart-wrapper">
              <canvas ref="mainChart" :key="chartKey"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Secondary Charts -->
      <div class="secondary-charts">
        <!-- User Growth Chart -->
        <div class="chart-container">
          <div class="card">
            <div class="card-header">
              <h6><i class="fas fa-users"></i> User Growth</h6>
            </div>
            <div class="card-body">
              <canvas ref="userGrowthChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Program Popularity Chart -->
        <div class="chart-container">
          <div class="card">
            <div class="card-header">
              <h6><i class="fas fa-graduation-cap"></i> Program Popularity</h6>
            </div>
            <div class="card-body">
              <canvas ref="programPopularityChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Booking Status Chart -->
        <div class="chart-container">
          <div class="card">
            <div class="card-header">
              <h6><i class="fas fa-calendar-check"></i> Booking Status</h6>
            </div>
            <div class="card-body">
              <canvas ref="bookingStatusChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Email Performance Chart -->
        <div class="chart-container">
          <div class="card">
            <div class="card-header">
              <h6><i class="fas fa-envelope"></i> Email Performance</h6>
            </div>
            <div class="card-body">
              <canvas ref="emailPerformanceChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Summary -->
    <div class="data-summary mt-4">
      <div class="card">
        <div class="card-header">
          <h5><i class="fas fa-info-circle"></i> Data Summary</h5>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <div class="summary-item">
                <div class="summary-icon bg-primary">
                  <i class="fas fa-users"></i>
                </div>
                <div class="summary-content">
                  <h4>{{ summaryData.totalUsers }}</h4>
                  <p>Total Users</p>
                  <small class="text-success">+{{ summaryData.newUsers }} this period</small>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="summary-item">
                <div class="summary-icon bg-success">
                  <i class="fas fa-graduation-cap"></i>
                </div>
                <div class="summary-content">
                  <h4>{{ summaryData.totalPrograms }}</h4>
                  <p>Active Programs</p>
                  <small class="text-info">{{ summaryData.enrollmentRate }}% enrollment rate</small>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="summary-item">
                <div class="summary-icon bg-warning">
                  <i class="fas fa-calendar-check"></i>
                </div>
                <div class="summary-content">
                  <h4>{{ summaryData.totalBookings }}</h4>
                  <p>Total Bookings</p>
                  <small class="text-success">{{ summaryData.confirmedBookings }} confirmed</small>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="summary-item">
                <div class="summary-icon bg-info">
                  <i class="fas fa-envelope"></i>
                </div>
                <div class="summary-content">
                  <h4>{{ summaryData.totalEmails }}</h4>
                  <p>Email Campaigns</p>
                  <small class="text-primary">{{ summaryData.openRate }}% open rate</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Real-time Updates -->
    <div class="real-time-indicator" v-if="realTimeEnabled">
      <div class="alert alert-info d-flex align-items-center">
        <i class="fas fa-broadcast-tower me-2"></i>
        <span>Real-time updates enabled - Last updated: {{ lastUpdateTime }}</span>
        <button @click="toggleRealTime" class="btn btn-sm btn-outline-info ms-auto">
          Disable
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
  PieController,
  DoughnutController
} from 'chart.js'
import { firestoreService } from '@/services/firestoreService'

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
  PieController,
  DoughnutController
)

// Reactive data
const loading = ref(false)
const selectedTimeRange = ref('30d')
const selectedChartType = ref('bar')
const selectedDataCategory = ref('users')
const chartKey = ref(0)
const realTimeEnabled = ref(false)
const lastUpdateTime = ref('')
const updateInterval = ref(null)

// Chart references
const mainChart = ref(null)
const userGrowthChart = ref(null)
const programPopularityChart = ref(null)
const bookingStatusChart = ref(null)
const emailPerformanceChart = ref(null)

// Chart instances
const chartInstances = ref({})

// Data
const chartData = ref({})
const summaryData = ref({
  totalUsers: 0,
  newUsers: 0,
  totalPrograms: 0,
  enrollmentRate: 0,
  totalBookings: 0,
  confirmedBookings: 0,
  totalEmails: 0,
  openRate: 0
})

// Methods
const loadData = async () => {
  loading.value = true
  
  try {
    const [users, programs, bookings, emails] = await Promise.all([
      firestoreService.getAllUsers(),
      firestoreService.getAllPrograms(),
      firestoreService.getAllBookings(),
      firestoreService.getEmailCampaigns()
    ])

    // Process data based on time range
    const processedData = processDataByTimeRange(users, programs, bookings, emails)
    
    chartData.value = processedData
    updateSummaryData(processedData)
    
    await nextTick()
    updateAllCharts()
    
    lastUpdateTime.value = new Date().toLocaleTimeString()
    
  } catch (error) {
    console.error('Error loading chart data:', error)
  } finally {
    loading.value = false
  }
}

const processDataByTimeRange = (users, programs, bookings, emails) => {
  const now = new Date()
  const startDate = getStartDate(selectedTimeRange.value, now)
  
  // Filter data by time range
  const recentUsers = users.filter(user => toDateSafe(user.createdAt) && toDateSafe(user.createdAt) >= startDate)
  const recentBookings = bookings.filter(booking => toDateSafe(booking.createdAt) && toDateSafe(booking.createdAt) >= startDate)
  const recentEmails = emails.filter(email => toDateSafe(email.sentAt) && toDateSafe(email.sentAt) >= startDate)
  
  // Generate time series data
  const timeLabels = generateTimeLabels(startDate, now)
  
  return {
    users: {
      total: users,
      recent: recentUsers,
      timeSeries: generateTimeSeriesData(users, timeLabels, 'createdAt')
    },
    programs: {
      total: programs,
      active: programs.filter(p => p.status === 'active'),
      byCategory: groupBy(programs, 'category'),
      enrollmentData: generateEnrollmentData(programs, users)
    },
    bookings: {
      total: bookings,
      recent: recentBookings,
      timeSeries: generateTimeSeriesData(bookings, timeLabels, 'createdAt'),
      byStatus: groupBy(bookings, 'status'),
      byProgram: groupBy(bookings, 'programId')
    },
    emails: {
      total: emails,
      recent: recentEmails,
      timeSeries: generateTimeSeriesData(emails, timeLabels, 'sentAt'),
      byCategory: groupBy(emails, 'category'),
      performance: generateEmailPerformanceData(emails)
    },
    timeLabels
  }
}

const getStartDate = (range, now) => {
  const start = new Date(now)
  
  switch (range) {
    case '7d':
      start.setDate(now.getDate() - 7)
      break
    case '30d':
      start.setDate(now.getDate() - 30)
      break
    case '90d':
      start.setDate(now.getDate() - 90)
      break
    case '1y':
      start.setFullYear(now.getFullYear() - 1)
      break
    case 'all':
      start.setFullYear(2020) // Start from 2020
      break
  }
  
  return start
}

const generateTimeLabels = (startDate, endDate) => {
  const labels = []
  const current = new Date(startDate)
  
  while (current <= endDate) {
    labels.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }
  
  return labels
}

const generateTimeSeriesData = (data, labels, dateField) => {
  const counts = new Array(labels.length).fill(0)
  
  data.forEach(item => {
    const d = toDateSafe(item[dateField])
    if (!d) return
    const date = d.toISOString().split('T')[0]
    const index = labels.indexOf(date)
    if (index !== -1) {
      counts[index]++
    }
  })
  
  return counts
}

const generateEnrollmentData = (programs, users) => {
  return programs.map(program => {
    const enrolledUsers = users.filter(user => 
      user.enrolledPrograms && user.enrolledPrograms.includes(program.id)
    )
    return {
      name: program.name,
      enrolled: enrolledUsers.length,
      capacity: program.maxCapacity || 0,
      utilization: program.maxCapacity ? (enrolledUsers.length / program.maxCapacity) * 100 : 0
    }
  })
}

const generateEmailPerformanceData = (emails) => {
  return emails.map(email => ({
    subject: email.subject,
    sent: email.recipientCount || 0,
    opened: Math.round((email.openRate || 0) * (email.recipientCount || 0) / 100),
    clicked: Math.round((email.clickRate || 0) * (email.recipientCount || 0) / 100)
  }))
}

const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const value = item[key] || 'Unknown'
    groups[value] = (groups[value] || 0) + 1
    return groups
  }, {})
}

const updateSummaryData = (data) => {
  summaryData.value = {
    totalUsers: data.users.total.length,
    newUsers: data.users.recent.length,
    totalPrograms: data.programs.active.length,
    enrollmentRate: calculateEnrollmentRate(data.users.total, data.programs.total),
    totalBookings: data.bookings.total.length,
    confirmedBookings: (data.bookings.byStatus && data.bookings.byStatus.confirmed) || 0,
    totalEmails: data.emails.total.length,
    openRate: calculateAverageOpenRate(data.emails.total)
  }
}

const calculateEnrollmentRate = (users, programs) => {
  const enrolledUsers = users.filter(user => user.enrolledPrograms && user.enrolledPrograms.length > 0)
  return users.length > 0 ? Math.round((enrolledUsers.length / users.length) * 100) : 0
}

const calculateAverageOpenRate = (emails) => {
  const sentEmails = emails.filter(e => e.status === 'sent' && e.openRate !== undefined)
  return sentEmails.length > 0 ? 
    Math.round(sentEmails.reduce((sum, e) => sum + e.openRate, 0) / sentEmails.length) : 0
}

// Safe date parser for Firestore Timestamp, millis, ISO string, or Date
const toDateSafe = (value) => {
  if (!value) return null
  try {
    if (value instanceof Date) return value
    if (value && typeof value.toDate === 'function') return value.toDate() // Firestore Timestamp
    if (typeof value === 'number') {
      const d = new Date(value)
      return isNaN(d.getTime()) ? null : d
    }
    if (typeof value === 'string') {
      const d = new Date(value)
      return isNaN(d.getTime()) ? null : d
    }
    return null
  } catch {
    return null
  }
}

const updateAllCharts = () => {
  updateMainChart()
  updateUserGrowthChart()
  updateProgramPopularityChart()
  updateBookingStatusChart()
  updateEmailPerformanceChart()
}

const updateMainChart = () => {
  if (!mainChart.value) return
  
  const ctx = mainChart.value.getContext('2d')
  
  // Destroy existing chart
  if (chartInstances.value.main) {
    chartInstances.value.main.destroy()
  }
  
  const data = getMainChartData()
  
  chartInstances.value.main = new Chart(ctx, {
    type: selectedChartType.value,
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: getChartTitle(),
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: selectedChartType.value !== 'pie' && selectedChartType.value !== 'doughnut' ? {
        x: {
          display: true,
          title: { display: true, text: 'Time' }
        },
        y: {
          display: true,
          title: { display: true, text: 'Count' },
          beginAtZero: true
        }
      } : {}
    }
  })
}

const getMainChartData = () => {
  const data = chartData.value
  
  switch (selectedDataCategory.value) {
    case 'users':
      return {
        labels: data.timeLabels,
        datasets: [{
          label: 'New Users',
          data: data.users.timeSeries,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          fill: selectedChartType.value === 'line'
        }]
      }
    case 'programs':
      const programData = Object.entries(data.programs.byCategory)
      return {
        labels: programData.map(([key]) => key),
        datasets: [{
          label: 'Programs',
          data: programData.map(([, value]) => value),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 205, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 2
        }]
      }
    case 'bookings':
      return {
        labels: data.timeLabels,
        datasets: [{
          label: 'Bookings',
          data: data.bookings.timeSeries,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          fill: selectedChartType.value === 'line'
        }]
      }
    case 'emails':
      return {
        labels: data.timeLabels,
        datasets: [{
          label: 'Emails Sent',
          data: data.emails.timeSeries,
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 2,
          fill: selectedChartType.value === 'line'
        }]
      }
    default:
      return { labels: [], datasets: [] }
  }
}

const getChartTitle = () => {
  const category = selectedDataCategory.value.charAt(0).toUpperCase() + selectedDataCategory.value.slice(1)
  const timeRange = selectedTimeRange.value
  return `${category} Analytics - ${timeRange}`
}

const updateUserGrowthChart = () => {
  if (!userGrowthChart.value) return
  
  const ctx = userGrowthChart.value.getContext('2d')
  
  if (chartInstances.value.userGrowth) {
    chartInstances.value.userGrowth.destroy()
  }
  
  const data = chartData.value
  const userData = Object.entries(groupBy(data.users.total, 'role'))
  
  chartInstances.value.userGrowth = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: userData.map(([key]) => key),
      datasets: [{
        data: userData.map(([, value]) => value),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 205, 86, 0.6)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  })
}

const updateProgramPopularityChart = () => {
  if (!programPopularityChart.value) return
  
  const ctx = programPopularityChart.value.getContext('2d')
  
  if (chartInstances.value.programPopularity) {
    chartInstances.value.programPopularity.destroy()
  }
  
  const data = chartData.value.programs.enrollmentData.slice(0, 5) // Top 5 programs
  
  chartInstances.value.programPopularity = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(p => p.name),
      datasets: [{
        label: 'Enrolled Users',
        data: data.map(p => p.enrolled),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  })
}

const updateBookingStatusChart = () => {
  if (!bookingStatusChart.value) return
  
  const ctx = bookingStatusChart.value.getContext('2d')
  
  if (chartInstances.value.bookingStatus) {
    chartInstances.value.bookingStatus.destroy()
  }
  
  const data = Object.entries(chartData.value.bookings.byStatus)
  
  chartInstances.value.bookingStatus = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: data.map(([key]) => key),
      datasets: [{
        data: data.map(([, value]) => value),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)', // confirmed
          'rgba(255, 205, 86, 0.6)',  // pending
          'rgba(255, 99, 132, 0.6)',  // cancelled
          'rgba(153, 102, 255, 0.6)'  // completed
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  })
}

const updateEmailPerformanceChart = () => {
  if (!emailPerformanceChart.value) return
  
  const ctx = emailPerformanceChart.value.getContext('2d')
  
  if (chartInstances.value.emailPerformance) {
    chartInstances.value.emailPerformance.destroy()
  }
  
  const data = chartData.value.emails.performance.slice(0, 5) // Top 5 campaigns
  
  chartInstances.value.emailPerformance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(e => e.subject.substring(0, 20) + '...'),
      datasets: [
        {
          label: 'Sent',
          data: data.map(e => e.sent),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          tension: 0.4
        },
        {
          label: 'Opened',
          data: data.map(e => e.opened),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          tension: 0.4
        },
        {
          label: 'Clicked',
          data: data.map(e => e.clicked),
          borderColor: 'rgba(255, 159, 64, 1)',
          backgroundColor: 'rgba(255, 159, 64, 0.1)',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  })
}

const updateCharts = () => {
  chartKey.value++
  nextTick(() => {
    // Ensure any existing instances are destroyed to avoid canvas reuse errors
    Object.values(chartInstances.value).forEach((c) => { try { c?.destroy() } catch {} })
    chartInstances.value = {}
    updateAllCharts()
  })
}

const refreshData = () => {
  loadData()
}

// Real-time Firestore listeners
let unsubscribeBookings = null
let unsubscribePrograms = null
let unsubscribeUsers = null

const attachRealtimeListeners = () => {
  try {
    if (unsubscribeBookings) unsubscribeBookings()
    unsubscribeBookings = firestoreService.onBookingsSnapshot((items) => {
      // Merge latest bookings into chart pipeline
      // We only reload bookings to keep it simple
      Promise.all([
        firestoreService.getAllUsers(),
        firestoreService.getAllPrograms(),
        Promise.resolve(items),
        firestoreService.getEmailCampaigns()
      ]).then(([users, programs, bookings, emails]) => {
        const processed = processDataByTimeRange(users, programs, bookings, emails)
        chartData.value = processed
        updateSummaryData(processed)
        nextTick(updateAllCharts)
        lastUpdateTime.value = new Date().toLocaleTimeString()
      })
    })
  } catch (e) {
    console.error('Failed to attach real-time listeners:', e)
  }
}

const exportChart = () => {
  if (chartInstances.value.main) {
    const url = chartInstances.value.main.toBase64Image()
    const a = document.createElement('a')
    a.href = url
    a.download = `${getChartTitle()}.png`
    a.click()
  }
}

const fullscreenChart = () => {
  // Implement fullscreen functionality
  alert('Fullscreen chart view - Feature coming soon!')
}

const toggleRealTime = () => {
  realTimeEnabled.value = !realTimeEnabled.value
  
  if (realTimeEnabled.value) {
    updateInterval.value = setInterval(() => {
      loadData()
    }, 30000) // Update every 30 seconds
  } else {
    if (updateInterval.value) {
      clearInterval(updateInterval.value)
      updateInterval.value = null
    }
  }
}

// Lifecycle
onMounted(async () => {
  await loadData()
  realTimeEnabled.value = true
  attachRealtimeListeners()
})

onUnmounted(() => {
  // Clean up chart instances
  Object.values(chartInstances.value).forEach(chart => {
    if (chart) chart.destroy()
  })
  
  // Clear interval
  if (updateInterval.value) {
    clearInterval(updateInterval.value)
  }
  if (unsubscribeBookings) unsubscribeBookings()
})
</script>

<style scoped>
.interactive-charts {
  padding: 1rem;
}

.charts-header {
  margin-bottom: 2rem;
  text-align: center;
}

.charts-header h3 {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.chart-controls {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.main-chart {
  grid-row: span 2;
}

.secondary-charts {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.chart-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chart-wrapper {
  position: relative;
  height: 400px;
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.chart-actions {
  display: flex;
  gap: 0.5rem;
}

.data-summary {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  height: 100%;
}

.summary-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.summary-content h4 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
}

.summary-content p {
  margin: 0;
  color: #6c757d;
  font-weight: 500;
}

.summary-content small {
  font-weight: 600;
}

.real-time-indicator {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
}

/* Responsive design */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .main-chart {
    grid-row: span 1;
  }
  
  .secondary-charts {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .secondary-charts {
    grid-template-columns: 1fr;
  }
  
  .summary-item {
    flex-direction: column;
    text-align: center;
  }
  
  .real-time-indicator {
    position: static;
    margin-top: 1rem;
  }
}

/* Chart.js customizations */
:deep(.chartjs-render-monitor) {
  border-radius: 8px;
}

/* Loading animation */
.fa-spin {
  animation: fa-spin 1s infinite linear;
}

@keyframes fa-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
