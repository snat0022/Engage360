class GeolocationService {
  constructor() {
    this.watchId = null
    this.currentPosition = null
    this.lastKnownPosition = null
    this.isTracking = false
    this.listeners = []
    this.options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    }
  }

  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentPosition = this.formatPosition(position)
          this.lastKnownPosition = this.currentPosition
          resolve(this.currentPosition)
        },
        (error) => {
          console.error('Error getting current position:', error)
          reject(error)
        },
        this.options
      )
    })
  }

  startTracking(callback) {
    if (this.isTracking) {
      console.warn('Geolocation tracking is already active')
      return
    }

    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser')
    }

    this.isTracking = true
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.currentPosition = this.formatPosition(position)
        this.lastKnownPosition = this.currentPosition
        
        // Notify all listeners
        this.listeners.forEach(listener => {
          try {
            listener(this.currentPosition)
          } catch (error) {
            console.error('Error in geolocation listener:', error)
          }
        })

        // Call the provided callback
        if (callback) {
          callback(this.currentPosition)
        }
      },
      (error) => {
        console.error('Error tracking position:', error)
        this.handleGeolocationError(error)
      },
      this.options
    )

    return this.watchId
  }

  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
      this.isTracking = false
    }
  }

  addListener(callback) {
    this.listeners.push(callback)
  }

  removeListener(callback) {
    const index = this.listeners.indexOf(callback)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  formatPosition(position) {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp
    }
  }

  calculateDistance(point1, point2) {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = point1.latitude * Math.PI / 180
    const φ2 = point2.latitude * Math.PI / 180
    const Δφ = (point2.latitude - point1.latitude) * Math.PI / 180
    const Δλ = (point2.longitude - point1.longitude) * Math.PI / 180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c // Distance in meters
  }

  isWithinRadius(point1, point2, radiusMeters) {
    const distance = this.calculateDistance(point1, point2)
    return distance <= radiusMeters
  }

  getAddressFromCoordinates(latitude, longitude) {
    // This would typically use a reverse geocoding service
    // For now, return a placeholder
    return new Promise((resolve) => {
      resolve({
        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        city: 'Unknown',
        country: 'Unknown'
      })
    })
  }

  handleGeolocationError(error) {
    let message = 'Unknown geolocation error'
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'Location access denied by user'
        break
      case error.POSITION_UNAVAILABLE:
        message = 'Location information unavailable'
        break
      case error.TIMEOUT:
        message = 'Location request timed out'
        break
    }
    
    console.error('Geolocation error:', message)
    
    // Notify listeners of the error
    this.listeners.forEach(listener => {
      try {
        listener(null, error)
      } catch (listenerError) {
        console.error('Error in geolocation error listener:', listenerError)
      }
    })
  }

  getLastKnownPosition() {
    return this.lastKnownPosition
  }

  getCurrentPositionSync() {
    return this.currentPosition
  }

  isLocationPermissionGranted() {
    return new Promise((resolve) => {
      if (!navigator.permissions) {
        // Fallback for browsers that don't support permissions API
        resolve(true)
        return
      }

      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        resolve(result.state === 'granted')
      }).catch(() => {
        resolve(true) // Default to true if permissions API fails
      })
    })
  }

  requestLocationPermission() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            resolve(false)
          } else {
            reject(error)
          }
        },
        { timeout: 5000 }
      )
    })
  }
}

// Export singleton instance
export const geolocationService = new GeolocationService()
export default geolocationService
