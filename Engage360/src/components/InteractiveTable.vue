<template>
  <div class="interactive-table">
    <div class="table-header mb-3">
      <div class="row align-items-center">
        <div class="col-md-6">
          <h5 class="mb-0">{{ title }}</h5>
        </div>
        <div class="col-md-6">
          <div class="d-flex gap-2 justify-content-end">
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              :placeholder="`Search ${searchableFields.join(', ')}...`"
              style="max-width: 300px;"
            />
            <select v-model="itemsPerPage" class="form-select" style="width: auto;">
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key"
              @click="sort(column.key)"
              :class="{ 'sortable': column.sortable !== false }"
              style="cursor: pointer; user-select: none;"
            >
              {{ column.label }}
              <span v-if="sortColumn === column.key" class="ms-1">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedData.length === 0">
            <td :colspan="columns.length" class="text-center text-muted py-4">
              No data found
            </td>
          </tr>
          <tr v-for="(item, index) in paginatedData" :key="index">
            <td v-for="column in columns" :key="column.key">
              <slot :name="column.key" :item="item" :value="getNestedValue(item, column.key)">
                {{ formatValue(getNestedValue(item, column.key), column) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="table-footer mt-3">
      <div class="row align-items-center">
        <div class="col-md-6">
          <p class="mb-0 text-muted">
            Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredData.length }} entries
          </p>
        </div>
        <div class="col-md-6">
          <nav aria-label="Table pagination">
            <ul class="pagination justify-content-end mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="goToPage(1)" :disabled="currentPage === 1">
                  First
                </button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
                  Previous
                </button>
              </li>
              
              <li 
                v-for="page in visiblePages" 
                :key="page"
                class="page-item" 
                :class="{ active: page === currentPage }"
              >
                <button class="page-link" @click="goToPage(page)">
                  {{ page }}
                </button>
              </li>
              
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
                  Next
                </button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="goToPage(totalPages)" :disabled="currentPage === totalPages">
                  Last
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  columns: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: 'Data Table'
  },
  searchableFields: {
    type: Array,
    default: () => []
  }
})

const searchQuery = ref('')
const sortColumn = ref('')
const sortDirection = ref('asc')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const filteredData = computed(() => {
  if (!searchQuery.value || !props.searchableFields.length) {
    return props.data
  }

  const query = searchQuery.value.toLowerCase()
  return props.data.filter(item => {
    return props.searchableFields.some(field => {
      const value = getNestedValue(item, field)
      return String(value).toLowerCase().includes(query)
    })
  })
})

const sortedData = computed(() => {
  if (!sortColumn.value) return filteredData.value

  return [...filteredData.value].sort((a, b) => {
    const aVal = getNestedValue(a, sortColumn.value)
    const bVal = getNestedValue(b, sortColumn.value)
    
    let comparison = 0
    if (aVal < bVal) comparison = -1
    if (aVal > bVal) comparison = 1
    
    return sortDirection.value === 'desc' ? -comparison : comparison
  })
})

const totalPages = computed(() => Math.ceil(sortedData.value.length / itemsPerPage.value))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return sortedData.value.slice(start, end)
})

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, sortedData.value.length))

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

function sort(column) {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
  currentPage.value = 1
}

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function formatValue(value, column) {
  if (value === null || value === undefined) return '-'
  
  if (column.formatter && typeof column.formatter === 'function') {
    return column.formatter(value)
  }
  
  if (column.type === 'date') {
    return new Date(value).toLocaleDateString()
  }
  
  if (column.type === 'currency') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
  }
  
  return value
}

// Reset to first page when search changes
watch(searchQuery, () => {
  currentPage.value = 1
})

watch(itemsPerPage, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.sortable:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.table-header {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1rem;
}

.table-footer {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
}

.page-link {
  border: 1px solid #dee2e6;
  color: #0d6efd;
}

.page-link:hover {
  background-color: #e9ecef;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.page-item.disabled .page-link {
  color: #6c757d;
  background-color: #fff;
  border-color: #dee2e6;
}
</style>
