<template>
  <div class="navigation-panel">
    <div class="navigation-header">
      <h5>Navigation</h5>
      <div class="navigation-status" :class="navigationState">
        <i :class="getStatusIcon()"></i>
        {{ getStatusText() }}
      </div>
    </div>

    <div class="navigation-content">
      <!-- Route Input Section -->
      <div v-if="!isNavigating" class="route-input-section">
        <div class="input-group">
          <div class="input-field">
            <label>From</label>
            <div class="input-with-suggestions">
              <input
                v-model="origin"
                type="text"
                placeholder="Enter origin or use current location..."
                class="form-control"
                @focus="handleOriginFocus"
                @blur="handleOriginBlur"
              />
              
              <!-- Suggestions Dropdown for Origin -->
              <div v-if="showOriginSuggestions && suggestions.length > 0" class="suggestions-dropdown">
                <div
                  v-for="suggestion in suggestions"
                  :key="suggestion.id"
                  class="suggestion-item"
                  @click="selectSuggestion(suggestion)"
                >
                  <i class="fas fa-map-marker-alt"></i>
                  <div class="suggestion-text">
                    <div class="suggestion-name">{{ suggestion.name }}</div>
                    <div class="suggestion-address">{{ suggestion.address }}</div>
                  </div>
                </div>
              </div>
            </div>
            <button @click="useCurrentLocation" class="btn btn-sm btn-outline-primary current-location-btn">
              <i class="fas fa-crosshairs"></i>
              Use Current Location
            </button>
          </div>
          
          <div class="input-field">
            <label>To</label>
            <div class="input-with-suggestions">
              <input
                v-model="destination"
                type="text"
                placeholder="Enter destination..."
                class="form-control"
                @focus="handleDestinationFocus"
                @blur="handleDestinationBlur"
              />
              
              <!-- Suggestions Dropdown -->
              <div v-if="showDestinationSuggestions && suggestions.length > 0" class="suggestions-dropdown">
                <div
                  v-for="suggestion in suggestions"
                  :key="suggestion.id"
                  class="suggestion-item"
                  @click="selectSuggestion(suggestion)"
                >
                  <i class="fas fa-map-marker-alt"></i>
                  <div class="suggestion-text">
                    <div class="suggestion-name">{{ suggestion.name }}</div>
                    <div class="suggestion-address">{{ suggestion.address }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Transportation Mode -->
        <div class="transport-modes">
          <label>Transportation Mode:</label>
          <div class="mode-buttons">
            <button
              v-for="mode in transportModes"
              :key="mode.value"
              @click="selectedTransportMode = mode.value"
              class="mode-btn"
              :class="{ active: selectedTransportMode === mode.value }"
              :title="mode.description"
            >
              <i :class="mode.icon"></i>
              {{ mode.label }}
            </button>
          </div>
          <div class="selected-mode-info">
            <small class="text-muted">
              <i :class="transportModes.find(m => m.value === selectedTransportMode)?.icon"></i>
              {{ transportModes.find(m => m.value === selectedTransportMode)?.description }}
            </small>
          </div>
        </div>

        <!-- Route Options -->
        <div class="route-options">
          <div class="option-group">
            <!-- Driving options -->
            <template v-if="selectedTransportMode === 'driving'">
              <label class="checkbox-label">
                <input v-model="avoidHighways" type="checkbox">
                Avoid Highways
              </label>
              <label class="checkbox-label">
                <input v-model="avoidTolls" type="checkbox">
                Avoid Tolls
              </label>
            </template>
            
            <!-- Walking options -->
            <template v-if="selectedTransportMode === 'walking'">
              <label class="checkbox-label">
                <input v-model="avoidHighways" type="checkbox">
                Avoid Major Roads
              </label>
              <label class="checkbox-label">
                <input v-model="avoidTolls" type="checkbox">
                Prefer Footpaths
              </label>
            </template>
            
            <!-- Cycling options -->
            <template v-if="selectedTransportMode === 'cycling'">
              <label class="checkbox-label">
                <input v-model="avoidHighways" type="checkbox">
                Avoid Highways
              </label>
              <label class="checkbox-label">
                <input v-model="avoidTolls" type="checkbox">
                Prefer Bike Paths
              </label>
            </template>
            
            <!-- Public transport options -->
            <template v-if="['bus', 'train', 'tram', 'transit'].includes(selectedTransportMode)">
              <label class="checkbox-label">
                <input v-model="avoidHighways" type="checkbox">
                Avoid Transfers
              </label>
              <label class="checkbox-label">
                <input v-model="avoidTolls" type="checkbox">
                Fastest Route
              </label>
            </template>
          </div>
        </div>

            <!-- Search Button -->
            <button @click="searchRoute" class="btn btn-primary btn-lg search-route-btn" :disabled="!destination.trim()">
              <i class="fas fa-search"></i>
              Find Route
            </button>

        <!-- Map Click Hint -->
        <div class="map-click-hint">
          <i class="fas fa-map-marker-alt"></i>
          <span>Tip: Click anywhere on the map to set destination</span>
        </div>

        <!-- Route Summary (when route is found) -->
        <div v-if="routeResults && !isNavigating" class="route-summary">
          <div class="summary-header">
            <h6>Route Found</h6>
            <button @click="startNavigation" class="btn btn-success btn-sm">
              <i class="fas fa-play"></i>
              Start Navigation
            </button>
          </div>
          <div class="summary-details">
            <div class="summary-item">
              <i class="fas fa-route"></i>
              <span>{{ formatDistance(routeResults.distance) }}</span>
            </div>
            <div class="summary-item">
              <i class="fas fa-clock"></i>
              <span>{{ formatDuration(routeResults.duration) }}</span>
            </div>
            <div class="summary-item">
              <i class="fas fa-list"></i>
              <span>{{ routeResults.steps?.length || 0 }} steps</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Active Section -->
      <div v-else class="navigation-active">
        <!-- Current Step -->
        <div class="current-step">
          <div class="step-instruction">
            <h6>{{ currentStep?.maneuver?.instruction }}</h6>
            <p v-if="currentStep?.distance">{{ formatDistance(currentStep.distance) }}</p>
          </div>
          <div class="step-icon">
            <i :class="getStepIcon(currentStep?.maneuver?.type)"></i>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="progress-section">
          <div class="progress-info">
            <span>{{ formatDuration(remainingTime) }} remaining</span>
            <span>{{ formatDistance(remainingDistance) }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
        </div>

        <!-- Upcoming Steps -->
        <div class="upcoming-steps">
          <h6>Upcoming Steps</h6>
          <div class="steps-list">
            <div
              v-for="(step, index) in upcomingSteps"
              :key="index"
              class="step-item"
            >
              <div class="step-icon-small">
                <i :class="getStepIcon(step.maneuver?.type)"></i>
              </div>
              <div class="step-text">
                <p>{{ step.maneuver?.instruction }}</p>
                <small>{{ formatDistance(step.distance) }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Controls -->
        <div class="navigation-controls">
          <button @click="pauseNavigation" class="btn btn-outline-warning">
            <i class="fas fa-pause"></i>
            Pause
          </button>
          <button @click="stopNavigation" class="btn btn-outline-danger">
            <i class="fas fa-stop"></i>
            Stop
          </button>
          <button @click="repeatInstruction" class="btn btn-outline-info">
            <i class="fas fa-redo"></i>
            Repeat
          </button>
        </div>
      </div>

      <!-- Route Results -->
      <div v-if="routeResults && !isNavigating" class="route-results">
        <div class="route-summary">
          <h6>Route Found</h6>
          <div class="route-stats">
            <div class="stat">
              <i class="fas fa-route"></i>
              <span>{{ formatDistance(routeResults.distance) }}</span>
            </div>
            <div class="stat">
              <i class="fas fa-clock"></i>
              <span>{{ formatDuration(routeResults.duration) }}</span>
            </div>
          </div>
        </div>

        <div class="route-actions">
          <button @click="startNavigation" class="btn btn-success">
            <i class="fas fa-play"></i>
            Start Navigation
          </button>
          <button @click="showRouteOnMap" class="btn btn-outline-primary">
            <i class="fas fa-map"></i>
            Show on Map
          </button>
        </div>
      </div>
    </div>

    <!-- Suggestions Dropdown -->
    <div v-if="(showOriginSuggestions || showDestinationSuggestions) && suggestions.length > 0" class="suggestions-dropdown">
      <div
        v-for="suggestion in suggestions"
        :key="suggestion.id"
        class="suggestion-item"
        @click="selectSuggestion(suggestion)"
      >
        <i class="fas fa-map-marker-alt"></i>
        <div class="suggestion-text">
          <div class="suggestion-name">{{ suggestion.name }}</div>
          <div class="suggestion-address">{{ suggestion.address }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import { mapService } from '@/services/mapService'
import { geolocationService } from '@/services/geolocationService'
import { directionsService } from '@/services/directionsService'

// Reactive data
const origin = ref('')
const destination = ref('')
const selectedTransportMode = ref('driving')
const avoidHighways = ref(false)
const avoidTolls = ref(false)
const routeResults = ref(null)
const isNavigating = ref(false)
const navigationState = ref('idle')
const currentStep = ref(null)
const remainingTime = ref(0)
const remainingDistance = ref(0)
const progressPercentage = ref(0)
const upcomingSteps = ref([])
const showOriginSuggestions = ref(false)
const showDestinationSuggestions = ref(false)
const suggestions = ref([])

// Transport modes
const transportModes = [
  { value: 'driving', label: 'Drive', icon: 'fas fa-car', description: 'Private vehicle' },
  { value: 'walking', label: 'Walk', icon: 'fas fa-walking', description: 'Walking' },
  { value: 'cycling', label: 'Bike', icon: 'fas fa-bicycle', description: 'Bicycle' },
  { value: 'bus', label: 'Bus', icon: 'fas fa-bus', description: 'Public bus' },
  { value: 'train', label: 'Train', icon: 'fas fa-train', description: 'Rail transport' },
  { value: 'tram', label: 'Tram', icon: 'fas fa-tram', description: 'Light rail' },
  { value: 'transit', label: 'Public Transport', icon: 'fas fa-subway', description: 'Mixed public transport' }
]

// Computed properties
const routeSteps = computed(() => {
  return routeResults.value?.steps || []
})

// Watch for input changes to show suggestions
watch([origin, destination], async (newValues) => {
  const [newOrigin, newDestination] = newValues
  const query = showOriginSuggestions.value ? newOrigin : newDestination
  
  if (query && query.length > 2) {
    try {
      let results
      // Use specific university search for better results
      if (query.toLowerCase().includes('monash') || query.toLowerCase().includes('university')) {
        results = await mapService.searchUniversities(query, { limit: 5 })
      } else {
        results = await mapService.searchPlaces(query, { limit: 5 })
      }
      
      suggestions.value = results.map(place => ({
        id: place.id,
        name: place.name,
        address: place.name,
        coordinates: place.coordinates
      }))
    } catch (error) {
      console.error('Error getting suggestions:', error)
    }
  } else {
    suggestions.value = []
  }
})

// Initialize component
onMounted(async () => {
  try {
    // Try to get current location
    const location = await mapService.getCurrentLocation()
    origin.value = 'Current Location'
  } catch (error) {
    console.log('Could not get current location:', error.message)
  }
  
  // Listen for map click events to set destination
  window.addEventListener('setDestination', handleMapDestination)
  
  // Listen for program destination events
  window.addEventListener('setProgramDestination', handleProgramDestination)
})

// Cleanup when component unmounts
onUnmounted(() => {
  window.removeEventListener('setDestination', handleMapDestination)
  window.removeEventListener('setProgramDestination', handleProgramDestination)
})

// Handle destination selection from map click
const handleMapDestination = (event) => {
  const { name, coordinates } = event.detail
  destination.value = name
  
  // Clear any existing suggestions
  suggestions.value = []
  showDestinationSuggestions.value = false
  
  // Auto-search for directions if origin is already set
  if (origin.value.trim()) {
    console.log('Auto-searching for directions from map click...')
    setTimeout(() => {
      searchRoute()
    }, 100)
  }
}

// Handle destination selection from program
const handleProgramDestination = async (event) => {
  const { name, address, coordinates, program } = event.detail
  destination.value = address || name
  
  // Clear any existing suggestions
  suggestions.value = []
  showDestinationSuggestions.value = false
  
  // Ensure origin is set to current location
  if (!origin.value.trim()) {
    try {
      const location = await mapService.getCurrentLocation()
      origin.value = 'Current Location'
      console.log('Set origin to current location for program directions')
    } catch (error) {
      console.log('Could not get current location, using default')
      origin.value = 'Current Location'
    }
  }
  
  // Auto-search for directions
  console.log('Auto-searching for directions to program...')
  setTimeout(() => {
    searchRoute()
  }, 200)
}

// Use current location
const useCurrentLocation = async () => {
  try {
    const location = await mapService.getCurrentLocation()
    origin.value = 'Current Location'
    showOriginSuggestions.value = false
    
    // Update the mapService current location for better search results
    mapService.currentLocation = location
    
    console.log('Current location set for search proximity:', location)
    
    // Auto-search for directions if destination is already set
    if (destination.value.trim()) {
      console.log('Auto-searching for directions with current location...')
      setTimeout(() => {
        searchRoute()
      }, 100)
    }
  } catch (error) {
    alert('Could not get current location. Please enable location services.')
  }
}

// Search for route
const searchRoute = async () => {
  if (!destination.value.trim()) return

  try {
    // Always ensure we have current location for better search results
    if (!mapService.currentLocation) {
      try {
        const location = await mapService.getCurrentLocation()
        mapService.currentLocation = location
        console.log('Current location set for search:', location)
      } catch (error) {
        console.log('Could not get current location, using default Clayton location')
      }
    }

    // Get coordinates for origin and destination
    let originCoords, destCoords

    // Handle origin - if empty or "Current Location", use current location
    if (!origin.value.trim() || origin.value === 'Current Location') {
      const location = await mapService.getCurrentLocation()
      originCoords = { lat: location.lat, lng: location.lng }
      origin.value = 'Current Location' // Update the display
    } else {
      // Search for the origin location
      const originResults = await mapService.searchPlaces(origin.value, { limit: 1 })
      if (originResults.length === 0) {
        alert('Origin not found. Please try a different location.')
        return
      }
      // MapBox search results return coordinates as [longitude, latitude]
      originCoords = { lng: originResults[0].coordinates[0], lat: originResults[0].coordinates[1] }
    }

    // Use specific university search for better results
    let destResults
    if (destination.value.toLowerCase().includes('monash') || destination.value.toLowerCase().includes('university')) {
      destResults = await mapService.searchUniversities(destination.value, { limit: 1 })
    } else {
      destResults = await mapService.searchPlaces(destination.value, { limit: 1 })
    }
    
    if (destResults.length === 0) {
      alert('Destination not found. Please try a different location.')
      return
    }
    
    // MapBox search results return coordinates as [longitude, latitude]
    destCoords = { lng: destResults[0].coordinates[0], lat: destResults[0].coordinates[1] }
    
    console.log('Destination found:', destResults[0].name, 'at coordinates:', destCoords)

    // Get directions with selected transport mode
    const directions = await directionsService.getDirections(originCoords, destCoords, {
      profile: selectedTransportMode.value
    })
    routeResults.value = {
      ...directions,
      origin: originCoords,
      destination: destCoords,
      steps: directions.steps
    }

    // Automatically show route on map
    showRouteOnMap()

    // Automatically start navigation
    console.log('Starting navigation automatically...')
    startNavigation()

  } catch (error) {
    console.error('Error searching route:', error)
    alert('Error finding route. Please try again.')
  }
}

// Start navigation
const startNavigation = () => {
  if (!routeResults.value) return

  isNavigating.value = true
  navigationState.value = 'active'
  currentStep.value = routeResults.value.steps[0]
  remainingTime.value = routeResults.value.duration
  remainingDistance.value = routeResults.value.distance
  upcomingSteps.value = routeResults.value.steps.slice(1, 4) // Show next 3 steps

  // Start navigation simulation
  startNavigationSimulation()
}

// Start navigation simulation (in a real app, this would use GPS tracking)
const startNavigationSimulation = () => {
  const interval = setInterval(() => {
    if (!isNavigating.value) {
      clearInterval(interval)
      return
    }

    // Simulate progress
    const progressIncrement = 1 // 1% per second
    progressPercentage.value = Math.min(progressPercentage.value + progressIncrement, 100)

    // Update remaining time and distance
    const timeDecrement = remainingTime.value * 0.01 // 1% per second
    remainingTime.value = Math.max(remainingTime.value - timeDecrement, 0)

    const distanceDecrement = remainingDistance.value * 0.01 // 1% per second
    remainingDistance.value = Math.max(remainingDistance.value - distanceDecrement, 0)

    // Check if navigation is complete
    if (progressPercentage.value >= 100) {
      stopNavigation()
      alert('Navigation complete! You have reached your destination.')
    }
  }, 1000)
}

// Pause navigation
const pauseNavigation = () => {
  navigationState.value = 'paused'
  // In a real app, this would pause GPS tracking
}

// Stop navigation
const stopNavigation = () => {
  isNavigating.value = false
  navigationState.value = 'idle'
  navigationState.value = 'idle'
  currentStep.value = null
  remainingTime.value = 0
  remainingDistance.value = 0
  progressPercentage.value = 0
  upcomingSteps.value = []
}

// Repeat instruction
const repeatInstruction = () => {
  if (currentStep.value) {
    // In a real app, this would use text-to-speech
    alert(currentStep.value.maneuver.instruction)
  }
}

// Show route on map
const showRouteOnMap = () => {
  console.log('showRouteOnMap called')
  console.log('routeResults.value:', routeResults.value)
  console.log('mapService.map:', mapService.map)
  
  if (routeResults.value && routeResults.value.geometry) {
    console.log('Route geometry found:', routeResults.value.geometry)
    // Add route to map if mapService is available
    if (mapService.map) {
      console.log('Map is available, adding route...')
      // Use a small delay to ensure map is fully ready
      setTimeout(() => {
        addRouteToMap()
      }, 100)
    } else {
      console.log('Map is not available')
    }
  } else {
    console.log('No route results or geometry found')
  }
}

const addRouteToMap = () => {
  console.log('addRouteToMap called')
  console.log('mapService.map:', mapService.map)
  console.log('routeResults.value:', routeResults.value)

  if (!mapService.map || !routeResults.value || !routeResults.value.geometry) {
    console.log('Missing requirements for adding route to map')
    return
  }

  // Ensure map style is loaded before adding layers
  if (!mapService.map.isStyleLoaded()) {
    console.log('Map style not loaded, waiting for styleload event...')
    mapService.map.once('styleload', () => {
      console.log('Map style loaded, retrying route addition...')
      addRouteToMap()
    })
    return
  }

  try {
    console.log('Removing existing route layer...')
    // Remove existing route layer
    if (mapService.map.getLayer('navigation-route')) {
      mapService.map.removeLayer('navigation-route')
    }
    if (mapService.map.getSource('navigation-route')) {
      mapService.map.removeSource('navigation-route')
    }

    // Clear existing markers
    mapService.clearMarkers()

    console.log('Adding new route source...')
    // Add new route source
    mapService.map.addSource('navigation-route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: routeResults.value.geometry
      }
    })
    
    console.log('Adding new route layer...')
    // Add route layer with more visible styling
    mapService.map.addLayer({
      id: 'navigation-route',
      type: 'line',
      source: 'navigation-route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#ff0000',
        'line-width': 8,
        'line-opacity': 1.0
      }
    })
    
    console.log('Route layer added successfully')
    
    // Debug: Check if layer was actually added
    setTimeout(() => {
      if (mapService.map.getLayer('navigation-route')) {
        console.log('✅ Route layer confirmed on map')
      } else {
        console.log('❌ Route layer NOT found on map')
      }
      if (mapService.map.getSource('navigation-route')) {
        console.log('✅ Route source confirmed on map')
      } else {
        console.log('❌ Route source NOT found on map')
      }
    }, 500)
    
    // Add markers for origin and destination
    if (routeResults.value.origin) {
      console.log('Adding origin marker at:', routeResults.value.origin)
      mapService.addMarker([routeResults.value.origin.lng, routeResults.value.origin.lat], {
        color: '#00ff00', // Green for origin
        scale: 1.5
      })
    }
    
    if (routeResults.value.destination) {
      console.log('Adding destination marker at:', routeResults.value.destination)
      mapService.addMarker([routeResults.value.destination.lng, routeResults.value.destination.lat], {
        color: '#ff0000', // Red for destination
        scale: 1.5
      })
    }
    
    // Fit map to show the entire route
    if (routeResults.value.geometry.coordinates) {
      console.log('Fitting map to route bounds...')
      // Calculate bounds manually
      const coordinates = routeResults.value.geometry.coordinates
      let minLng = coordinates[0][0]
      let maxLng = coordinates[0][0]
      let minLat = coordinates[0][1]
      let maxLat = coordinates[0][1]

      coordinates.forEach(coord => {
        minLng = Math.min(minLng, coord[0])
        maxLng = Math.max(maxLng, coord[0])
        minLat = Math.min(minLat, coord[1])
        maxLat = Math.max(maxLat, coord[1])
      })

      console.log('Route bounds:', [[minLng, minLat], [maxLng, maxLat]])
      mapService.fitBounds([[minLng, minLat], [maxLng, maxLat]], {
        padding: 100,
        duration: 1000
      })
    }
  } catch (error) {
    console.error('Error adding route to map:', error)
    // Retry after a short delay
    setTimeout(() => {
      console.log('Retrying route addition...')
      addRouteToMap()
    }, 1000)
  }
}

// Handle input focus and blur events
const handleOriginFocus = () => {
  showOriginSuggestions.value = true
  showDestinationSuggestions.value = false
}

const handleOriginBlur = () => {
  setTimeout(() => {
    showOriginSuggestions.value = false
  }, 200)
}

const handleDestinationFocus = () => {
  showDestinationSuggestions.value = true
  showOriginSuggestions.value = false
}

const handleDestinationBlur = () => {
  setTimeout(() => {
    showDestinationSuggestions.value = false
  }, 200)
}

// Select suggestion
const selectSuggestion = (suggestion) => {
  console.log('Suggestion selected:', suggestion)
  if (showOriginSuggestions.value) {
    origin.value = suggestion.name
    showOriginSuggestions.value = false
  } else {
    destination.value = suggestion.name
    showDestinationSuggestions.value = false
    
    // Auto-search for directions if origin is already set
    if (origin.value.trim()) {
      console.log('Auto-searching for directions...')
      setTimeout(() => {
        searchRoute()
      }, 100)
    }
  }
}

// Watch for input changes to show suggestions
watch([origin, destination], async (newValues) => {
  const [newOrigin, newDestination] = newValues
  const query = showOriginSuggestions.value ? newOrigin : newDestination
  
  if (query && query.length > 2) {
    try {
      let results
      // Use specific university search for better results
      if (query.toLowerCase().includes('monash') || query.toLowerCase().includes('university')) {
        results = await mapService.searchUniversities(query, { limit: 5 })
      } else {
        results = await mapService.searchPlaces(query, { limit: 5 })
      }
      
      suggestions.value = results.map(place => ({
        id: place.id,
        name: place.name,
        address: place.name,
        coordinates: place.coordinates
      }))
    } catch (error) {
      console.error('Error getting suggestions:', error)
    }
  } else {
    suggestions.value = []
  }
})

// Get status icon
const getStatusIcon = () => {
  switch (navigationState.value) {
    case 'active': return 'fas fa-navigation'
    case 'paused': return 'fas fa-pause'
    default: return 'fas fa-map-marker-alt'
  }
}

// Get status text
const getStatusText = () => {
  switch (navigationState.value) {
    case 'active': return 'Navigating'
    case 'paused': return 'Paused'
    default: return 'Ready to Navigate'
  }
}

// Get step icon
const getStepIcon = (stepType) => {
  const icons = {
    turn: 'fas fa-arrow-right',
    'turn-left': 'fas fa-arrow-left',
    'turn-right': 'fas fa-arrow-right',
    'turn-sharp-left': 'fas fa-arrow-left',
    'turn-sharp-right': 'fas fa-arrow-right',
    'turn-slight-left': 'fas fa-arrow-left',
    'turn-slight-right': 'fas fa-arrow-right',
    straight: 'fas fa-arrow-up',
    arrive: 'fas fa-flag-checkered',
    depart: 'fas fa-play'
  }
  return icons[stepType] || 'fas fa-arrow-up'
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
.navigation-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.navigation-header {
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
}

.navigation-header h5 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.navigation-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.navigation-status.idle {
  color: #666;
}

.navigation-status.active {
  color: #28a745;
}

.navigation-status.paused {
  color: #ffc107;
}

.navigation-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.route-input-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-with-suggestions {
  position: relative;
}

.input-field label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
}

.input-field .form-control {
  flex: 1;
}

.input-field .btn {
  margin-left: 0.5rem;
}

.transport-modes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.transport-modes label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
}

.mode-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.mode-btn {
  flex: 1;
  padding: 0.75rem 0.5rem;
  border: 1px solid #dee2e6;
  background: white;
  color: #666;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
}

.mode-btn:hover {
  border-color: #007bff;
  color: #007bff;
}

.mode-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.selected-mode-info {
  margin-top: 0.5rem;
  text-align: center;
}

.selected-mode-info i {
  margin-right: 0.25rem;
}

.mode-btn i {
  font-size: 1rem;
}

.route-options {
  margin-top: 0.5rem;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #555;
  cursor: pointer;
}

.search-route-btn {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.navigation-active {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.current-step {
  background: #e3f2fd;
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-instruction h6 {
  margin: 0 0 0.5rem 0;
  color: #1976d2;
  font-size: 1.1rem;
}

.step-instruction p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.step-icon {
  font-size: 2rem;
  color: #1976d2;
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #666;
}

.progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #28a745;
  transition: width 0.3s ease;
}

.upcoming-steps h6 {
  margin-bottom: 1rem;
  color: #333;
  font-size: 1rem;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.step-icon-small {
  width: 24px;
  height: 24px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.step-text p {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  line-height: 1.3;
}

.step-text small {
  color: #666;
  font-size: 0.8rem;
}

.navigation-controls {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.navigation-controls .btn {
  flex: 1;
}

.route-results {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.route-summary h6 {
  margin-bottom: 1rem;
  color: #333;
}

.route-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.stat i {
  color: #007bff;
}

.route-actions {
  display: flex;
  gap: 0.75rem;
}

.route-actions .btn {
  flex: 1;
}

.route-summary {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.summary-header h6 {
  margin: 0;
  color: #333;
  font-weight: 600;
}

.summary-details {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.summary-item i {
  color: #007bff;
  width: 16px;
}

.map-click-hint {
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 6px;
  padding: 0.75rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1976d2;
  font-size: 0.9rem;
}

.map-click-hint i {
  color: #1976d2;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background: #f8f9fa;
}

.suggestion-item i {
  color: #007bff;
  font-size: 0.9rem;
}

.suggestion-text {
  flex: 1;
}

.suggestion-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

.suggestion-address {
  font-size: 0.8rem;
  color: #666;
}

@media (max-width: 768px) {
  .navigation-content {
    padding: 1rem;
  }
  
  .mode-buttons {
    flex-direction: column;
  }
  
  .mode-btn {
    flex-direction: row;
    justify-content: center;
  }
  
  .route-actions {
    flex-direction: column;
  }
  
  .navigation-controls {
    flex-direction: column;
  }
}
</style>
