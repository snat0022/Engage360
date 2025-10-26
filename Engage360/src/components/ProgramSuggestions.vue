<template>
  <div class="program-suggestions">
    <div class="suggestions-header">
      <h6>
        <i class="fas fa-map-marker-alt"></i>
        Nearby Programs
      </h6>
      <button @click="toggleSuggestions" class="btn btn-sm btn-outline-primary">
        <i :class="showSuggestions ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
      </button>
    </div>

    <div v-if="showSuggestions" class="suggestions-content">
      <!-- Filters -->
      <div class="suggestion-filters">
        <div class="filter-group">
          <label>Category:</label>
          <select v-model="selectedCategory" @change="filterPrograms" class="form-select form-select-sm">
            <option value="">All Categories</option>
            <option value="basketball">Basketball</option>
            <option value="soccer">Soccer</option>
            <option value="swimming">Swimming</option>
            <option value="tennis">Tennis</option>
            <option value="volleyball">Volleyball</option>
            <option value="fitness">Fitness</option>
            <option value="walking">Walking</option>
            <option value="yoga">Yoga</option>
            <option value="dancing">Dancing</option>
            <option value="cycling">Cycling</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Level:</label>
          <select v-model="selectedLevel" @change="filterPrograms" class="form-select form-select-sm">
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="All Levels">All Levels</option>
          </select>
        </div>
      </div>

      <!-- Program List -->
      <div class="programs-list">
        <div
          v-for="program in filteredPrograms"
          :key="program.id"
          class="program-item"
          @click="getDirectionsToProgram(program)"
        >
          <div class="program-info">
            <div class="program-name">{{ program.name }}</div>
            <div class="program-details">
              <span class="program-level">{{ program.level }}</span>
              <span class="program-distance">{{ formatDistance(program.distance) }}</span>
            </div>
            <div class="program-schedule">{{ program.schedule }}</div>
            <div class="program-price">{{ program.price }}</div>
          </div>
          <div class="program-actions">
            <button @click="getDirectionsToProgram(program)" class="btn btn-sm btn-primary" :disabled="loadingDirections">
              <i v-if="!loadingDirections" class="fas fa-route"></i>
              <i v-else class="fas fa-spinner fa-spin"></i>
              {{ loadingDirections ? 'Getting Directions...' : 'Directions' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredPrograms.length === 0" class="no-programs">
        <p class="text-muted">No programs found matching your criteria.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import mapboxgl from 'mapbox-gl'
import { programService } from '@/services/programService'
import { mapService } from '@/services/mapService'

// Reactive data
const showSuggestions = ref(true)
const selectedCategory = ref('')
const selectedLevel = ref('')
const nearbyPrograms = ref([])
const userLocation = ref(null)
const loadingDirections = ref(false)

// Computed properties
const filteredPrograms = computed(() => {
  let programs = nearbyPrograms.value

  if (selectedCategory.value) {
    programs = programs.filter(p => p.category === selectedCategory.value)
  }

  if (selectedLevel.value) {
    programs = programs.filter(p => p.level === selectedLevel.value || p.level === 'All Levels')
  }

  return programs.slice(0, 5) // Show top 5 results
})

// Methods
const toggleSuggestions = () => {
  showSuggestions.value = !showSuggestions.value
}

const filterPrograms = () => {
  // Filtering is handled by computed property
}

const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  }
  return `${distance.toFixed(1)}km`
}

const getDirectionsToProgram = async (program) => {
  try {
    loadingDirections.value = true
    console.log('Getting directions to program:', program.name)
    
    if (!userLocation.value) {
      userLocation.value = await mapService.getCurrentLocation()
    }

    const directionsData = programService.getDirectionsToProgram(program.id, userLocation.value)
    
    console.log('Program directions data:', directionsData)
    
    // Emit event to NavigationPanel to set destination
    const event = new CustomEvent('setProgramDestination', {
      detail: {
        name: directionsData.destination.name,
        address: directionsData.destination.address,
        coordinates: directionsData.destination.coordinates,
        program: program
      }
    })
    window.dispatchEvent(event)

    // Add marker for the program location
    mapService.addMarker(directionsData.destination.coordinates, {
      color: '#28a745',
      scale: 1.2
    })

    // Show popup with program info
    if (mapService.map && window.mapboxgl) {
      const popup = new window.mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false
      })
        .setLngLat(directionsData.destination.coordinates)
        .setHTML(`
          <div class="program-popup">
            <h6>${program.name}</h6>
            <p><strong>Level:</strong> ${program.level}</p>
            <p><strong>Schedule:</strong> ${program.schedule}</p>
            <p><strong>Price:</strong> ${program.price}</p>
            <p><strong>Location:</strong> ${program.location.name}</p>
            <button onclick="navigateToProgram()" class="btn btn-success btn-sm">
              <i class="fas fa-route"></i> Get Directions
            </button>
          </div>
        `)
        .addTo(mapService.map)
      
      // Store popup reference
      mapService.currentProgramPopup = popup
    }

    console.log('Program destination event dispatched successfully')

  } catch (error) {
    console.error('Error getting directions to program:', error)
    alert('Error getting directions to program. Please try again.')
  } finally {
    loadingDirections.value = false
  }
}

const loadNearbyPrograms = async () => {
  try {
    if (!userLocation.value) {
      userLocation.value = await mapService.getCurrentLocation()
    }

    nearbyPrograms.value = programService.getNearbyPrograms(userLocation.value, 10)
  } catch (error) {
    console.error('Error loading nearby programs:', error)
    // Use default Clayton location
    userLocation.value = { lat: -37.91553, lng: 145.12189 }
    nearbyPrograms.value = programService.getNearbyPrograms(userLocation.value, 10)
  }
}

// Global function for popup navigation
window.navigateToProgram = () => {
  const event = new CustomEvent('setProgramDestination', {
    detail: {
      name: 'Program Location',
      address: 'Program Location',
      coordinates: [145.12189, -37.91553]
    }
  })
  window.dispatchEvent(event)
  
  if (mapService.currentProgramPopup) {
    mapService.currentProgramPopup.remove()
    mapService.currentProgramPopup = null
  }
}

// Lifecycle
onMounted(() => {
  loadNearbyPrograms()
})

// Watch for location changes
watch(() => mapService.currentLocation, (newLocation) => {
  if (newLocation) {
    userLocation.value = newLocation
    loadNearbyPrograms()
  }
})
</script>

<style scoped>
.program-suggestions {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.suggestions-header h6 {
  margin: 0;
  color: #333;
  font-weight: 600;
}

.suggestions-header i {
  margin-right: 0.5rem;
  color: #007bff;
}

.suggestions-content {
  padding: 1rem;
}

.suggestion-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 120px;
}

.filter-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: #333;
}

.programs-list {
  max-height: 400px;
  overflow-y: auto;
}

.program-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.program-item:hover {
  background: #f8f9fa;
  border-color: #007bff;
}

.program-info {
  flex: 1;
}

.program-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.program-details {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.25rem;
}

.program-level {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.program-distance {
  color: #666;
  font-size: 0.875rem;
}

.program-schedule {
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.program-price {
  color: #28a745;
  font-weight: 600;
  font-size: 0.875rem;
}

.program-actions {
  margin-left: 1rem;
}

.no-programs {
  text-align: center;
  padding: 2rem;
}

.program-popup {
  padding: 0.5rem;
}

.program-popup h6 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-weight: 600;
}

.program-popup p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #666;
}

.program-popup .btn {
  width: 100%;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .suggestion-filters {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .program-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .program-actions {
    margin-left: 0;
    width: 100%;
  }
  
  .program-actions .btn {
    width: 100%;
  }
}
</style>
