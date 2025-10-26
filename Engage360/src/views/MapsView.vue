<template>
  <div class="maps-view">
    <!-- Skip Links for Maps -->
    <a href="#main-map" class="skip-link">Skip to map</a>
    <a href="#map-controls" class="skip-link">Skip to map controls</a>
    
    <div class="maps-header">
      <h1>Interactive Maps & Navigation</h1>
      <p class="lead">Explore places, plan trips, and navigate with ease</p>
    </div>

    <div class="maps-content">
      <div class="maps-sidebar">
        <div class="sidebar-content">
          <!-- Map Feature Tabs -->
          <div class="map-tabs" role="tablist" aria-label="Map feature tabs">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              class="tab-btn"
              :class="{ active: activeTab === tab.id }"
              :aria-selected="activeTab === tab.id"
              :aria-controls="`tab-${tab.id}`"
              role="tab"
              :tabindex="activeTab === tab.id ? 0 : -1"
            >
              <i :class="tab.icon" aria-hidden="true"></i>
              {{ tab.name }}
            </button>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">
                <!-- Maps Control Panel -->
                <div v-if="activeTab === 'controls'" class="controls-section" :id="`tab-${activeTab}`" role="tabpanel" :aria-labelledby="`tab-${activeTab}`">
                  <MapsControlPanel />
                </div>

                <!-- Navigation Panel -->
                <div v-if="activeTab === 'navigation'" class="navigation-section" :id="`tab-${activeTab}`" role="tabpanel" :aria-labelledby="`tab-${activeTab}`">
                  <NavigationPanel />
                </div>

                <!-- Program Suggestions -->
                <div v-if="activeTab === 'programs'" class="programs-section" :id="`tab-${activeTab}`" role="tabpanel" :aria-labelledby="`tab-${activeTab}`">
                  <ProgramSuggestions />
                </div>

                <!-- Places of Interest -->
                <div v-if="activeTab === 'places'" class="places-section" :id="`tab-${activeTab}`" role="tabpanel" :aria-labelledby="`tab-${activeTab}`">
                  <PlacesOfInterest />
                </div>

                <!-- Trip Planner -->
                <div v-if="activeTab === 'trips'" class="trips-section" :id="`tab-${activeTab}`" role="tabpanel" :aria-labelledby="`tab-${activeTab}`">
                  <TripPlanner />
                </div>
          </div>
        </div>
      </div>

      <div class="maps-main">
        <div id="main-map" ref="mainMapContainer" class="main-map" role="img" aria-label="Interactive map showing locations and routes" tabindex="0"></div>
        
        <!-- Map Controls Overlay -->
        <div class="map-controls" id="map-controls" role="toolbar" aria-label="Map controls">
          <div class="control-group">
            <button @click="toggleLayer('satellite')" class="control-btn" :class="{ active: currentLayer === 'satellite' }" aria-pressed="currentLayer === 'satellite'" aria-label="Switch to satellite view">
              <i class="fas fa-satellite" aria-hidden="true"></i>
              Satellite
            </button>
            <button @click="toggleLayer('streets')" class="control-btn" :class="{ active: currentLayer === 'streets' }" aria-pressed="currentLayer === 'streets'" aria-label="Switch to street view">
              <i class="fas fa-road" aria-hidden="true"></i>
              Streets
            </button>
            <button @click="toggleLayer('terrain')" class="control-btn" :class="{ active: currentLayer === 'terrain' }" aria-pressed="currentLayer === 'terrain'" aria-label="Switch to terrain view">
              <i class="fas fa-mountain" aria-hidden="true"></i>
              Terrain
            </button>
          </div>
          
          <div class="control-group">
            <button @click="toggleTraffic" class="control-btn" :class="{ active: showTraffic }" aria-pressed="showTraffic" aria-label="Toggle traffic layer">
              <i class="fas fa-car" aria-hidden="true"></i>
              Traffic
            </button>
            <button @click="toggleWeather" class="control-btn" :class="{ active: showWeather }" aria-pressed="showWeather" aria-label="Toggle weather layer">
              <i class="fas fa-cloud-sun" aria-hidden="true"></i>
              Weather
            </button>
          </div>
        </div>

        <!-- Location Info Panel -->
        <div v-if="selectedLocation" class="location-info-panel" role="dialog" aria-labelledby="location-title" aria-describedby="location-description">
          <div class="panel-header">
            <h6 id="location-title">{{ selectedLocation.name }}</h6>
            <button @click="closeLocationInfo" class="btn btn-sm btn-outline-secondary" aria-label="Close location information">
              <i class="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>
          <div class="location-details" id="location-description">
            <p><strong>Address:</strong> {{ selectedLocation.address }}</p>
            <p v-if="selectedLocation.category"><strong>Category:</strong> {{ selectedLocation.category }}</p>
            <p v-if="selectedLocation.distance"><strong>Distance:</strong> {{ formatDistance(selectedLocation.distance) }}</p>
            <div class="location-actions">
              <button @click="getDirectionsToLocation" class="btn btn-primary btn-sm" aria-label="Get directions to this location">
                <i class="fas fa-directions" aria-hidden="true"></i>
                Directions
              </button>
              <button @click="addToFavorites" class="btn btn-outline-secondary btn-sm" aria-label="Add this location to favorites">
                <i class="fas fa-heart" aria-hidden="true"></i>
                Save
              </button>
            </div>
          </div>
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
import { accessibilityService } from '@/services/accessibilityService'
import NavigationPanel from '@/components/NavigationPanel.vue'
import PlacesOfInterest from '@/components/PlacesOfInterest.vue'
import TripPlanner from '@/components/TripPlanner.vue'
import ProgramSuggestions from '@/components/ProgramSuggestions.vue'
import MapsControlPanel from '@/components/MapsControlPanel.vue'

// Reactive data
const mainMapContainer = ref(null)
const currentLayer = ref('streets')
const showTraffic = ref(false)
const showWeather = ref(false)
const selectedLocation = ref(null)
const activeTab = ref('controls')

// Tab configuration
const tabs = [
  { id: 'controls', name: 'Controls', icon: 'fas fa-cog' },
  { id: 'navigation', name: 'Navigation', icon: 'fas fa-route' },
  { id: 'programs', name: 'Programs', icon: 'fas fa-running' },
  { id: 'places', name: 'Places', icon: 'fas fa-map-marker-alt' },
  { id: 'trips', name: 'Trip Planner', icon: 'fas fa-map' }
]

// Initialize main map when component mounts
onMounted(async () => {
  try {
    await mapService.initialize()
    await nextTick()
    
    if (mainMapContainer.value) {
      // Ensure container has dimensions
      if (mainMapContainer.value.offsetWidth === 0 || mainMapContainer.value.offsetHeight === 0) {
        // Force container to have dimensions
        mainMapContainer.value.style.width = '100%'
        mainMapContainer.value.style.height = '100%'
      }
      
      // Ensure the map container is empty before creating the map
      mainMapContainer.value.innerHTML = ''
      
      const map = mapService.createMap(mainMapContainer.value, {
        center: [145.12189, -37.91553], // Your exact Clayton location
        zoom: 14
      })
      
      // Add click listener for map
      map.on('click', handleMapClick)
      
      // Announce map initialization
      accessibilityService.announce('Interactive map loaded. Use Tab to navigate controls, Enter to activate buttons.')
      
      // Try to get user's current location
      try {
        const location = await mapService.getCurrentLocation()
        mapService.flyTo([location.lng, location.lat])
        accessibilityService.announce(`Map centered on your current location`)
      } catch (error) {
        console.log('Could not get current location:', error.message)
        // Ensure map is visible even without location
        mapService.flyTo([145.12189, -37.91553], { zoom: 14 })
        accessibilityService.announce('Map centered on Clayton, Victoria')
      }
    }
  } catch (error) {
    console.error('Error initializing main map:', error)
    accessibilityService.announce('Error loading map. Please refresh the page.')
  }
})

// Cleanup when component unmounts
onUnmounted(() => {
  mapService.destroy()
})

// Global function to set destination from map click
window.setAsDestination = (locationName, lng, lat) => {
  // Emit event to NavigationPanel to set destination
  const event = new CustomEvent('setDestination', {
    detail: {
      name: locationName,
      coordinates: [lng, lat]
    }
  })
  window.dispatchEvent(event)
  
  // Close the popup
  if (mapService.currentPopup) {
    mapService.currentPopup.remove()
    mapService.currentPopup = null
  }
}

// Handle map clicks
const handleMapClick = async (e) => {
  try {
    const coordinates = [e.lngLat.lng, e.lngLat.lat]

    // Reverse geocode to get address
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?` +
      `access_token=${mapService.config.accessToken}`
    )

    const data = await response.json()

    if (data.features && data.features.length > 0) {
      const feature = data.features[0]
      selectedLocation.value = {
        name: feature.place_name,
        address: feature.place_name,
        coordinates: coordinates,
        category: feature.place_type?.[0] || 'location'
      }
      
      // Add a marker for the clicked location
      mapService.addMarker(coordinates, {
        color: '#007bff',
        scale: 1.2
      })
      
      // Show a popup with the location info and navigation option
      const popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false
      })
        .setLngLat(coordinates)
        .setHTML(`
          <div class="map-popup">
            <h6>${feature.place_name}</h6>
            <p>Click to set as destination</p>
            <button onclick="setAsDestination('${feature.place_name}', ${coordinates[0]}, ${coordinates[1]})" 
                    class="btn btn-primary btn-sm">
              <i class="fas fa-route"></i> Navigate Here
            </button>
          </div>
        `)
        .addTo(mapService.map)
      
      // Store popup reference for cleanup
      mapService.currentPopup = popup
    }
  } catch (error) {
    console.error('Error handling map click:', error)
  }
}

// Toggle map layers
const toggleLayer = (layerType) => {
  if (!mapService.map) return
  
  const layerStyles = {
    streets: 'mapbox://styles/mapbox/streets-v12',
    satellite: 'mapbox://styles/mapbox/satellite-v9',
    terrain: 'mapbox://styles/mapbox/outdoors-v12'
  }
  
  mapService.map.setStyle(layerStyles[layerType])
  currentLayer.value = layerType
  
  // Announce layer change
  const layerNames = {
    streets: 'street view',
    satellite: 'satellite view',
    terrain: 'terrain view'
  }
  accessibilityService.announce(`Switched to ${layerNames[layerType]}`)
}

// Toggle traffic layer
const toggleTraffic = () => {
  if (!mapService.map) return
  
  showTraffic.value = !showTraffic.value
  
  if (showTraffic.value) {
    mapService.map.addLayer({
      id: 'traffic',
      type: 'line',
      source: {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-traffic-v1'
      },
      'source-layer': 'traffic',
      paint: {
        'line-width': 2,
        'line-color': [
          'case',
          ['==', ['get', 'congestion'], 'low'], '#00ff00',
          ['==', ['get', 'congestion'], 'moderate'], '#ffff00',
          ['==', ['get', 'congestion'], 'heavy'], '#ff6600',
          ['==', ['get', 'congestion'], 'severe'], '#ff0000',
          '#00ff00'
        ]
      }
    })
    accessibilityService.announce('Traffic layer enabled')
  } else {
    if (mapService.map.getLayer('traffic')) {
      mapService.map.removeLayer('traffic')
      mapService.map.removeSource('traffic')
    }
    accessibilityService.announce('Traffic layer disabled')
  }
}

// Toggle weather layer
const toggleWeather = () => {
  if (!mapService.map) return
  
  showWeather.value = !showWeather.value
  
  if (showWeather.value) {
    // Add weather layer (simplified - in real app would use weather API)
    mapService.map.addLayer({
      id: 'weather',
      type: 'fill',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      },
      paint: {
        'fill-color': 'rgba(135, 206, 250, 0.3)',
        'fill-outline-color': 'rgba(135, 206, 250, 0.8)'
      }
    })
    accessibilityService.announce('Weather layer enabled')
  } else {
    if (mapService.map.getLayer('weather')) {
      mapService.map.removeLayer('weather')
      mapService.map.removeSource('weather')
    }
    accessibilityService.announce('Weather layer disabled')
  }
}

// Get directions to selected location
const getDirectionsToLocation = async () => {
  if (!selectedLocation.value) return
  
  try {
    const currentLocation = await mapService.getCurrentLocation()
    const directions = await mapService.getDirections(
      { lat: currentLocation.lat, lng: currentLocation.lng },
      { lat: selectedLocation.value.coordinates[1], lng: selectedLocation.value.coordinates[0] }
    )
    
    // Display directions (in a real app, this would show in a panel)
    console.log('Directions:', directions)
    alert(`Directions to ${selectedLocation.value.name}: ${formatDuration(directions.duration)} (${formatDistance(directions.distance)})`)
  } catch (error) {
    console.error('Error getting directions:', error)
  }
}

// Add location to favorites
const addToFavorites = () => {
  if (!selectedLocation.value) return
  
  // In a real app, this would save to a database or local storage
  console.log('Adding to favorites:', selectedLocation.value)
  alert(`${selectedLocation.value.name} added to favorites!`)
}

// Close location info panel
const closeLocationInfo = () => {
  selectedLocation.value = null
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
.maps-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.maps-header {
  background: white;
  padding: 2rem;
  border-bottom: 1px solid #dee2e6;
  text-align: center;
}

.maps-header h2 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-weight: 600;
}

.maps-header .lead {
  margin: 0;
  color: #666;
  font-size: 1.1rem;
}

.maps-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.maps-sidebar {
  width: 400px;
  background: white;
  border-right: 1px solid #dee2e6;
  display: flex;
  flex-direction: column;
}

.sidebar-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.map-tabs {
  display: flex;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.tab-btn:hover {
  background: #e9ecef;
  color: #333;
}

.tab-btn.active {
  background: white;
  color: #007bff;
  border-bottom: 2px solid #007bff;
}

.tab-btn i {
  font-size: 0.8rem;
}

.tab-content {
  flex: 1;
  overflow: hidden;
}

.navigation-section,
.places-section,
.trips-section {
  height: 100%;
  overflow: hidden;
}

.maps-main {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.main-map {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: #f8f9fa;
  position: relative;
  overflow: hidden;
}

.main-map::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  pointer-events: none;
  z-index: 1;
}

.main-map .mapboxgl-map {
  border-radius: 6px;
  overflow: hidden;
}

.main-map .mapboxgl-canvas {
  border-radius: 6px;
}

.map-controls {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 1000;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-btn {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: #333;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 1);
  border-color: #ffd700;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  color: #2c3e50;
}

.control-btn.active {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  border-color: #ffd700;
  color: #2c3e50;
  font-weight: 600;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
}

.control-btn i {
  font-size: 0.9rem;
}

.location-info-panel {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  width: 350px;
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
  color: #333;
}

.location-details {
  padding: 1rem;
}

.location-details p {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

.location-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.location-actions .btn {
  flex: 1;
}

@media (max-width: 1024px) {
  .maps-sidebar {
    width: 350px;
  }
  
  .location-info-panel {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .maps-content {
    flex-direction: column;
  }
  
  .maps-sidebar {
    width: 100%;
    height: 300px;
    border-right: none;
    border-bottom: 1px solid #dee2e6;
  }
  
  .map-tabs {
    flex-wrap: wrap;
  }

  .tab-btn {
    flex: 1;
    min-width: 0;
    font-size: 0.8rem;
    padding: 0.5rem 0.75rem;
  }

  .tab-btn i {
    display: none;
  }
  
  .map-controls {
    top: 0.5rem;
    left: 0.5rem;
  }
  
  .control-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
  
  .location-info-panel {
    bottom: 0.5rem;
    left: 0.5rem;
    width: calc(100% - 1rem);
  }
}

@media (max-width: 480px) {
  .maps-header {
    padding: 1rem;
  }
  
  .maps-header h2 {
    font-size: 1.5rem;
  }
  
  .maps-header .lead {
    font-size: 1rem;
  }
  
}

/* Map popup styles */
.mapboxgl-popup-content {
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.map-popup h6 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-weight: 600;
}

.map-popup p {
  margin: 0 0 0.75rem 0;
  color: #666;
  font-size: 0.9rem;
}

.map-popup .btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
</style>
