import mapboxgl from 'mapbox-gl'

class MapService {
  constructor() {
    this.map = null
    this.markers = []
    this.popups = []
    this.currentLocation = null
    this.isInitialized = false
    this.isTrackingLocation = false
    this.locationWatchId = null
    this.routeLayer = null
    this.routeSource = null
    this.trafficLayer = null
    this.satelliteLayer = null
    this.mapStyles = {
      street: 'mapbox://styles/mapbox/streets-v12',
      satellite: 'mapbox://styles/mapbox/satellite-v9',
      hybrid: 'mapbox://styles/mapbox/satellite-streets-v12',
      dark: 'mapbox://styles/mapbox/dark-v11',
      light: 'mapbox://styles/mapbox/light-v11',
      outdoors: 'mapbox://styles/mapbox/outdoors-v12',
      navigation: 'mapbox://styles/mapbox/navigation-day-v1',
      navigation_night: 'mapbox://styles/mapbox/navigation-night-v1'
    }
    this.currentStyle = 'navigation'
    this.trafficEnabled = false
    this.satelliteEnabled = false
    
    // MapBox configuration
    this.config = {
      accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1Ijoic25hdDAwMjIiLCJhIjoiY21oMWVscjEzMDR1bTJxcHEyaGlpNHc3YSJ9.x6wfWL6gHJWJ5nbnPdbNbQ',
      style: 'mapbox://styles/mapbox/navigation-day-v1',
      center: [145.12189, -37.91553], // Your exact Clayton location
      zoom: 14,
      maxZoom: 20,
      minZoom: 3
    }
  }

  async initialize() {
    if (this.isInitialized) {
      console.log('MapService already initialized')
      return true
    }

    try {
      console.log('Initializing MapService...')
      console.log('Access token:', this.config.accessToken ? 'Present' : 'Missing')
      
      // Initialize MapBox
      mapboxgl.accessToken = this.config.accessToken
      
      // Geocoding will be handled via API calls directly

      // Directions API will be used directly via fetch requests

      this.isInitialized = true
      console.log('MapService initialized successfully')
      return true
    } catch (error) {
      console.error('Failed to initialize map service:', error)
      throw error
    }
  }

  createMap(container, options = {}) {
    console.log('MapService: createMap called')
    console.log('MapService: isInitialized =', this.isInitialized)
    
    if (!this.isInitialized) {
      console.error('MapService: Not initialized, throwing error')
      throw new Error('MapService not initialized. Call initialize() first.')
    }

    console.log('MapService: Creating map with container:', container)

    // Destroy existing map if it exists
    if (this.map) {
      console.log('MapService: Destroying existing map')
      this.destroy()
    }

    const mapOptions = {
      container: container,
      style: this.config.style,
      center: options.center || this.config.center,
      zoom: options.zoom || this.config.zoom,
      ...options
    }

    console.log('MapService: Map options:', mapOptions)
    this.map = new mapboxgl.Map(mapOptions)
    console.log('MapService: Map created successfully')
    
    // Add navigation controls
    this.map.addControl(new mapboxgl.NavigationControl())

    // Add geolocate control
    this.map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      })
    )

    return this.map
  }

  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          this.currentLocation = { lat: latitude, lng: longitude }
          resolve(this.currentLocation)
        },
        (error) => {
          console.error('Error getting location:', error)
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
        
      )
    })
  }

  async searchPlaces(query, options = {}) {
    try {
      // For Monash University searches, be more specific
      let searchQuery = query
      if (query.toLowerCase().includes('monash') && query.toLowerCase().includes('clayton')) {
        searchQuery = 'Monash University Clayton VIC Australia'
      } else if (query.toLowerCase().includes('monash')) {
        searchQuery = 'Monash University VIC Australia' // Search all Monash campuses in VIC
      } else if (query.toLowerCase().includes('clayton')) {
        // For any Clayton searches, add VIC Australia for better results
        searchQuery = query + ' VIC Australia'
      } else {
        // For any other search, add Melbourne VIC Australia context
        searchQuery = query + ' Melbourne VIC Australia'
      }
      
      // Always try to get current location first, then use it for proximity
      let proximityParam = 'proximity=145.12189,-37.91553' // Default to your Clayton location
      
      // Try to get current location if not already set
      if (!this.currentLocation) {
        try {
          const location = await this.getCurrentLocation()
          this.currentLocation = location
        } catch (error) {
          console.log('Could not get current location for search, using default Clayton location')
        }
      }
      
      // Use current location if available
      if (this.currentLocation) {
        proximityParam = `proximity=${this.currentLocation.lng},${this.currentLocation.lat}`
      }
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
        `access_token=${this.config.accessToken}&` +
        `country=au&` +
        `types=poi,place,locality,neighborhood,address,district,postcode&` +
        `limit=${options.limit || 15}&` +
        `${proximityParam}` // Use user's location or Melbourne
      )
      
      const data = await response.json()
      let features = data.features.map(feature => ({
        id: feature.id,
        name: feature.place_name,
        coordinates: feature.center,
        type: feature.place_type[0],
        context: feature.context,
        properties: feature.properties
      }))
      
      // If searching for Monash University Clayton and no results, add a fallback
      if (query.toLowerCase().includes('monash') && query.toLowerCase().includes('clayton') && features.length === 0) {
        features = [{
          id: 'monash-clayton-fallback',
          name: 'Monash University Clayton Campus, Clayton VIC 3168, Australia',
          coordinates: [145.1229184, -37.912576], // Exact coordinates for Monash Clayton
          type: 'poi',
          context: [],
          properties: {}
        }]
      }
      
      // If searching for any Clayton location and no results, add your area as fallback
      if (query.toLowerCase().includes('clayton') && features.length === 0) {
        features = [{
          id: 'clayton-fallback',
          name: 'Clayton VIC 3168, Australia',
          coordinates: [145.12189, -37.91553], // Your exact Clayton location
          type: 'locality',
          context: [],
          properties: {}
        }]
      }
      
      // If searching for "19 Ancora Imparo Way" specifically, add it as fallback
      if (query.toLowerCase().includes('ancora imparo') && features.length === 0) {
        features = [{
          id: 'ancora-imparo-fallback',
          name: '19 Ancora Imparo Way, Clayton VIC 3168, Australia',
          coordinates: [145.1229184, -37.912576], // Exact coordinates for this address
          type: 'address',
          context: [],
          properties: {}
        }]
      }
      
      // If searching for Melbourne areas and no results, add Melbourne fallbacks
      if (features.length === 0) {
        // First try Melbourne landmarks
        if (query.toLowerCase().includes('melbourne') || query.toLowerCase().includes('landmark') || query.toLowerCase().includes('attraction')) {
          const landmarkResults = await this.searchMelbourneLandmarks(query)
          if (landmarkResults.length > 0) {
            features = landmarkResults.slice(0, 5)
          }
        }
        
        // If still no results, add Melbourne area fallbacks
        if (features.length === 0) {
          const melbourneAreas = [
            { name: 'Melbourne CBD VIC 3000, Australia', coords: [144.9631, -37.8136] },
            { name: 'Southbank VIC 3006, Australia', coords: [144.9631, -37.8236] },
            { name: 'Richmond VIC 3121, Australia', coords: [145.0019, -37.8180] },
            { name: 'St Kilda VIC 3182, Australia', coords: [144.9820, -37.8679] },
            { name: 'Carlton VIC 3053, Australia', coords: [144.9679, -37.7967] },
            { name: 'Fitzroy VIC 3065, Australia', coords: [144.9787, -37.7980] },
            { name: 'Collingwood VIC 3066, Australia', coords: [144.9883, -37.7996] },
            { name: 'Prahran VIC 3181, Australia', coords: [144.9934, -37.8519] },
            { name: 'Brunswick VIC 3056, Australia', coords: [144.9636, -37.7675] },
            { name: 'Footscray VIC 3011, Australia', coords: [144.9007, -37.7990] }
          ]
          
          // Add the first few Melbourne areas as fallbacks
          melbourneAreas.slice(0, 3).forEach((area, index) => {
            features.push({
              id: `melbourne-fallback-${index}`,
              name: area.name,
              coordinates: area.coords,
              type: 'locality',
              context: [],
              properties: {}
            })
          })
        }
      }
      
      return features
    } catch (error) {
      console.error('Error searching places:', error)
      throw error
    }
  }

  // Method to search for popular Melbourne landmarks and attractions
  async searchMelbourneLandmarks(query, options = {}) {
    try {
      const melbourneLandmarks = [
        { name: 'Federation Square Melbourne VIC Australia', coords: [144.9679, -37.8180] },
        { name: 'Melbourne Cricket Ground VIC Australia', coords: [144.9848, -37.8199] },
        { name: 'Royal Botanic Gardens Melbourne VIC Australia', coords: [144.9787, -37.8304] },
        { name: 'Queen Victoria Market Melbourne VIC Australia', coords: [144.9564, -37.8076] },
        { name: 'St Kilda Beach VIC Australia', coords: [144.9820, -37.8679] },
        { name: 'Brighton Beach VIC Australia', coords: [144.9883, -37.9180] },
        { name: 'Docklands Melbourne VIC Australia', coords: [144.9458, -37.8175] },
        { name: 'Southbank Melbourne VIC Australia', coords: [144.9631, -37.8236] },
        { name: 'Chapel Street Melbourne VIC Australia', coords: [144.9934, -37.8519] },
        { name: 'Lygon Street Melbourne VIC Australia', coords: [144.9679, -37.7967] }
      ]
      
      // Filter landmarks based on query
      const filteredLandmarks = melbourneLandmarks.filter(landmark => 
        landmark.name.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().includes('melbourne') ||
        query.toLowerCase().includes('landmark') ||
        query.toLowerCase().includes('attraction')
      )
      
      return filteredLandmarks.map(landmark => ({
        id: landmark.name.replace(/\s+/g, '-').toLowerCase(),
        name: landmark.name,
        coordinates: landmark.coords,
        type: 'poi',
        context: [],
        properties: {}
      }))
    } catch (error) {
      console.error('Error searching Melbourne landmarks:', error)
      throw error
    }
  }

  // Specific method for searching universities
  async searchUniversities(query, options = {}) {
    try {
      let searchQuery = query
      
      // Handle specific university searches
      if (query.toLowerCase().includes('monash') && query.toLowerCase().includes('clayton')) {
        searchQuery = 'Monash University Clayton Campus VIC Australia'
      } else if (query.toLowerCase().includes('monash')) {
        searchQuery = 'Monash University VIC Australia' // Search all Monash campuses in VIC
      } else if (query.toLowerCase().includes('clayton')) {
        // For any Clayton searches, add VIC Australia for better results
        searchQuery = query + ' VIC Australia'
      } else {
        // For any other university search, add Melbourne VIC Australia context
        searchQuery = query + ' Melbourne VIC Australia'
      }
      
      // Always try to get current location first, then use it for proximity
      let proximityParam = 'proximity=145.12189,-37.91553' // Default to your Clayton location
      
      // Try to get current location if not already set
      if (!this.currentLocation) {
        try {
          const location = await this.getCurrentLocation()
          this.currentLocation = location
        } catch (error) {
          console.log('Could not get current location for university search, using default Clayton location')
        }
      }
      
      // Use current location if available
      if (this.currentLocation) {
        proximityParam = `proximity=${this.currentLocation.lng},${this.currentLocation.lat}`
      }
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
        `access_token=${this.config.accessToken}&` +
        `country=au&` +
        `types=poi,place,locality,neighborhood,address,district,postcode&` +
        `limit=${options.limit || 15}&` +
        `${proximityParam}` // Use user's location or Melbourne
      )
      
      const data = await response.json()
      return data.features.map(feature => ({
        id: feature.id,
        name: feature.place_name,
        coordinates: feature.center,
        type: feature.place_type[0],
        context: feature.context,
        properties: feature.properties
      }))
    } catch (error) {
      console.error('Error searching universities:', error)
      throw error
    }
  }

  async getDirections(origin, destination, options = {}) {
    // Import the directions service dynamically to avoid circular dependencies
    const { directionsService } = await import('./directionsService.js')
    return directionsService.getDirections(origin, destination, options)
  }

  addMarker(coordinates, options = {}) {
    if (!this.map) return null

    const marker = new mapboxgl.Marker(options)
      .setLngLat(coordinates)
      .addTo(this.map)

    this.markers.push(marker)
    return marker
  }

  removeMarker(marker) {
    if (marker) {
      marker.remove()
      const index = this.markers.indexOf(marker)
      if (index > -1) {
        this.markers.splice(index, 1)
      }
    }
  }

  clearMarkers() {
    this.markers.forEach(marker => marker.remove())
    this.markers = []
  }

  flyTo(coordinates, options = {}) {
    if (!this.map) return

    this.map.flyTo({
      center: coordinates,
      zoom: options.zoom || 15,
      duration: options.duration || 2000,
      ...options
    })
  }

  fitBounds(bounds, options = {}) {
    if (!this.map) return

    this.map.fitBounds(bounds, {
      padding: 50,
      ...options
    })
  }

  // ===== APPLE MAPS / GOOGLE MAPS-LIKE FUNCTIONALITY =====

  // Map Style Management
  setMapStyle(style) {
    if (!this.map || !this.mapStyles[style]) return
    
    this.currentStyle = style
    this.map.setStyle(this.mapStyles[style])
    
    // Re-add markers after style change
    setTimeout(() => {
      this.markers.forEach(marker => {
        if (marker.getElement()) {
          marker.addTo(this.map)
        }
      })
    }, 100)
  }

  toggleSatellite() {
    this.satelliteEnabled = !this.satelliteEnabled
    if (this.satelliteEnabled) {
      this.setMapStyle('satellite')
    } else {
      this.setMapStyle('street')
    }
  }

  toggleTraffic() {
    if (!this.map) return
    
    this.trafficEnabled = !this.trafficEnabled
    
    if (this.trafficEnabled) {
      // Add traffic layer
      this.map.addSource('traffic', {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-traffic-v1'
      })
      
      this.map.addLayer({
        id: 'traffic-layer',
        type: 'line',
        source: 'traffic',
        'source-layer': 'traffic',
        paint: {
          'line-width': 2,
          'line-color': [
            'case',
            ['==', ['get', 'congestion'], 'low'], '#4CAF50',
            ['==', ['get', 'congestion'], 'moderate'], '#FF9800',
            ['==', ['get', 'congestion'], 'heavy'], '#F44336',
            ['==', ['get', 'congestion'], 'severe'], '#9C27B0',
            '#757575'
          ]
        }
      })
    } else {
      // Remove traffic layer
      if (this.map.getLayer('traffic-layer')) {
        this.map.removeLayer('traffic-layer')
      }
      if (this.map.getSource('traffic')) {
        this.map.removeSource('traffic')
      }
    }
  }

  // Advanced Location Services
  async getCurrentLocation(options = {}) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      const geoOptions = {
        enableHighAccuracy: true,
        timeout: options.timeout || 10000,
        maximumAge: options.maximumAge || 60000,
        ...options
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          }
          this.currentLocation = location
          resolve(location)
        },
        (error) => {
          console.error('Geolocation error:', error)
          // Fallback to default Clayton location
          const fallbackLocation = {
            lat: -37.91553,
            lng: 145.12189,
            accuracy: 1000,
            timestamp: Date.now()
          }
          this.currentLocation = fallbackLocation
          resolve(fallbackLocation)
        },
        geoOptions
      )
    })
  }

  startLocationTracking(callback) {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported')
      return
    }

    this.isTrackingLocation = true
    
    this.locationWatchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp
        }
        this.currentLocation = location
        
        if (callback) {
          callback(location)
        }
      },
      (error) => {
        console.error('Location tracking error:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000
      }
    )
  }

  stopLocationTracking() {
    if (this.locationWatchId) {
      navigator.geolocation.clearWatch(this.locationWatchId)
      this.locationWatchId = null
    }
    this.isTrackingLocation = false
  }

  // Advanced Search and Geocoding
  async searchPlaces(query, options = {}) {
    const {
      proximity = this.currentLocation ? [this.currentLocation.lng, this.currentLocation.lat] : this.config.center,
      country = 'au',
      types = 'poi,place,locality,neighborhood,address',
      limit = 10,
      bbox = null
    } = options

    try {
      let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${this.config.accessToken}&` +
        `country=${country}&` +
        `types=${types}&` +
        `limit=${limit}&` +
        `proximity=${proximity[0]},${proximity[1]}`

      if (bbox) {
        url += `&bbox=${bbox.join(',')}`
      }

      const response = await fetch(url)
      const data = await response.json()

      return data.features.map(feature => ({
        id: feature.id,
        name: feature.text,
        address: feature.place_name,
        coordinates: feature.center,
        category: feature.properties?.category || 'unknown',
        relevance: feature.relevance,
        bbox: feature.bbox
      }))
    } catch (error) {
      console.error('Search error:', error)
      return []
    }
  }

  async reverseGeocode(coordinates) {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?` +
        `access_token=${this.config.accessToken}&` +
        `country=au&limit=1`
      )
      const data = await response.json()

      if (data.features && data.features.length > 0) {
        return {
          name: data.features[0].text,
          address: data.features[0].place_name,
          coordinates: data.features[0].center
        }
      }
      return null
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      return null
    }
  }

  // Advanced Route Management
  async getDirections(origin, destination, options = {}) {
    const {
      profile = 'driving-traffic',
      alternatives = false,
      geometries = 'geojson',
      overview = 'full',
      steps = true,
      annotations = ['duration', 'distance']
    } = options

    try {
      const originStr = Array.isArray(origin) ? `${origin[0]},${origin[1]}` : origin
      const destStr = Array.isArray(destination) ? `${destination[0]},${destination[1]}` : destination

      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${originStr};${destStr}?` +
        `access_token=${this.config.accessToken}&` +
        `alternatives=${alternatives}&` +
        `geometries=${geometries}&` +
        `overview=${overview}&` +
        `steps=${steps}&` +
        `annotations=${annotations.join(',')}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.routes && data.routes.length > 0) {
        return {
          routes: data.routes,
          waypoints: data.waypoints,
          geometry: data.routes[0].geometry,
          distance: data.routes[0].distance,
          duration: data.routes[0].duration,
          steps: data.routes[0].legs[0].steps
        }
      }
      return null
    } catch (error) {
      console.error('Directions error:', error)
      return null
    }
  }

  drawRoute(routeData, options = {}) {
    if (!this.map || !routeData) return

    const {
      color = '#007bff',
      width = 5,
      opacity = 0.8,
      dashArray = null
    } = options

    // Remove existing route
    this.clearRoute()

    // Add route source
    this.map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: routeData.geometry
      }
    })

    // Add route layer
    this.map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': color,
        'line-width': width,
        'line-opacity': opacity,
        ...(dashArray && { 'line-dasharray': dashArray })
      }
    })

    // Fit map to route
    if (routeData.geometry && routeData.geometry.coordinates) {
      const coordinates = routeData.geometry.coordinates
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord)
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))

      this.map.fitBounds(bounds, { padding: 50 })
    }
  }

  clearRoute() {
    if (!this.map) return

    if (this.map.getLayer('route')) {
      this.map.removeLayer('route')
    }
    if (this.map.getSource('route')) {
      this.map.removeSource('route')
    }
  }

  // Advanced Marker Management
  addCustomMarker(coordinates, options = {}) {
    if (!this.map) return null

    const {
      color = '#007bff',
      size = 'medium',
      icon = null,
      popup = null,
      draggable = false
    } = options

    const el = document.createElement('div')
    el.className = 'custom-marker'
    
    if (icon) {
      el.innerHTML = icon
    } else {
      el.style.width = size === 'small' ? '20px' : size === 'large' ? '40px' : '30px'
      el.style.height = size === 'small' ? '20px' : size === 'large' ? '40px' : '30px'
      el.style.borderRadius = '50%'
      el.style.backgroundColor = color
      el.style.border = '2px solid white'
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
    }

    const marker = new mapboxgl.Marker({
      element: el,
      draggable: draggable
    })
      .setLngLat(coordinates)
      .addTo(this.map)

    if (popup) {
      marker.setPopup(new mapboxgl.Popup().setHTML(popup))
    }

    this.markers.push(marker)
    return marker
  }

  // Map Controls
  addNavigationControl() {
    if (!this.map) return

    this.map.addControl(new mapboxgl.NavigationControl(), 'top-right')
  }

  addGeolocateControl() {
    if (!this.map) return

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    })

    this.map.addControl(geolocate, 'top-right')
    return geolocate
  }

  addFullscreenControl() {
    if (!this.map) return

    this.map.addControl(new mapboxgl.FullscreenControl(), 'top-right')
  }

  addScaleControl() {
    if (!this.map) return

    this.map.addControl(new mapboxgl.ScaleControl({
      maxWidth: 100,
      unit: 'metric'
    }), 'bottom-left')
  }

  // Map Interaction
  enableMapClick(callback) {
    if (!this.map) return

    this.map.on('click', (e) => {
      if (callback) {
        callback({
          coordinates: [e.lngLat.lng, e.lngLat.lat],
          point: e.point,
          originalEvent: e.originalEvent
        })
      }
    })
  }

  enableMapHover(callback) {
    if (!this.map) return

    this.map.on('mousemove', (e) => {
      if (callback) {
        callback({
          coordinates: [e.lngLat.lng, e.lngLat.lat],
          point: e.point,
          originalEvent: e.originalEvent
        })
      }
    })
  }

  // Map Style Management
  setMapStyle(styleKey) {
    if (!this.map) return
    
    const style = this.mapStyles[styleKey]
    if (!style) {
      console.error(`Unknown map style: ${styleKey}`)
      return
    }
    
    this.currentStyle = styleKey
    this.map.setStyle(style)
    
    // Re-add markers and layers after style change
    this.map.once('styledata', () => {
      this.reAddMarkersAndLayers()
    })
  }
  
  toggleSatellite() {
    if (!this.map) return
    
    this.satelliteEnabled = !this.satelliteEnabled
    
    if (this.satelliteEnabled) {
      // Add satellite imagery layer
      this.map.addSource('satellite', {
        type: 'raster',
        url: 'mapbox://mapbox.satellite',
        tileSize: 256
      })
      
      this.map.addLayer({
        id: 'satellite-layer',
        type: 'raster',
        source: 'satellite',
        paint: {
          'raster-opacity': 0.7
        }
      })
    } else {
      // Remove satellite layer
      if (this.map.getLayer('satellite-layer')) {
        this.map.removeLayer('satellite-layer')
      }
      if (this.map.getSource('satellite')) {
        this.map.removeSource('satellite')
      }
    }
  }
  
  toggleTraffic() {
    if (!this.map) return
    
    this.trafficEnabled = !this.trafficEnabled
    
    if (this.trafficEnabled) {
      // Add traffic layer
      this.map.addLayer({
        id: 'traffic-layer',
        type: 'line',
        source: {
          type: 'vector',
          url: 'mapbox://mapbox.mapbox-traffic-v1'
        },
        'source-layer': 'traffic',
        paint: {
          'line-width': {
            'base': 1,
            'stops': [[10, 1], [20, 8]]
          },
          'line-color': [
            'case',
            ['==', ['get', 'congestion'], 'low'], '#4CAF50',
            ['==', ['get', 'congestion'], 'moderate'], '#FF9800',
            ['==', ['get', 'congestion'], 'heavy'], '#F44336',
            ['==', ['get', 'congestion'], 'severe'], '#9C27B0',
            '#2196F3'
          ],
          'line-opacity': 0.8
        }
      })
    } else {
      // Remove traffic layer
      if (this.map.getLayer('traffic-layer')) {
        this.map.removeLayer('traffic-layer')
      }
    }
  }
  
  reAddMarkersAndLayers() {
    // Re-add all markers
    this.markers.forEach(marker => {
      marker.addTo(this.map)
    })
    
    // Re-add route if exists
    if (this.routeSource && this.routeLayer) {
      this.map.addSource('route-source', this.routeSource)
      this.map.addLayer(this.routeLayer)
    }
    
    // Re-add traffic if enabled
    if (this.trafficEnabled) {
      this.toggleTraffic()
    }
    
    // Re-add satellite if enabled
    if (this.satelliteEnabled) {
      this.toggleSatellite()
    }
  }

  // Utility Functions
  calculateDistance(point1, point2) {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = point1[1] * Math.PI / 180
    const φ2 = point2[1] * Math.PI / 180
    const Δφ = (point2[1] - point1[1]) * Math.PI / 180
    const Δλ = (point2[0] - point1[0]) * Math.PI / 180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c // Distance in meters
  }

  formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    } else {
      return `${(meters / 1000).toFixed(1)}km`
    }
  }

  formatDuration(seconds) {
    const minutes = Math.round(seconds / 60)
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  destroy() {
    if (this.map) {
      this.map.remove()
      this.map = null
    }
    this.clearMarkers()
    this.stopLocationTracking()
    this.isInitialized = false
  }
}

// Export singleton instance
export const mapService = new MapService()
export default mapService
