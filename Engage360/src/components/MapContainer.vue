<template>
  <div class="map-container">
    <div class="map-header">
      <div class="search-controls">
        <div class="search-input-group">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search for places..."
            class="form-control search-input"
            @keyup.enter="searchPlaces"
          />
          <button @click="searchPlaces" class="btn btn-primary search-btn">
            <i class="fas fa-search"></i>
          </button>
        </div>
        
        <div class="location-controls">
          <button @click="getCurrentLocation" class="btn btn-outline-primary" :disabled="isLoading">
            <i class="fas fa-crosshairs"></i>
            My Location
          </button>
          <button @click="clearMap" class="btn btn-outline-secondary">
            <i class="fas fa-trash"></i>
            Clear
          </button>
        </div>
      </div>
    </div>

    <div class="map-wrapper">
      <div id="map" ref="mapContainer" class="map"></div>
      
      <!-- Search Results Panel -->
      <div v-if="searchResults.length > 0" class="search-results-panel">
        <div class="panel-header">
          <h6>Search Results</h6>
          <button @click="closeSearchResults" class="btn btn-sm btn-outline-secondary">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="search-results-list">
          <div
            v-for="place in searchResults"
            :key="place.id"
            class="search-result-item"
            @click="selectPlace(place)"
          >
            <div class="place-info">
              <h6 class="place-name">{{ place.name }}</h6>
              <p class="place-type">{{ place.type }}</p>
            </div>
            <div class="place-actions">
              <button @click.stop="getDirectionsToPlace(place)" class="btn btn-sm btn-primary">
                <i class="fas fa-directions"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Trip Information Panel -->
      <div v-if="tripInfo" class="trip-info-panel">
        <div class="panel-header">
          <h6>Trip Information</h6>
          <button @click="closeTripInfo" class="btn btn-sm btn-outline-secondary">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="trip-details">
          <div class="trip-stat">
            <i class="fas fa-route"></i>
            <span>Distance: {{ formatDistance(tripInfo.distance) }}</span>
          </div>
          <div class="trip-stat">
            <i class="fas fa-clock"></i>
            <span>Duration: {{ formatDuration(tripInfo.duration) }}</span>
          </div>
          <div v-if="tripInfo.steps" class="trip-steps">
            <h6>Directions:</h6>
            <div class="steps-list">
              <div
                v-for="(step, index) in tripInfo.steps"
                :key="index"
                class="step-item"
              >
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-instruction">{{ step.maneuver.instruction }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import mapboxgl from 'mapbox-gl'
import { mapService } from '@/services/mapService'
import { geolocationService } from '@/services/geolocationService'

// Reactive data
const mapContainer = ref(null)
const searchQuery = ref('')
const searchResults = ref([])
const tripInfo = ref(null)
const isLoading = ref(false)
const currentLocation = ref(null)

// Initialize map when component mounts
onMounted(async () => {
  try {
    isLoading.value = true
    await mapService.initialize()
    await nextTick()
    
    if (mapContainer.value) {
      // Ensure the map container is empty before creating the map
      mapContainer.value.innerHTML = ''
      
      // Create map using the container element directly
      const map = mapService.createMap(mapContainer.value, {
        center: [144.9631, -37.8136], // Melbourne, Australia
        zoom: 10
      })
      
      // Add click listener for map
      mapService.map.on('click', handleMapClick)
      
      // Try to get user's current location
      try {
        const location = await mapService.getCurrentLocation()
        currentLocation.value = location
        mapService.flyTo([location.lng, location.lat])
      } catch (error) {
        console.log('Could not get current location:', error.message)
      }
    }
  } catch (error) {
    console.error('Error initializing map:', error)
  } finally {
    isLoading.value = false
  }
})

// Cleanup when component unmounts
onUnmounted(() => {
  mapService.destroy()
})

// Search for places
const searchPlaces = async () => {
  if (!searchQuery.value.trim()) return
  
  try {
    isLoading.value = true
    const results = await mapService.searchPlaces(searchQuery.value)
    searchResults.value = results
    
    // Add markers for search results
    mapService.clearMarkers()
    results.forEach(place => {
      mapService.addMarker(place.coordinates, {
        color: '#007bff'
      })
    })
    
    // Fit map to show all results
    if (results.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      results.forEach(place => {
        bounds.extend(place.coordinates)
      })
      mapService.fitBounds(bounds.toArray())
    }
  } catch (error) {
    console.error('Error searching places:', error)
  } finally {
    isLoading.value = false
  }
}

// Get current location
const getCurrentLocation = async () => {
  try {
    isLoading.value = true
    const location = await mapService.getCurrentLocation()
    currentLocation.value = location
    mapService.flyTo([location.lng, location.lat], { zoom: 15 })
    
    // Add marker for current location
    mapService.addMarker([location.lng, location.lat], {
      color: '#28a745'
    })
  } catch (error) {
    console.error('Error getting current location:', error)
  } finally {
    isLoading.value = false
  }
}

// Select a place from search results
const selectPlace = (place) => {
  mapService.flyTo(place.coordinates, { zoom: 15 })
  mapService.addMarker(place.coordinates, {
    color: '#dc3545'
  })
}

// Get directions to a place
const getDirectionsToPlace = async (place) => {
  if (!currentLocation.value) {
    alert('Please get your current location first')
    return
  }
  
  try {
    isLoading.value = true
    const directions = await mapService.getDirections(
      { lat: currentLocation.value.lat, lng: currentLocation.value.lng },
      { lat: place.coordinates[1], lng: place.coordinates[0] }
    )
    
    tripInfo.value = directions
    
    // Add route to map
    if (mapService.map.getSource('route')) {
      mapService.map.removeLayer('route')
      mapService.map.removeSource('route')
    }
    
    mapService.map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: directions.geometry
      }
    })
    
    mapService.map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#007bff',
        'line-width': 3
      }
    })
  } catch (error) {
    console.error('Error getting directions:', error)
  } finally {
    isLoading.value = false
  }
}

// Handle map clicks
const handleMapClick = (e) => {
  const coordinates = [e.lngLat.lng, e.lngLat.lat]
  mapService.addMarker(coordinates, {
    color: '#ffc107'
  })
}

// Clear map
const clearMap = () => {
  mapService.clearMarkers()
  searchResults.value = []
  tripInfo.value = null
  
  // Remove route layer
  if (mapService.map.getLayer('route')) {
    mapService.map.removeLayer('route')
    mapService.map.removeSource('route')
  }
}

// Close search results
const closeSearchResults = () => {
  searchResults.value = []
}

// Close trip info
const closeTripInfo = () => {
  tripInfo.value = null
  if (mapService.map.getLayer('route')) {
    mapService.map.removeLayer('route')
    mapService.map.removeSource('route')
  }
}

// Utility functions
const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

const formatDuration = (seconds) => {
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}
</script>

<style scoped>
.map-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.map-header {
  background: white;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-input-group {
  display: flex;
  flex: 1;
  min-width: 300px;
}

.search-input {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.search-btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.location-controls {
  display: flex;
  gap: 0.5rem;
}

.map-wrapper {
  flex: 1;
  position: relative;
}

.map {
  width: 100%;
  height: 100%;
}

.search-results-panel,
.trip-info-panel {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 350px;
  max-height: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
}

.panel-header h6 {
  margin: 0;
  font-weight: 600;
}

.search-results-list,
.trip-details {
  max-height: 300px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f1f3f4;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: #f8f9fa;
}

.place-info {
  flex: 1;
}

.place-name {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.place-type {
  margin: 0;
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: capitalize;
}

.trip-details {
  padding: 1rem;
}

.trip-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.trip-stat i {
  width: 16px;
  color: #007bff;
}

.trip-steps {
  margin-top: 1rem;
}

.trip-steps h6 {
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.steps-list {
  max-height: 200px;
  overflow-y: auto;
}

.step-item {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f3f4;
}

.step-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.step-number {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
}

.step-instruction {
  flex: 1;
  font-size: 0.85rem;
  line-height: 1.4;
}

.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2000;
}

@media (max-width: 768px) {
  .search-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input-group {
    min-width: auto;
  }
  
  .location-controls {
    justify-content: center;
  }
  
  .search-results-panel,
  .trip-info-panel {
    width: calc(100% - 2rem);
    right: 1rem;
    left: 1rem;
  }
}
</style>
