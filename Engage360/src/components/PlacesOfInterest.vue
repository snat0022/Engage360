<!-- src/components/PlacesOfInterest.vue -->
<template>
  <div class="poi-panel">
    <div class="search-section">
      <div class="row">
        <input v-model="query" @keyup.enter="searchPlaces" placeholder="Search cafés, parks, cinemas…" class="input"/>
        <button @click="searchPlaces" class="btn btn-primary search-btn" :disabled="loading">
          <i class="fas fa-search"></i>
        </button>
      </div>
      
      <div class="row">
        <select v-model="radiusKm" @change="searchPlaces" class="select">
          <option :value="1">1 km</option>
          <option :value="3">3 km</option>
          <option :value="5">5 km</option>
          <option :value="10">10 km</option>
        </select>
      </div>
    </div>

    <div class="category-section">
      <h6>Quick Search Categories:</h6>
      <div class="row chips">
        <button
          v-for="c in categoryOptions"
          :key="c.key"
          @click="searchByCategory(c)"
          :class="['chip', {active: selectedCategory === c.key}]"
        >
          <i :class="c.icon"></i>
          {{ c.label }}
        </button>
      </div>
    </div>

    <div class="results-section">
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        Searching…
      </div>
      <div v-else-if="results.length === 0 && hasSearched" class="no-results">
        <i class="fas fa-search"></i>
        No places found. Try a different search or category.
      </div>
      <div v-else-if="results.length === 0" class="muted">
        <i class="fas fa-map-marker-alt"></i>
        Select a category or enter a search term to find nearby places.
      </div>

      <ul class="results" v-if="results.length > 0">
        <li v-for="p in results" :key="p.id" @click="focusPlace(p)">
          <div class="place-info">
            <div class="title">{{ p.name || '(Unnamed)' }}</div>
            <div class="sub">{{ p.address }}</div>
            <div class="meta">
              <span class="category">{{ p.category }}</span>
              <span v-if="p.distanceM != null" class="distance">{{ formatDistance(p.distanceM) }}</span>
            </div>
          </div>
          <div class="place-actions">
            <button @click.stop="getDirections(p)" class="btn btn-sm btn-outline-primary">
              <i class="fas fa-route"></i>
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { mapService } from '@/services/mapService'

const query = ref('')
const radiusKm = ref(3)
const selectedCategory = ref('')
const loading = ref(false)
const results = ref([])
const hasSearched = ref(false)
let userLonLat = null

const categoryOptions = [
  { key: 'restaurant', label: 'Restaurants', icon: 'fas fa-utensils', mapboxTypes: ['poi'], searchTerms: ['restaurant', 'food', 'dining'] },
  { key: 'cafe', label: 'Cafés', icon: 'fas fa-coffee', mapboxTypes: ['poi'], searchTerms: ['cafe', 'coffee', 'coffee shop'] },
  { key: 'park', label: 'Parks', icon: 'fas fa-tree', mapboxTypes: ['poi'], searchTerms: ['park', 'garden', 'playground'] },
  { key: 'cinema', label: 'Cinemas', icon: 'fas fa-film', mapboxTypes: ['poi'], searchTerms: ['cinema', 'movie theater', 'movies'] },
  { key: 'shopping', label: 'Shopping', icon: 'fas fa-shopping-bag', mapboxTypes: ['poi'], searchTerms: ['shopping center', 'mall', 'shop'] },
  { key: 'hospital', label: 'Medical', icon: 'fas fa-hospital', mapboxTypes: ['poi'], searchTerms: ['hospital', 'medical center', 'clinic'] },
  { key: 'gas', label: 'Gas Stations', icon: 'fas fa-gas-pump', mapboxTypes: ['poi'], searchTerms: ['gas station', 'petrol station'] },
  { key: 'atm', label: 'ATMs', icon: 'fas fa-credit-card', mapboxTypes: ['poi'], searchTerms: ['atm', 'bank', 'cash machine'] }
]

function formatDistance(m) {
  if (m < 1000) return `${Math.round(m)} m`
  return `${(m/1000).toFixed(1)} km`
}

async function searchPlaces() {
  if (!query.value.trim()) return
  
  loading.value = true
  hasSearched.value = true
  selectedCategory.value = '' // Clear category selection for manual search
  
  try {
    // Get user location for proximity search
    if (!userLonLat) {
      try {
        const loc = await mapService.getCurrentLocation()
        userLonLat = [loc.lng, loc.lat]
      } catch {
        // Use default Clayton location
        userLonLat = [145.12189, -37.91553]
      }
    }

    // Clear existing markers
    mapService.clearMarkers()

    const allResults = []
    const searchQuery = query.value.trim()

    // Try multiple search strategies
    const searchStrategies = [
      // Strategy 1: Direct search with Melbourne context
      `${searchQuery} Melbourne VIC Australia`,
      // Strategy 2: Search with Victoria context
      `${searchQuery} VIC Australia`,
      // Strategy 3: Search with Australia context
      `${searchQuery} Australia`,
      // Strategy 4: Direct search (for well-known places)
      searchQuery
    ]

    // Special handling for popular Melbourne locations
    if (searchQuery.toLowerCase().includes('chadstone')) {
      searchStrategies.unshift('Chadstone Shopping Centre VIC Australia')
    }

    // Try each search strategy
    for (const strategy of searchStrategies) {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(strategy)}.json?` +
          `access_token=${mapService.config.accessToken}&` +
          `country=au&` +
          `types=poi,place,locality,neighborhood,address&` +
          `limit=10&` +
          `proximity=${userLonLat[0]},${userLonLat[1]}`
        )

        const data = await response.json()
        
        const strategyResults = data.features.map(feature => {
          const coords = feature.center
          let distanceM = null
          
          if (userLonLat) {
            const dx = (coords[0] - userLonLat[0]) * 111320 * Math.cos(userLonLat[1] * Math.PI/180)
            const dy = (coords[1] - userLonLat[1]) * 110540
            distanceM = Math.hypot(dx, dy)
          }

          return {
            id: feature.id,
            name: feature.text,
            address: feature.place_name,
            coords: coords,
            category: getCategoryFromFeature(feature),
            distanceM: distanceM
          }
        })

        allResults.push(...strategyResults)
        
        // If we found results, break early
        if (strategyResults.length > 0) {
          break
        }
      } catch (searchError) {
        console.warn(`Search strategy failed for ${strategy}:`, searchError)
      }
    }

    // Remove duplicates and sort by distance
    const uniqueResults = allResults.filter((place, index, self) => 
      index === self.findIndex(p => p.id === place.id)
    ).sort((a, b) => a.distanceM - b.distanceM)

    // Filter by radius but be more lenient - show results up to 2x the selected radius
    const maxRadius = radiusKm.value * 2000 // 2x the selected radius
    results.value = uniqueResults.filter(place => place.distanceM <= maxRadius)

    // Add markers for all results
    results.value.forEach(place => {
      mapService.addMarker(place.coords, { 
        tooltip: place.address,
        color: '#007bff'
      })
    })

    // Fly to the search area or first result
    if (results.value.length > 0) {
      if (results.value.length === 1) {
        mapService.flyTo(results.value[0].coords, { zoom: 15 })
      } else {
        mapService.flyTo(userLonLat, { zoom: 12 })
      }
    }

  } catch (error) {
    console.error('Error searching places:', error)
    results.value = []
  } finally {
    loading.value = false
  }
}

async function searchByCategory(category) {
  selectedCategory.value = category.key
  loading.value = true
  hasSearched.value = true
  
  try {
    // Get user location for proximity search
    if (!userLonLat) {
      try {
        const loc = await mapService.getCurrentLocation()
        userLonLat = [loc.lng, loc.lat]
      } catch {
        // Use default Clayton location
        userLonLat = [145.12189, -37.91553]
      }
    }

    // Clear existing markers
    mapService.clearMarkers()

    const allResults = []

    // Create specific search queries for each category
    const categorySearches = getCategorySpecificSearches(category.key)
    
    // Search for each specific query in the category
    for (const searchQuery of categorySearches) {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
          `access_token=${mapService.config.accessToken}&` +
          `country=au&` +
          `types=poi&` +
          `limit=8&` +
          `proximity=${userLonLat[0]},${userLonLat[1]}`
        )

        const data = await response.json()
        
        const categoryResults = data.features.map(feature => {
          const coords = feature.center
          let distanceM = null
          
          if (userLonLat) {
            const dx = (coords[0] - userLonLat[0]) * 111320 * Math.cos(userLonLat[1] * Math.PI/180)
            const dy = (coords[1] - userLonLat[1]) * 110540
            distanceM = Math.hypot(dx, dy)
          }

          // Add marker to map
          mapService.addMarker(coords, { 
            tooltip: feature.place_name,
            color: getCategoryColor(category.key)
          })

          return {
            id: feature.id,
            name: feature.text,
            address: feature.place_name,
            coords: coords,
            category: category.label,
            distanceM: distanceM
          }
        }).filter(place => place.distanceM <= radiusKm.value * 1000)

        allResults.push(...categoryResults)
      } catch (searchError) {
        console.warn(`Search failed for ${searchQuery}:`, searchError)
      }
    }

    // Remove duplicates and sort by distance
    const uniqueResults = allResults.filter((place, index, self) => 
      index === self.findIndex(p => p.id === place.id)
    ).sort((a, b) => a.distanceM - b.distanceM)

    // Filter by radius but be more lenient - show results up to 2x the selected radius
    const maxRadius = radiusKm.value * 2000 // 2x the selected radius
    results.value = uniqueResults.filter(place => place.distanceM <= maxRadius).slice(0, 15)

    // Fly to the search area
    if (results.value.length > 0) {
      mapService.flyTo(userLonLat, { zoom: 13 })
    }

  } catch (error) {
    console.error('Error searching by category:', error)
    results.value = []
  } finally {
    loading.value = false
  }
}

// Get specific search queries for each category
function getCategorySpecificSearches(categoryKey) {
  const searches = {
    'restaurant': [
      'restaurant Clayton VIC Australia',
      'restaurant Melbourne VIC Australia',
      'restaurant Oakleigh VIC Australia',
      'restaurant Springvale VIC Australia',
      'restaurant Chadstone VIC Australia'
    ],
    'cafe': [
      'cafe Clayton VIC Australia',
      'coffee shop Clayton VIC Australia',
      'cafe Melbourne VIC Australia',
      'coffee shop Oakleigh VIC Australia',
      'cafe Chadstone VIC Australia'
    ],
    'park': [
      'park Clayton VIC Australia',
      'playground Clayton VIC Australia',
      'reserve Clayton VIC Australia',
      'garden Clayton VIC Australia',
      'park Melbourne VIC Australia'
    ],
    'cinema': [
      'cinema Clayton VIC Australia',
      'movie theater Clayton VIC Australia',
      'cinema Melbourne VIC Australia',
      'cinema Oakleigh VIC Australia',
      'cinema Chadstone VIC Australia'
    ],
    'shopping': [
      'shopping center Clayton VIC Australia',
      'mall Clayton VIC Australia',
      'shopping center Melbourne VIC Australia',
      'mall Oakleigh VIC Australia',
      'Chadstone Shopping Centre VIC Australia'
    ],
    'hospital': [
      'hospital Clayton VIC Australia',
      'medical center Clayton VIC Australia',
      'clinic Clayton VIC Australia',
      'hospital Melbourne VIC Australia',
      'hospital Oakleigh VIC Australia'
    ],
    'gas': [
      'gas station Clayton VIC Australia',
      'petrol station Clayton VIC Australia',
      'gas station Melbourne VIC Australia',
      'service station Clayton VIC Australia',
      'gas station Chadstone VIC Australia'
    ],
    'atm': [
      'atm Clayton VIC Australia',
      'bank Clayton VIC Australia',
      'atm Melbourne VIC Australia',
      'cash machine Clayton VIC Australia',
      'atm Chadstone VIC Australia'
    ]
  }
  
  return searches[categoryKey] || ['poi Clayton VIC Australia']
}

function getCategoryFromFeature(feature) {
  const placeTypes = feature.place_type || []
  if (placeTypes.includes('poi')) {
    return 'Point of Interest'
  } else if (placeTypes.includes('place')) {
    return 'Place'
  } else if (placeTypes.includes('address')) {
    return 'Address'
  }
  return 'Location'
}

function getCategoryColor(categoryKey) {
  const colors = {
    'restaurant': '#ff6b6b',
    'cafe': '#4ecdc4',
    'park': '#45b7d1',
    'cinema': '#96ceb4',
    'shopping': '#feca57',
    'hospital': '#ff9ff3',
    'gas': '#54a0ff',
    'atm': '#5f27cd'
  }
  return colors[categoryKey] || '#007bff'
}

function focusPlace(place) {
  mapService.flyTo(place.coords, { zoom: 15 })
}

async function getDirections(place) {
  try {
    if (!userLonLat) {
      const loc = await mapService.getCurrentLocation()
      userLonLat = [loc.lng, loc.lat]
    }

    // Emit event to NavigationPanel to set destination
    const event = new CustomEvent('setDestination', {
      detail: {
        name: place.name,
        coordinates: place.coords
      }
    })
    window.dispatchEvent(event)

    // Show success message
    console.log(`Getting directions to ${place.name}`)
  } catch (error) {
    console.error('Error getting directions:', error)
  }
}

onMounted(() => {
  // Don't auto-search on mount, wait for user input
})
</script>

<style scoped>
.poi-panel { 
  padding: 1rem; 
  height: 100%; 
  overflow: auto; 
  background: #f8f9fa;
}

.search-section {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.category-section {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.results-section {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.row { 
  display: flex; 
  gap: 8px; 
  margin-bottom: 8px; 
  align-items: center;
}

.input { 
  flex: 1; 
  padding: 8px 12px; 
  border: 1px solid #ddd; 
  border-radius: 6px; 
  font-size: 0.9rem;
}

.input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.search-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: #007bff;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
}

.search-btn:hover:not(:disabled) {
  background: #0056b3;
}

.search-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.select { 
  padding: 8px 12px; 
  border: 1px solid #ddd; 
  border-radius: 6px; 
  font-size: 0.9rem;
  background: white;
}

.category-section h6 {
  margin: 0 0 0.75rem 0;
  color: #333;
  font-weight: 600;
  font-size: 0.95rem;
}

.chips { 
  flex-wrap: wrap; 
  gap: 8px;
}

.chip { 
  border: 1px solid #ddd; 
  padding: 8px 12px; 
  border-radius: 20px; 
  background: #fff; 
  cursor: pointer; 
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.chip:hover {
  border-color: #007bff;
  color: #007bff;
}

.chip.active { 
  border-color: #007bff; 
  background: #007bff;
  color: white;
}

.chip i {
  font-size: 0.8rem;
}

.loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  padding: 1rem;
  text-align: center;
  justify-content: center;
}

.no-results {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  padding: 2rem;
  text-align: center;
  justify-content: center;
  flex-direction: column;
}

.muted { 
  color: #666; 
  font-style: italic; 
  padding: 2rem;
  text-align: center;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  flex-direction: column;
}

.results { 
  list-style: none; 
  margin: 0; 
  padding: 0; 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
}

.results li { 
  padding: 12px; 
  background: #fff; 
  border: 1px solid #eee; 
  border-radius: 8px; 
  cursor: pointer; 
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.2s ease;
}

.results li:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0,123,255,0.1);
}

.place-info {
  flex: 1;
}

.title { 
  font-weight: 600; 
  color: #333;
  margin-bottom: 4px;
}

.sub { 
  color: #666; 
  font-size: 0.9rem; 
  margin-bottom: 6px;
}

.meta { 
  display: flex; 
  gap: 12px; 
  color: #444; 
  font-size: 0.85rem; 
  margin-top: 4px; 
}

.category {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
}

.distance {
  color: #666;
  font-weight: 500;
}

.place-actions {
  margin-left: 12px;
}

.place-actions .btn {
  padding: 4px 8px;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .poi-panel {
    padding: 0.75rem;
  }
  
  .search-section,
  .category-section,
  .results-section {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }
  
  .row {
    flex-direction: column;
    gap: 6px;
  }
  
  .search-btn {
    width: 100%;
    justify-content: center;
  }
  
  .chips {
    justify-content: center;
  }
  
  .results li {
    flex-direction: column;
    gap: 8px;
  }
  
  .place-actions {
    margin-left: 0;
    width: 100%;
  }
  
  .place-actions .btn {
    width: 100%;
  }
}
</style>
