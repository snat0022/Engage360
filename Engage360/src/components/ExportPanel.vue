<template>
  <div class="export-panel">
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="bi bi-download me-2"></i>
          Data Export
        </h5>
      </div>
      <div class="card-body">
        <!-- Export Configuration -->
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <label for="dataType" class="form-label">Data Type</label>
            <select id="dataType" v-model="exportConfig.dataType" class="form-select" @change="updatePreview">
              <option value="users">Users</option>
              <option value="registrations">Program Registrations</option>
              <option value="programs">Programs</option>
              <option value="admin-activity">Admin Activity Log</option>
            </select>
          </div>
          
          <div class="col-md-4">
            <label for="exportFormat" class="form-label">Export Format</label>
            <select id="exportFormat" v-model="exportConfig.format" class="form-select">
              <option value="csv">CSV (Comma Separated Values)</option>
              <option value="excel">Excel Spreadsheet</option>
              <option value="pdf">PDF Document</option>
              <option value="json">JSON (JavaScript Object Notation)</option>
            </select>
          </div>
          
          <div class="col-md-4">
            <label for="recordLimit" class="form-label">Record Limit</label>
            <select id="recordLimit" v-model="exportConfig.limit" class="form-select">
              <option value="0">All Records</option>
              <option value="100">100 Records</option>
              <option value="500">500 Records</option>
              <option value="1000">1,000 Records</option>
              <option value="5000">5,000 Records</option>
            </select>
          </div>
        </div>

        <!-- Filters Section -->
        <div class="card mb-4">
          <div class="card-header">
            <h6 class="mb-0">
              <button 
                class="btn btn-link p-0 text-decoration-none" 
                @click="showFilters = !showFilters"
                :aria-expanded="showFilters"
                aria-controls="filtersCollapse"
              >
                <i :class="showFilters ? 'bi bi-chevron-down' : 'bi bi-chevron-right'"></i>
                Advanced Filters
              </button>
            </h6>
          </div>
          <div v-show="showFilters" id="filtersCollapse" class="card-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label for="dateFrom" class="form-label">Date From</label>
                <input 
                  type="date" 
                  id="dateFrom" 
                  v-model="filters.dateFrom" 
                  class="form-control"
                  @change="updatePreview"
                >
              </div>
              
              <div class="col-md-6">
                <label for="dateTo" class="form-label">Date To</label>
                <input 
                  type="date" 
                  id="dateTo" 
                  v-model="filters.dateTo" 
                  class="form-control"
                  @change="updatePreview"
                >
              </div>
              
              <div class="col-md-6">
                <label for="searchFilter" class="form-label">Search Term</label>
                <input 
                  type="text" 
                  id="searchFilter" 
                  v-model="filters.search" 
                  class="form-control"
                  placeholder="Search in all fields..."
                  @input="updatePreview"
                >
              </div>
              
              <div class="col-md-6" v-if="exportConfig.dataType === 'users'">
                <label for="statusFilter" class="form-label">Status</label>
                <select id="statusFilter" v-model="filters.status" class="form-select" @change="updatePreview">
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="verified">Email Verified</option>
                  <option value="unverified">Email Unverified</option>
                </select>
              </div>
              
              <div class="col-md-6" v-if="exportConfig.dataType === 'users'">
                <label for="roleFilter" class="form-label">Role</label>
                <select id="roleFilter" v-model="filters.role" class="form-select" @change="updatePreview">
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
            </div>
            
            <div class="mt-3">
              <button class="btn btn-outline-secondary btn-sm" @click="clearFilters">
                <i class="bi bi-x-circle me-1"></i>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Preview Section -->
        <div v-if="previewData.length > 0" class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">Preview ({{ previewData.length }} records)</h6>
            <small class="text-muted">Estimated file size: {{ estimatedSize }}</small>
          </div>
          <div class="card-body">
            <div class="table-responsive" style="max-height: 300px;">
              <table class="table table-sm table-striped">
                <thead class="table-dark sticky-top">
                  <tr>
                    <th v-for="header in previewHeaders" :key="header">{{ header }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(record, index) in previewData.slice(0, 10)" :key="index">
                    <td v-for="header in previewHeaders" :key="header">
                      {{ getFieldValue(record, header) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="previewData.length > 10" class="text-center mt-2">
              <small class="text-muted">Showing first 10 of {{ previewData.length }} records</small>
            </div>
          </div>
        </div>

        <!-- Export Actions -->
        <div class="d-flex gap-2 flex-wrap">
          <button 
            class="btn btn-primary" 
            @click="exportData"
            :disabled="exporting || previewData.length === 0"
          >
            <span v-if="exporting" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-download me-1"></i>
            {{ exporting ? 'Exporting...' : 'Export Data' }}
          </button>
          
          <button 
            class="btn btn-outline-primary" 
            @click="updatePreview"
            :disabled="updatingPreview"
          >
            <span v-if="updatingPreview" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-arrow-clockwise me-1"></i>
            Refresh Preview
          </button>
          
          <button 
            class="btn btn-outline-info" 
            @click="showExportHistory = !showExportHistory"
          >
            <i class="bi bi-clock-history me-1"></i>
            Export History
          </button>
        </div>

        <!-- Export History -->
        <div v-if="showExportHistory" class="mt-4">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">Recent Exports</h6>
            </div>
            <div class="card-body">
              <div v-if="exportHistory.length === 0" class="text-center py-3">
                <p class="text-muted mb-0">No recent exports</p>
              </div>
              <div v-else class="list-group list-group-flush">
                <div 
                  v-for="exportRecord in exportHistory" 
                  :key="exportRecord.id"
                  class="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>{{ exportRecord.dataType }}</strong> - {{ exportRecord.format.toUpperCase() }}
                    <br>
                    <small class="text-muted">
                      {{ exportRecord.recordCount }} records • {{ exportRecord.timestamp }}
                    </small>
                  </div>
                  <div class="btn-group btn-group-sm">
                    <button 
                      class="btn btn-outline-primary" 
                      @click="downloadExport(exportRecord)"
                      :disabled="!exportRecord.downloadUrl"
                    >
                      <i class="bi bi-download"></i>
                    </button>
                    <button 
                      class="btn btn-outline-danger" 
                      @click="removeExportHistory(exportRecord.id)"
                    >
                      <i class="bi bi-trash"></i>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { exportService } from '@/services/exportService'

// Reactive data
const exportConfig = ref({
  dataType: 'users',
  format: 'csv',
  limit: 0
})

const filters = ref({
  dateFrom: '',
  dateTo: '',
  search: '',
  status: '',
  role: ''
})

const previewData = ref([])
const previewHeaders = ref([])
const showFilters = ref(false)
const showExportHistory = ref(false)
const exporting = ref(false)
const updatingPreview = ref(false)
const exportHistory = ref([])

// Computed properties
const estimatedSize = computed(() => {
  if (previewData.value.length === 0) return '0 KB'
  const stats = exportService.getExportStats(previewData.value)
  const size = stats.estimatedFileSize[exportConfig.value.format]
  return size < 1024 ? `${size} B` : `${Math.round(size / 1024)} KB`
})

// Methods
async function updatePreview() {
  updatingPreview.value = true
  try {
    const data = await exportService.exportData(exportConfig.value.dataType, 'json', filters.value)
    const parsedData = JSON.parse(await data.text())
    previewData.value = parsedData.data || []
    previewHeaders.value = exportService.getHeaders(exportConfig.value.dataType)
  } catch (error) {
    console.error('Error updating preview:', error)
    previewData.value = []
  } finally {
    updatingPreview.value = false
  }
}

async function exportData() {
  exporting.value = true
  try {
    // Validate parameters
    exportService.validateExportParams(exportConfig.value.dataType, exportConfig.value.format, filters.value)
    
    // Generate export
    const blob = await exportService.exportData(exportConfig.value.dataType, exportConfig.value.format, filters.value)
    
    // Create filename
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `${exportConfig.value.dataType}-export-${timestamp}.${exportConfig.value.format}`
    
    // Download file
    exportService.downloadFile(blob, filename)
    
    // Add to history
    addToExportHistory({
      dataType: exportConfig.value.dataType,
      format: exportConfig.value.format,
      recordCount: previewData.value.length,
      timestamp: new Date().toLocaleString(),
      filename
    })
    
    // Announce success
    if (window.accessibilityService) {
      window.accessibilityService.announce(`Export completed. ${previewData.value.length} records exported as ${exportConfig.value.format.toUpperCase()}`)
    }
    
  } catch (error) {
    console.error('Export error:', error)
    alert(`Export failed: ${error.message}`)
  } finally {
    exporting.value = false
  }
}

function clearFilters() {
  filters.value = {
    dateFrom: '',
    dateTo: '',
    search: '',
    status: '',
    role: ''
  }
  updatePreview()
}

function getFieldValue(record, header) {
  return exportService.getFieldValue(record, header)
}

function addToExportHistory(exportInfo) {
  const exportRecord = {
    id: Date.now(),
    ...exportInfo
  }
  
  exportHistory.value.unshift(exportRecord)
  
  // Keep only last 10 exports
  if (exportHistory.value.length > 10) {
    exportHistory.value = exportHistory.value.slice(0, 10)
  }
  
  // Save to localStorage
  localStorage.setItem('exportHistory', JSON.stringify(exportHistory.value))
}

function removeExportHistory(exportId) {
  exportHistory.value = exportHistory.value.filter(exp => exp.id !== exportId)
  localStorage.setItem('exportHistory', JSON.stringify(exportHistory.value))
}

function downloadExport(exportRecord) {
  // This would typically re-download the file
  // For now, we'll just show a message
  alert(`Downloading ${exportRecord.filename}`)
}

// Lifecycle
onMounted(() => {
  // Load export history
  const savedHistory = localStorage.getItem('exportHistory')
  if (savedHistory) {
    try {
      exportHistory.value = JSON.parse(savedHistory)
    } catch (error) {
      console.error('Error loading export history:', error)
    }
  }
  
  // Initial preview
  updatePreview()
})
</script>

<style scoped>
.export-panel {
  max-width: 100%;
}

.card-header h6 button {
  font-size: inherit;
  font-weight: inherit;
}

.table-responsive {
  border-radius: 0.375rem;
}

.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
}

.list-group-item {
  border-left: none;
  border-right: none;
}

.list-group-item:first-child {
  border-top: none;
}

.list-group-item:last-child {
  border-bottom: none;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .d-flex.gap-2 {
    flex-direction: column;
  }
  
  .d-flex.gap-2 .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>
