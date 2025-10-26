class DirectionsService {
  constructor() {
    this.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1Ijoic25hdDAwMjIiLCJhIjoiY21oMWVscjEzMDR1bTJxcHEyaGlpNHc3YSJ9.x6wfWL6gHJWJ5nbnPdbNbQ'
    this.baseUrl = 'https://api.mapbox.com/directions/v5'
    
    // Map transport modes to MapBox profiles
    this.profileMap = {
      'driving': 'driving-traffic',
      'walking': 'walking',
      'cycling': 'cycling',
      'bus': 'driving', // Bus routes typically follow roads
      'train': 'driving', // For now, use driving (would need transit API for real train routes)
      'tram': 'driving', // For now, use driving (would need transit API for real tram routes)
      'transit': 'driving' // For now, use driving (would need transit API for real public transport)
    }
  }

  // Get the appropriate MapBox profile for the transport mode
  getProfile(transportMode) {
    return this.profileMap[transportMode] || 'driving-traffic'
  }

  async getDirections(origin, destination, options = {}) {
    try {
      const transportMode = options.profile || 'driving'
      const profile = this.getProfile(transportMode)
      
      // Ensure coordinates are in the correct format (longitude, latitude)
      // Handle both {lat, lng} and [lng, lat] formats
      let originLng, originLat, destLng, destLat
      
      if (Array.isArray(origin)) {
        [originLng, originLat] = origin
      } else {
        originLng = origin.lng || origin.longitude
        originLat = origin.lat || origin.latitude
      }
      
      if (Array.isArray(destination)) {
        [destLng, destLat] = destination
      } else {
        destLng = destination.lng || destination.longitude
        destLat = destination.lat || destination.latitude
      }
      
      const coordinates = `${originLng},${originLat};${destLng},${destLat}`
      
      console.log('Directions request coordinates:', coordinates)
      console.log('Origin:', { lng: originLng, lat: originLat })
      console.log('Destination:', { lng: destLng, lat: destLat })
      
      const response = await fetch(
        `${this.baseUrl}/mapbox/${profile}/${coordinates}?` +
        `access_token=${this.accessToken}&` +
        `geometries=geojson&` +
        `overview=full&` +
        `steps=true&` +
        `annotations=duration,distance`
      )
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Directions API error response:', errorText)
        throw new Error(`Directions API error: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        return {
          distance: route.distance,
          duration: route.duration,
          geometry: route.geometry,
          steps: route.legs[0].steps,
          waypoints: data.waypoints,
          route: route
        }
      } else {
        throw new Error('No routes found')
      }
    } catch (error) {
      console.error('Error getting directions:', error)
      throw error
    }
  }

  async getDirectionsWithWaypoints(waypoints, options = {}) {
    try {
      const transportMode = options.profile || 'driving'
      const profile = this.getProfile(transportMode)
      
      // Handle both {lat, lng} and [lng, lat] formats for waypoints
      const coordinates = waypoints.map(wp => {
        if (Array.isArray(wp)) {
          return `${wp[0]},${wp[1]}` // [lng, lat]
        } else {
          const lng = wp.lng || wp.longitude
          const lat = wp.lat || wp.latitude
          return `${lng},${lat}`
        }
      }).join(';')
      
      const response = await fetch(
        `${this.baseUrl}/mapbox/${profile}/${coordinates}?` +
        `access_token=${this.accessToken}&` +
        `geometries=geojson&` +
        `overview=full&` +
        `steps=true&` +
        `annotations=duration,distance`
      )
      
      if (!response.ok) {
        throw new Error(`Directions API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        return {
          distance: route.distance,
          duration: route.duration,
          geometry: route.geometry,
          steps: route.legs.flatMap(leg => leg.steps),
          waypoints: data.waypoints,
          route: route
        }
      } else {
        throw new Error('No routes found')
      }
    } catch (error) {
      console.error('Error getting directions with waypoints:', error)
      throw error
    }
  }

  formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
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

  getStepIcon(maneuverType) {
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
    return icons[maneuverType] || 'fas fa-arrow-up'
  }
}

// Export singleton instance
export const directionsService = new DirectionsService()
export default directionsService
