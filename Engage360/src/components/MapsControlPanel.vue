<!-- MapsControlPanel.vue - Apple Maps/Google Maps-like control panel -->
<template>
  <div class="maps-control-panel">
    <!-- Map Style Controls -->
    <div class="control-section">
      <h6><i class="fas fa-palette"></i> Map Style</h6>
      <div class="style-buttons">
        <button 
          v-for="(style, key) in mapStyles" 
          :key="key"
          :class="['style-btn', { active: currentStyle === key }]"
          @click="setMapStyle(key)"
          :title="style.label"
        >
          <i :class="style.icon"></i>
          <span>{{ style.label }}</span>
        </button>
      </div>
    </div>

    <!-- Layer Controls -->
    <div class="control-section">
      <h6><i class="fas fa-layer-group"></i> Layers</h6>
      <div class="layer-controls">
        <button 
          :class="['layer-btn', { active: trafficEnabled }]"
          @click="toggleTraffic"
        >
          <i class="fas fa-car"></i>
          <span>Traffic</span>
        </button>
        <button 
          :class="['layer-btn', { active: satelliteEnabled }]"
          @click="toggleSatellite"
        >
          <i class="fas fa-satellite"></i>
          <span>Satellite</span>
        </button>
      </div>
    </div>

    <!-- Location Controls -->
    <div class="control-section">
      <h6><i class="fas fa-crosshairs"></i> Location</h6>
      <div class="location-controls">
        <button 
          class="location-btn"
          @click="getCurrentLocation"
          :disabled="loadingLocation"
        >
          <i :class="loadingLocation ? 'fas fa-spinner fa-spin' : 'fas fa-map-marker-alt'"></i>
          <span>{{ loadingLocation ? 'Getting...' : 'My Location' }}</span>
        </button>
        <button 
          :class="['location-btn', { active: isTrackingLocation }]"
          @click="toggleLocationTracking"
        >
          <i class="fas fa-location-arrow"></i>
          <span>{{ isTrackingLocation ? 'Stop Tracking' : 'Track Location' }}</span>
        </button>
      </div>
    </div>

    <!-- Search Controls -->
    <div class="control-section">
      <h6><i class="fas fa-search"></i> Search</h6>
      <div class="search-controls">
        <div class="search-input-group">
          <input 
            v-model="searchQuery"
            @keyup.enter="searchPlaces"
            placeholder="Search places..."
            class="search-input"
          />
          <button @click="searchPlaces" class="search-btn">
            <i class="fas fa-search"></i>
          </button>
        </div>
        <div class="search-categories">
          <button 
            v-for="category in searchCategories"
            :key="category.key"
            :class="['category-btn', { active: selectedCategory === category.key }]"
            @click="searchByCategory(category.key)"
          >
            <i :class="category.icon"></i>
            <span>{{ category.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Map Controls -->
    <div class="control-section">
      <h6><i class="fas fa-cog"></i> Map Controls</h6>
      <div class="map-controls">
        <button 
          class="control-btn"
          @click="toggleFullscreen"
          :title="isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'"
        >
          <i :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
        </button>
        <button 
          class="control-btn"
          @click="resetMapView"
          title="Reset View"
        >
          <i class="fas fa-home"></i>
        </button>
        <button 
          class="control-btn"
          @click="toggleMapControls"
          :title="showMapControls ? 'Hide Controls' : 'Show Controls'"
        >
          <i class="fas fa-eye"></i>
        </button>
      </div>
    </div>

    <!-- Search Results -->
    <div v-if="searchResults.length > 0" class="search-results">
      <h6><i class="fas fa-list"></i> Search Results ({{ searchResults.length }})</h6>
      <div class="results-list">
        <div 
          v-for="(result, index) in searchResults"
          :key="result.id"
          class="result-item"
          @click="selectSearchResult(result)"
        >
          <div class="result-icon">
            <i :class="getResultIcon(result.category)"></i>
          </div>
          <div class="result-content">
            <div class="result-name">{{ result.name }}</div>
            <div class="result-address">{{ result.address }}</div>
            <div v-if="result.distance" class="result-distance">
              {{ formatDistance(result.distance) }}
            </div>
          </div>
          <div class="result-actions">
            <button @click.stop="flyToResult(result)" class="action-btn" title="Fly to">
              <i class="fas fa-map-marker-alt"></i>
            </button>
            <button @click.stop="addMarkerToResult(result)" class="action-btn" title="Add Marker">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Current Location Info -->
    <div v-if="currentLocation" class="location-info">
      <h6><i class="fas fa-info-circle"></i> Current Location</h6>
      <div class="location-details">
        <div class="location-coords">
          <strong>Coordinates:</strong> 
          {{ currentLocation.lat.toFixed(6) }}, {{ currentLocation.lng.toFixed(6) }}
        </div>
        <div v-if="currentLocation.accuracy" class="location-accuracy">
          <strong>Accuracy:</strong> {{ Math.round(currentLocation.accuracy) }}m
        </div>
        <div v-if="currentLocation.heading" class="location-heading">
          <strong>Heading:</strong> {{ Math.round(currentLocation.heading) }}°
        </div>
        <div v-if="currentLocation.speed" class="location-speed">
          <strong>Speed:</strong> {{ Math.round(currentLocation.speed * 3.6) }} km/h
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { mapService } from '@/services/mapService'

// Reactive data
const currentStyle = ref('navigation')
const trafficEnabled = ref(false)
const satelliteEnabled = ref(false)
const isTrackingLocation = ref(false)
const loadingLocation = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')
const searchResults = ref([])
const currentLocation = ref(null)
const isFullscreen = ref(false)
const showMapControls = ref(true)

// Map styles configuration
const mapStyles = {
  navigation: { label: 'Navigation', icon: 'fas fa-route' },
  street: { label: 'Street', icon: 'fas fa-road' },
  satellite: { label: 'Satellite', icon: 'fas fa-satellite' },
  hybrid: { label: 'Hybrid', icon: 'fas fa-layer-group' },
  dark: { label: 'Dark', icon: 'fas fa-moon' },
  light: { label: 'Light', icon: 'fas fa-sun' },
  outdoors: { label: 'Outdoors', icon: 'fas fa-mountain' },
  navigation_night: { label: 'Night', icon: 'fas fa-moon' }
}

// Search categories
const searchCategories = [
  { key: 'restaurant', label: 'Restaurants', icon: 'fas fa-utensils' },
  { key: 'cafe', label: 'Cafés', icon: 'fas fa-coffee' },
  { key: 'gas', label: 'Gas Stations', icon: 'fas fa-gas-pump' },
  { key: 'hotel', label: 'Hotels', icon: 'fas fa-bed' },
  { key: 'shopping', label: 'Shopping', icon: 'fas fa-shopping-bag' },
  { key: 'hospital', label: 'Hospitals', icon: 'fas fa-hospital' },
  { key: 'park', label: 'Parks', icon: 'fas fa-tree' },
  { key: 'atm', label: 'ATMs', icon: 'fas fa-credit-card' }
]

// Computed properties
const isLocationTracking = computed(() => mapService.isTrackingLocation)

// Methods
const setMapStyle = (style) => {
  currentStyle.value = style
  mapService.setMapStyle(style)
}

const toggleTraffic = () => {
  trafficEnabled.value = !trafficEnabled.value
  mapService.toggleTraffic()
}

const toggleSatellite = () => {
  satelliteEnabled.value = !satelliteEnabled.value
  mapService.toggleSatellite()
}

const getCurrentLocation = async () => {
  loadingLocation.value = true
  try {
    const location = await mapService.getCurrentLocation()
    currentLocation.value = location
    
    // Fly to current location
    mapService.flyTo([location.lng, location.lat], { zoom: 16 })
    
    // Add marker for current location
    mapService.addCustomMarker([location.lng, location.lat], {
      color: '#007bff',
      size: 'large',
      popup: `
        <div class="current-location-popup">
          <h6><i class="fas fa-map-marker-alt"></i> Current Location</h6>
          <p><strong>Accuracy:</strong> ${Math.round(location.accuracy)}m</p>
          <p><strong>Time:</strong> ${new Date(location.timestamp).toLocaleTimeString()}</p>
        </div>
      `
    })
  } catch (error) {
    console.error('Error getting current location:', error)
  } finally {
    loadingLocation.value = false
  }
}

const toggleLocationTracking = () => {
  if (isTrackingLocation.value) {
    mapService.stopLocationTracking()
    isTrackingLocation.value = false
  } else {
    mapService.startLocationTracking((location) => {
      currentLocation.value = location
      // Update marker position if tracking
      mapService.clearMarkers()
      mapService.addCustomMarker([location.lng, location.lat], {
        color: '#28a745',
        size: 'large',
        popup: `
          <div class="tracking-location-popup">
            <h6><i class="fas fa-location-arrow"></i> Tracking Location</h6>
            <p><strong>Speed:</strong> ${Math.round(location.speed * 3.6)} km/h</p>
            <p><strong>Heading:</strong> ${Math.round(location.heading)}°</p>
            <p><strong>Accuracy:</strong> ${Math.round(location.accuracy)}m</p>
          </div>
        `
      })
    })
    isTrackingLocation.value = true
  }
}

const searchPlaces = async () => {
  if (!searchQuery.value.trim()) return
  
  try {
    const results = await mapService.searchPlaces(searchQuery.value, {
      limit: 10,
      types: 'poi,place,locality,neighborhood,address'
    })
    
    searchResults.value = results.map(result => ({
      ...result,
      distance: currentLocation.value ? 
        mapService.calculateDistance(
          [currentLocation.value.lng, currentLocation.value.lat],
          result.coordinates
        ) : null
    }))
  } catch (error) {
    console.error('Search error:', error)
  }
}

const searchByCategory = async (category) => {
  selectedCategory.value = category
  
  try {
    const results = await mapService.searchPlaces(category, {
      limit: 10,
      types: 'poi'
    })
    
    searchResults.value = results.map(result => ({
      ...result,
      distance: currentLocation.value ? 
        mapService.calculateDistance(
          [currentLocation.value.lng, currentLocation.value.lat],
          result.coordinates
        ) : null
    }))
  } catch (error) {
    console.error('Category search error:', error)
  }
}

const selectSearchResult = (result) => {
  mapService.flyTo(result.coordinates, { zoom: 16 })
  mapService.addCustomMarker(result.coordinates, {
    color: '#ffc107',
    popup: `
      <div class="search-result-popup">
        <h6><i class="fas fa-map-marker-alt"></i> ${result.name}</h6>
        <p>${result.address}</p>
        ${result.distance ? `<p><strong>Distance:</strong> ${formatDistance(result.distance)}</p>` : ''}
      </div>
    `
  })
}

const flyToResult = (result) => {
  mapService.flyTo(result.coordinates, { zoom: 16 })
}

const addMarkerToResult = (result) => {
  mapService.addCustomMarker(result.coordinates, {
    color: '#dc3545',
    popup: `
      <div class="marker-popup">
        <h6><i class="fas fa-map-pin"></i> ${result.name}</h6>
        <p>${result.address}</p>
      </div>
    `
  })
}

const getResultIcon = (category) => {
  const categoryMap = {
    restaurant: 'fas fa-utensils',
    cafe: 'fas fa-coffee',
    gas: 'fas fa-gas-pump',
    hotel: 'fas fa-bed',
    shopping: 'fas fa-shopping-bag',
    hospital: 'fas fa-hospital',
    park: 'fas fa-tree',
    atm: 'fas fa-credit-card',
    default: 'fas fa-map-marker-alt'
  }
  return categoryMap[category] || categoryMap.default
}

const formatDistance = (meters) => {
  return mapService.formatDistance(meters)
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

const resetMapView = () => {
  mapService.flyTo(mapService.config.center, { zoom: mapService.config.zoom })
}

const toggleMapControls = () => {
  showMapControls.value = !showMapControls.value
  // Toggle MapBox controls visibility
  const controls = document.querySelectorAll('.mapboxgl-ctrl')
  controls.forEach(control => {
    control.style.display = showMapControls.value ? 'block' : 'none'
  })
}

// Lifecycle
onMounted(() => {
  // Initialize map controls
  mapService.addNavigationControl()
  mapService.addGeolocateControl()
  mapService.addFullscreenControl()
  mapService.addScaleControl()
  
  // Listen for location updates
  if (mapService.currentLocation) {
    currentLocation.value = mapService.currentLocation
  }
})

onUnmounted(() => {
  mapService.stopLocationTracking()
})
</script>

<style scoped>
.maps-control-panel {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  max-height: 80vh;
  overflow-y: auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.control-section {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.control-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.control-section h6 {
  margin: 0 0 16px 0;
  color: #ffffff;
  font-weight: 700;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.control-section h6 i {
  color: #ffd700;
  width: 18px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.style-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.style-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #ffffff;
  backdrop-filter: blur(10px);
  font-weight: 500;
}

.style-btn:hover {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.style-btn.active {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #2c3e50;
  border-color: #ffd700;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
  font-weight: 600;
}

.layer-controls {
  display: flex;
  gap: 8px;
}

.layer-btn {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #ffffff;
  backdrop-filter: blur(10px);
  font-weight: 500;
}

.layer-btn:hover {
  border-color: #00d4aa;
  background: rgba(0, 212, 170, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 212, 170, 0.3);
}

.layer-btn.active {
  background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%);
  color: #ffffff;
  border-color: #00d4aa;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 212, 170, 0.4);
  font-weight: 600;
}

.location-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.location-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #ffffff;
  backdrop-filter: blur(10px);
  font-weight: 500;
}

.location-btn:hover {
  border-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.location-btn.active {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: #ffffff;
  border-color: #ff6b6b;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
  font-weight: 600;
}

.location-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.search-input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 14px;
  color: #ffffff;
  backdrop-filter: blur(10px);
  font-weight: 500;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.search-input:focus {
  outline: none;
  border-color: #ffd700;
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
}

.search-btn {
  padding: 12px 16px;
  border: 2px solid #ffd700;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #2c3e50;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.search-btn:hover {
  background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
}

.search-categories {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
  color: #ffffff;
  backdrop-filter: blur(10px);
  font-weight: 500;
}

.category-btn:hover {
  border-color: #a8e6cf;
  background: rgba(168, 230, 207, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(168, 230, 207, 0.3);
}

.category-btn.active {
  background: linear-gradient(135deg, #a8e6cf 0%, #88d8a3 100%);
  color: #2c3e50;
  border-color: #a8e6cf;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(168, 230, 207, 0.4);
  font-weight: 600;
}

.map-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #ffffff;
  backdrop-filter: blur(10px);
  font-weight: 500;
}

.control-btn:hover {
  border-color: #74b9ff;
  background: rgba(116, 185, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(116, 185, 255, 0.3);
}

.search-results {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.search-results h6 {
  color: #ffffff;
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.results-list {
  max-height: 300px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.result-item:hover {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.2);
}

.result-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #2c3e50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-name {
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 6px;
  font-size: 14px;
}

.result-address {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 4px;
}

.result-distance {
  font-size: 11px;
  color: #a8e6cf;
  font-weight: 600;
}

.result-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
  color: #ffffff;
  backdrop-filter: blur(10px);
}

.action-btn:hover {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(255, 215, 0, 0.3);
}

.location-info {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.location-info h6 {
  color: #ffffff;
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.location-details {
  background: rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 12px;
  font-size: 13px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.location-details > div {
  margin-bottom: 6px;
  color: #ffffff;
}

.location-details > div:last-child {
  margin-bottom: 0;
}

.location-details strong {
  color: #ffd700;
  font-weight: 600;
}

/* Responsive design */
@media (max-width: 768px) {
  .maps-control-panel {
    padding: 16px;
  }
  
  .style-buttons {
    grid-template-columns: 1fr;
  }
  
  .search-categories {
    grid-template-columns: 1fr;
  }
  
  .map-controls {
    flex-direction: column;
  }
}
</style>
