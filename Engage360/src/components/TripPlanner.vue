<!-- src/components/TripPlanner.vue -->
<template>
  <div class="trip-panel">
    <div class="controls-section">
      <div class="row">
        <select v-model="mode" class="select" @change="onModeChange">
          <option value="drive">Driving</option>
          <option value="bicycle">Cycling</option>
          <option value="walk">Walking</option>
          <option value="transit">Transit</option>
        </select>
        <button class="btn btn-primary" @click="addCurrent">
          <i class="fas fa-crosshairs"></i>
          Add Current
        </button>
        <button class="btn btn-success" :disabled="stops.length<2" @click="buildRoute">
          <i class="fas fa-route"></i>
          Build Route
        </button>
        <button class="btn btn-info" :disabled="!routeGeo" @click="exportGpx">
          <i class="fas fa-download"></i>
          Export GPX
        </button>
      </div>
      
      <div class="row" v-if="routeGeo">
        <button class="btn btn-warning" @click="clearRoute">
          <i class="fas fa-trash"></i>
          Clear Route
        </button>
        <button class="btn btn-secondary" @click="rebuildRoute">
          <i class="fas fa-sync"></i>
          Rebuild Route
        </button>
      </div>
    </div>

    <div class="stops-section">
      <div class="section-header">
        <h6>Trip Stops ({{ stops.length }})</h6>
        <button class="btn btn-sm btn-outline-primary" @click="addStopManually">
          <i class="fas fa-plus"></i>
          Add Stop
        </button>
      </div>
      
      <div class="stops">
        <div class="stop" v-for="(s, i) in stops" :key="i" :class="{ 'editing': editingStop === i }">
          <div class="stop-number">#{{ i+1 }}</div>
          
          <div class="stop-content">
            <div v-if="editingStop === i" class="edit-mode">
              <input 
                v-model="editingName" 
                placeholder="Enter stop name..." 
                class="input"
                @keyup.enter="saveStopEdit(i)"
                @keyup.escape="cancelStopEdit"
                ref="editInput"
              />
              <div class="edit-actions">
                <button class="btn btn-sm btn-success" @click="saveStopEdit(i)">
                  <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-sm btn-danger" @click="cancelStopEdit">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <div v-else class="view-mode">
              <div class="stop-name" @click="editStop(i)">
                {{ s.name || `Stop ${i+1}` }}
              </div>
              <div class="stop-coords">{{ formatCoords(s.coords) }}</div>
            </div>
          </div>
          
          <div class="stop-actions">
            <button class="btn btn-sm btn-outline-primary" title="Fly to" @click="flyTo(s)">
              <i class="fas fa-map-marker-alt"></i>
            </button>
            <button class="btn btn-sm btn-outline-info" title="Edit" @click="editStop(i)">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-secondary" title="Move up" @click="moveStopUp(i)" :disabled="i === 0">
              <i class="fas fa-arrow-up"></i>
            </button>
            <button class="btn btn-sm btn-outline-secondary" title="Move down" @click="moveStopDown(i)" :disabled="i === stops.length-1">
              <i class="fas fa-arrow-down"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" title="Remove" @click="removeStop(i)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="hint">
      <i class="fas fa-lightbulb"></i>
      Tip: Click on the map to add a stop, or use the "Add Stop" button to search for a location.
    </div>

    <div v-if="summary" class="summary">
      <div class="summary-header">
        <h6>Route Summary</h6>
        <button class="btn btn-sm btn-outline-primary" @click="showRouteDetails = !showRouteDetails">
          <i class="fas fa-info-circle"></i>
          {{ showRouteDetails ? 'Hide' : 'Show' }} Details
        </button>
      </div>
      
      <div class="summary-stats">
        <div class="stat-item">
          <i class="fas fa-route"></i>
          <span><strong>Distance:</strong> {{ formatDistance(summary.distance) }}</span>
        </div>
        <div class="stat-item">
          <i class="fas fa-clock"></i>
          <span><strong>Duration:</strong> {{ formatDuration(summary.duration) }}</span>
        </div>
        <div class="stat-item">
          <i class="fas fa-map-marker-alt"></i>
          <span><strong>Stops:</strong> {{ stops.length }}</span>
        </div>
      </div>
      
      <div v-if="showRouteDetails" class="route-details">
        <h6>Route Information</h6>
        <div class="detail-item">
          <strong>Transport Mode:</strong> {{ getModeLabel(mode) }}
        </div>
        <div class="detail-item">
          <strong>Route Type:</strong> Multi-stop trip
        </div>
        <div class="detail-item">
          <strong>Last Updated:</strong> {{ new Date().toLocaleTimeString() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { mapService } from '@/services/mapService'
import { geoService } from '@/services/geoservices'
import * as turf from '@turf/turf'

const mode = ref('drive')
const stops = ref([])          // items: { name?, coords:[lon,lat] }
const routeGeo = ref(null)
const summary = ref(null)
const ROUTE_SOURCE = 'trip-route-source'
const ROUTE_LAYER = 'trip-route-layer'

// New reactive variables for enhanced functionality
const editingStop = ref(-1)
const editingName = ref('')
const showRouteDetails = ref(false)

function formatDistance(m) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m/1000).toFixed(1)} km`
}

function formatDuration(s) {
  const m = Math.round(s/60); if (m < 60) return `${m} min`
  const h = Math.floor(m/60), r = m%60; return `${h}h ${r}m`
}

function formatCoords(coords) {
  return `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`
}

function getModeLabel(mode) {
  const labels = {
    'drive': 'Driving',
    'bicycle': 'Cycling', 
    'walk': 'Walking',
    'transit': 'Public Transport'
  }
  return labels[mode] || mode
}

function mapClick(e) {
  const coords = [e.lngLat.lng, e.lngLat.lat]
  stops.value.push({ name: `Stop ${stops.value.length+1}`, coords })
  mapService.addMarker(coords, { tooltip: `Stop ${stops.value.length}` })
  
  // Auto-rebuild route if one exists
  if (routeGeo.value && stops.value.length >= 2) {
    setTimeout(() => rebuildRoute(), 500)
  }
}

function flyTo(s) { 
  mapService.flyTo(s.coords, { zoom: 14 }) 
}

async function addCurrent() {
  const loc = await mapService.getCurrentLocation()
  const coords = [loc.lng, loc.lat]
  stops.value.push({ name: 'Current Location', coords })
  mapService.addMarker(coords, { tooltip: 'Current Location' })
  
  // Auto-rebuild route if one exists
  if (routeGeo.value && stops.value.length >= 2) {
    setTimeout(() => rebuildRoute(), 500)
  }
}

async function addStopManually() {
  const location = prompt('Enter a location name or address:')
  if (!location) return
  
  try {
    // Use MapBox geocoding to find the location
    const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1Ijoic25hdDAwMjIiLCJhIjoiY21oMWVscjEzMDR1bTJxcHEyaGlpNHc3YSJ9.x6wfWL6gHJWJ5nbnPdbNbQ'
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?` +
      `access_token=${accessToken}&` +
      `country=au&limit=1`
    )
    
    const data = await response.json()
    if (data.features && data.features.length > 0) {
      const feature = data.features[0]
      const coords = feature.center
      stops.value.push({ 
        name: feature.text || location, 
        coords,
        address: feature.place_name 
      })
      mapService.addMarker(coords, { tooltip: feature.text || location })
      
      // Auto-rebuild route if one exists
      if (routeGeo.value && stops.value.length >= 2) {
        setTimeout(() => rebuildRoute(), 500)
      }
    } else {
      alert('Location not found. Please try a different search term.')
    }
  } catch (error) {
    console.error('Error adding stop:', error)
    alert('Error finding location. Please try again.')
  }
}

function editStop(index) {
  editingStop.value = index
  editingName.value = stops.value[index].name || ''
  
  nextTick(() => {
    const input = document.querySelector('.edit-mode input')
    if (input) input.focus()
  })
}

function saveStopEdit(index) {
  if (editingName.value.trim()) {
    stops.value[index].name = editingName.value.trim()
  }
  editingStop.value = -1
  editingName.value = ''
  
  // Auto-rebuild route if one exists
  if (routeGeo.value) {
    setTimeout(() => rebuildRoute(), 500)
  }
}

function cancelStopEdit() {
  editingStop.value = -1
  editingName.value = ''
}

function moveStopUp(index) {
  if (index > 0) {
    const temp = stops.value[index]
    stops.value[index] = stops.value[index - 1]
    stops.value[index - 1] = temp
    
    // Auto-rebuild route if one exists
    if (routeGeo.value) {
      setTimeout(() => rebuildRoute(), 500)
    }
  }
}

function moveStopDown(index) {
  if (index < stops.value.length - 1) {
    const temp = stops.value[index]
    stops.value[index] = stops.value[index + 1]
    stops.value[index + 1] = temp
    
    // Auto-rebuild route if one exists
    if (routeGeo.value) {
      setTimeout(() => rebuildRoute(), 500)
    }
  }
}

function removeStop(index) {
  if (confirm('Are you sure you want to remove this stop?')) {
    stops.value.splice(index, 1)
    
    // Clear markers and rebuild
    mapService.clearMarkers()
    stops.value.forEach((stop, i) => {
      mapService.addMarker(stop.coords, { tooltip: stop.name || `Stop ${i+1}` })
    })
    
    // Auto-rebuild route if one exists and we have enough stops
    if (routeGeo.value && stops.value.length >= 2) {
      setTimeout(() => rebuildRoute(), 500)
    } else if (stops.value.length < 2) {
      clearRoute()
    }
  }
}

function removeRouteLayer() {
  const map = mapService.map
  if (!map) return
  if (map.getLayer(ROUTE_LAYER)) map.removeLayer(ROUTE_LAYER)
  if (map.getSource(ROUTE_SOURCE)) map.removeSource(ROUTE_SOURCE)
}

async function buildRoute() {
  if (stops.value.length < 2) return
  
  try {
    const waypoints = stops.value.map(s => s.coords)
    const { geojson, distance, duration } = await geoService.route(waypoints, { mode: mode.value })
    routeGeo.value = geojson
    summary.value = { distance, duration }

    // Draw on map
    const map = mapService.map
    removeRouteLayer()
    map.addSource(ROUTE_SOURCE, { type: 'geojson', data: geojson })
    map.addLayer({
      id: ROUTE_LAYER,
      type: 'line',
      source: ROUTE_SOURCE,
      paint: { 'line-width': 5, 'line-color': '#0d6efd' }
    })
    const bbox = turf.bbox(geojson)
    map.fitBounds(bbox, { padding: 60, duration: 400 })
  } catch (error) {
    console.error('Error building route:', error)
    alert('Error building route. Please check your stops and try again.')
  }
}

async function rebuildRoute() {
  if (stops.value.length < 2) return
  
  try {
    await buildRoute()
    console.log('Route rebuilt successfully')
  } catch (error) {
    console.error('Error rebuilding route:', error)
  }
}

function clearRoute() {
  removeRouteLayer()
  routeGeo.value = null
  summary.value = null
  showRouteDetails.value = false
}

function onModeChange() {
  // Auto-rebuild route if one exists
  if (routeGeo.value && stops.value.length >= 2) {
    setTimeout(() => rebuildRoute(), 500)
  }
}

function exportGpx() {
  const gpx = geoService.geojsonToGpx(routeGeo.value)
  const blob = new Blob([gpx], { type: 'application/gpx+xml' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'trip-route.gpx'
  a.click()
  URL.revokeObjectURL(a.href)
}

onMounted(() => {
  mapService.map?.on('click', mapClick)
})

onUnmounted(() => {
  mapService.map?.off('click', mapClick)
  removeRouteLayer()
})
</script>

<style scoped>
.trip-panel { 
  padding: 16px; 
  height: 100%; 
  overflow: auto; 
  background: #f8f9fa;
}

.controls-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.row { 
  display: flex; 
  gap: 8px; 
  margin-bottom: 8px; 
  flex-wrap: wrap; 
  align-items: center;
}

.btn { 
  padding: 8px 12px; 
  border: 1px solid #ddd; 
  background: #fff; 
  border-radius: 6px; 
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn:hover {
  background: #f8f9fa;
  border-color: #007bff;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary { background: #007bff; color: white; border-color: #007bff; }
.btn-success { background: #28a745; color: white; border-color: #28a745; }
.btn-info { background: #17a2b8; color: white; border-color: #17a2b8; }
.btn-warning { background: #ffc107; color: #212529; border-color: #ffc107; }
.btn-danger { background: #dc3545; color: white; border-color: #dc3545; }
.btn-secondary { background: #6c757d; color: white; border-color: #6c757d; }

.btn-outline-primary { background: transparent; color: #007bff; border-color: #007bff; }
.btn-outline-info { background: transparent; color: #17a2b8; border-color: #17a2b8; }
.btn-outline-secondary { background: transparent; color: #6c757d; border-color: #6c757d; }
.btn-outline-danger { background: transparent; color: #dc3545; border-color: #dc3545; }

.btn-sm { padding: 4px 8px; font-size: 12px; }

.select, .input { 
  padding: 8px; 
  border: 1px solid #ddd; 
  border-radius: 6px; 
  font-size: 14px;
}

.stops-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.section-header h6 {
  margin: 0;
  color: #495057;
  font-weight: 600;
}

.stops { 
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
}

.stop { 
  background: #fff; 
  border: 1px solid #e9ecef; 
  border-radius: 8px; 
  padding: 12px; 
  display: flex; 
  gap: 12px; 
  align-items: center;
  transition: all 0.2s;
}

.stop:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0,123,255,0.1);
}

.stop.editing {
  border-color: #28a745;
  background: #f8fff9;
}

.stop-number {
  background: #007bff;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

.stop-content {
  flex: 1;
  min-width: 0;
}

.view-mode {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stop-name {
  font-weight: 500;
  color: #495057;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.stop-name:hover {
  background: #f8f9fa;
}

.stop-coords {
  font-size: 12px;
  color: #6c757d;
  font-family: monospace;
}

.edit-mode {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.stop-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.stop-actions .btn {
  padding: 4px 6px;
  font-size: 12px;
  min-width: 28px;
}

.hint { 
  color: #6c757d; 
  font-size: 0.9rem; 
  margin-top: 12px;
  padding: 12px;
  background: #e7f3ff;
  border-radius: 6px;
  border-left: 4px solid #007bff;
}

.hint i {
  margin-right: 8px;
  color: #007bff;
}

.summary { 
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.summary-header h6 {
  margin: 0;
  color: #495057;
  font-weight: 600;
}

.summary-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-item i {
  color: #007bff;
  width: 16px;
}

.route-details {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.route-details h6 {
  margin: 0 0 8px 0;
  color: #495057;
  font-weight: 600;
}

.detail-item {
  margin-bottom: 4px;
  font-size: 14px;
  color: #6c757d;
}

/* Responsive design */
@media (max-width: 768px) {
  .trip-panel {
    padding: 12px;
  }
  
  .row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 4px;
  }
  
  .stop {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .stop-content {
    order: 2;
  }
  
  .stop-number {
    order: 1;
    align-self: flex-start;
  }
  
  .stop-actions {
    order: 3;
    justify-content: center;
  }
  
  .summary-stats {
    flex-direction: column;
  }
}
</style>
