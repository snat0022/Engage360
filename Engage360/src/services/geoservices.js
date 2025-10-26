// src/services/geoservices.js - Updated to use MapBox instead of Geoapify
import { mapService } from './mapService.js'
import { directionsService } from './directionsService.js'

export const geoService = {
  // Text autocomplete for the search box - using MapBox Geocoding
  async autocomplete(text, { limit = 5 } = {}) {
    try {
      const results = await mapService.searchPlaces(text, { limit })
      return results.map(f => ({
        id: f.id,
        name: f.name,
        coords: f.coordinates, // MapBox returns [lng, lat]
        raw: f
      }));
    } catch (error) {
      console.error('Autocomplete failed:', error)
      throw new Error('Autocomplete failed')
    }
  },

  // Places near a coordinate with category filters - using MapBox Geocoding
  async searchPlaces({ lon, lat, radius = 3000, categories = [] }) {
    try {
      // Use MapBox to search for places near the given coordinates
      // For now, we'll use a simple approach and search for common place types
      const searchQueries = []
      
      // Map categories to search queries
      if (categories.includes('catering.restaurant')) {
        searchQueries.push('restaurant')
      }
      if (categories.includes('catering.cafe')) {
        searchQueries.push('cafe')
      }
      if (categories.includes('entertainment.cinema')) {
        searchQueries.push('cinema')
      }
      if (categories.includes('leisure.park')) {
        searchQueries.push('park')
      }
      if (categories.includes('tourism.attraction')) {
        searchQueries.push('attraction')
      }
      
      // If no specific categories, search for general places
      if (searchQueries.length === 0) {
        searchQueries.push('restaurant', 'cafe', 'cinema')
      }
      
      const allResults = []
      for (const query of searchQueries.slice(0, 3)) { // Limit to 3 queries to avoid too many requests
        try {
          const results = await mapService.searchPlaces(query, { limit: 10 })
          allResults.push(...results)
        } catch (error) {
          console.warn(`Failed to search for ${query}:`, error)
        }
      }
      
      // Filter results by distance (rough approximation)
      return allResults.map(f => ({
        id: f.id,
        name: f.name,
        category: 'place',
        address: f.name,
        coords: f.coordinates, // MapBox returns [lng, lat]
        distanceM: this.calculateDistance(lat, lon, f.coordinates[1], f.coordinates[0])
      })).filter(p => p.distanceM <= radius).slice(0, 30)
      
    } catch (error) {
      console.error('Places search failed:', error)
      throw new Error('Places search failed')
    }
  },

  // Helper function to calculate distance between two points
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  },

  // Routing between waypoints; returns GeoJSON + summary - using MapBox Directions
  async route(waypoints, { mode = 'drive' } = {}) {
    if (!waypoints || waypoints.length < 2) throw new Error('Need 2+ waypoints');
    
    try {
      // For multi-waypoint routing, we'll use the directions service for each segment
      let totalDistance = 0
      let totalDuration = 0
      let allCoordinates = []
      
      for (let i = 0; i < waypoints.length - 1; i++) {
        const origin = { lng: waypoints[i][0], lat: waypoints[i][1] }
        const destination = { lng: waypoints[i + 1][0], lat: waypoints[i + 1][1] }
        
        const directions = await directionsService.getDirections(origin, destination, { profile: mode })
        
        totalDistance += directions.distance
        totalDuration += directions.duration
        
        if (directions.geometry && directions.geometry.coordinates) {
          allCoordinates.push(...directions.geometry.coordinates)
        }
      }
      
      // Create a combined GeoJSON feature
      const geojson = {
        type: 'Feature',
        properties: {
          distance: totalDistance,
          duration: totalDuration
        },
        geometry: {
          type: 'LineString',
          coordinates: allCoordinates
        }
      }
      
      return {
        geojson,
        distance: totalDistance,
        duration: totalDuration
      };
    } catch (error) {
      console.error('Routing failed:', error)
      throw new Error('Routing failed')
    }
  },

  // Utility: export route GeoJSON as GPX
  geojsonToGpx(geojsonFeature) {
    if (!geojsonFeature?.geometry?.coordinates) return '';
    const coords = geojsonFeature.geometry.coordinates;
    const gpxPts = coords.map(([lon, lat]) => `<trkpt lat="${lat}" lon="${lon}"></trkpt>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Engage360">
  <trk><name>Route</name><trkseg>
    ${gpxPts}
  </trkseg></trk>
</gpx>`;
  }
};