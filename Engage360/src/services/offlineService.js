// Offline Features Service
// This service handles offline functionality including online/offline detection and local storage

class OfflineService {
  constructor() {
    this.isOnline = navigator.onLine
    this.offlineQueue = []
    this.syncInProgress = false
    this.storageKeys = {
      USER_DATA: 'engage360_user_data',
      PROGRAMS: 'engage360_programs',
      BOOKINGS: 'engage360_bookings',
      EMAILS: 'engage360_emails',
      OFFLINE_QUEUE: 'engage360_offline_queue',
      CACHE_TIMESTAMP: 'engage360_cache_timestamp'
    }
    this.cacheExpiry = 24 * 60 * 60 * 1000 // 24 hours
    this.eventListeners = []
  }

  // Initialize offline service
  async initialize() {
    console.log('Initializing Offline Service...')
    
    // Set up online/offline event listeners
    this.setupOnlineOfflineListeners()
    
    // Load offline queue from storage
    await this.loadOfflineQueue()
    
    // Set up periodic sync
    this.setupPeriodicSync()
    
    // Cache initial data
    await this.cacheInitialData()
    
    console.log('Offline Service initialized successfully')
    return true
  }

  // Set up online/offline event listeners
  setupOnlineOfflineListeners() {
    const handleOnline = () => {
      this.isOnline = true
      console.log('Device is online')
      this.announceStatusChange('online')
      this.processOfflineQueue()
    }

    const handleOffline = () => {
      this.isOnline = false
      console.log('Device is offline')
      this.announceStatusChange('offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    this.eventListeners.push(
      { event: 'online', handler: handleOnline },
      { event: 'offline', handler: handleOffline }
    )
  }

  // Announce status changes
  announceStatusChange(status) {
    const event = new CustomEvent('offlineStatusChange', {
      detail: { status, timestamp: new Date() }
    })
    window.dispatchEvent(event)
  }

  // Check if device is online
  checkOnlineStatus() {
    return navigator.onLine
  }

  // Get detailed connection status
  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      connectionType: this.getConnectionType(),
      lastSeen: this.getLastSeenTime(),
      offlineActions: this.offlineQueue.length
    }
  }

  // Get connection type (if available)
  getConnectionType() {
    if ('connection' in navigator) {
      return navigator.connection.effectiveType || 'unknown'
    }
    return 'unknown'
  }

  // Get last seen time
  getLastSeenTime() {
    const timestamp = localStorage.getItem('engage360_last_seen')
    return timestamp ? new Date(timestamp) : null
  }

  // Update last seen time
  updateLastSeenTime() {
    localStorage.setItem('engage360_last_seen', new Date().toISOString())
  }

  // Cache data to local storage
  async cacheData(key, data, expiry = null) {
    try {
      const cacheData = {
        data: data,
        timestamp: new Date().toISOString(),
        expiry: expiry || (Date.now() + this.cacheExpiry)
      }
      
      localStorage.setItem(key, JSON.stringify(cacheData))
      console.log(`Data cached for key: ${key}`)
      return true
    } catch (error) {
      console.error('Error caching data:', error)
      return false
    }
  }

  // Retrieve data from cache
  async getCachedData(key) {
    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null

      const cacheData = JSON.parse(cached)
      
      // Check if cache is expired
      if (Date.now() > cacheData.expiry) {
        localStorage.removeItem(key)
        return null
      }

      return cacheData.data
    } catch (error) {
      console.error('Error retrieving cached data:', error)
      return null
    }
  }

  // Cache initial data when online
  async cacheInitialData() {
    if (!this.isOnline) return

    try {
      // Import services dynamically to avoid circular dependencies
      const { firestoreService } = await import('./firestoreService')
      
      const [programs, users] = await Promise.all([
        firestoreService.getAllPrograms(),
        firestoreService.getAllUsers()
      ])

      await Promise.all([
        this.cacheData(this.storageKeys.PROGRAMS, programs),
        this.cacheData(this.storageKeys.USER_DATA, users)
      ])

      console.log('Initial data cached successfully')
    } catch (error) {
      console.error('Error caching initial data:', error)
    }
  }

  // Add action to offline queue
  addToOfflineQueue(action) {
    const queueItem = {
      id: this.generateId(),
      action: action,
      timestamp: new Date().toISOString(),
      retries: 0,
      maxRetries: 3
    }

    this.offlineQueue.push(queueItem)
    this.saveOfflineQueue()
    
    console.log(`Action added to offline queue: ${action.type}`)
    return queueItem.id
  }

  // Process offline queue when back online
  async processOfflineQueue() {
    if (this.syncInProgress || this.offlineQueue.length === 0) return

    this.syncInProgress = true
    console.log(`Processing ${this.offlineQueue.length} offline actions...`)

    const { firestoreService } = await import('./firestoreService')
    const processedItems = []

    for (const item of this.offlineQueue) {
      try {
        await this.executeOfflineAction(item, firestoreService)
        processedItems.push(item.id)
        console.log(`Successfully processed offline action: ${item.action.type}`)
      } catch (error) {
        console.error(`Failed to process offline action: ${item.action.type}`, error)
        
        item.retries++
        if (item.retries >= item.maxRetries) {
          processedItems.push(item.id)
          console.log(`Max retries reached for action: ${item.action.type}`)
        }
      }
    }

    // Remove processed items
    this.offlineQueue = this.offlineQueue.filter(item => !processedItems.includes(item.id))
    this.saveOfflineQueue()

    this.syncInProgress = false
    console.log(`Offline queue processing complete. ${processedItems.length} actions processed.`)
  }

  // Execute offline action
  async executeOfflineAction(item, firestoreService) {
    const { action } = item

    switch (action.type) {
      case 'CREATE_BOOKING':
        await firestoreService.createBooking(action.data)
        break
      case 'UPDATE_BOOKING':
        await firestoreService.updateBooking(action.bookingId, action.data)
        break
      case 'CANCEL_BOOKING':
        await firestoreService.updateBooking(action.bookingId, { status: 'cancelled' })
        break
      case 'SEND_EMAIL':
        const { emailService } = await import('./emailService')
        await emailService.sendBulkEmail(action.campaign, action.recipients)
        break
      case 'UPDATE_USER_PROFILE':
        await firestoreService.updateUser(action.userId, action.data)
        break
      case 'ENROLL_PROGRAM':
        await firestoreService.enrollUserInProgram(action.userId, action.programId)
        break
      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }
  }

  // Load offline queue from storage
  async loadOfflineQueue() {
    try {
      const cached = await this.getCachedData(this.storageKeys.OFFLINE_QUEUE)
      if (cached) {
        this.offlineQueue = cached
        console.log(`Loaded ${this.offlineQueue.length} items from offline queue`)
      }
    } catch (error) {
      console.error('Error loading offline queue:', error)
    }
  }

  // Save offline queue to storage
  saveOfflineQueue() {
    this.cacheData(this.storageKeys.OFFLINE_QUEUE, this.offlineQueue)
  }

  // Set up periodic sync
  setupPeriodicSync() {
    // Sync every 5 minutes when online
    setInterval(() => {
      if (this.isOnline && this.offlineQueue.length > 0) {
        this.processOfflineQueue()
      }
    }, 5 * 60 * 1000)

    // Update last seen time every minute
    setInterval(() => {
      this.updateLastSeenTime()
    }, 60 * 1000)
  }

  // Get offline queue status
  getOfflineQueueStatus() {
    return {
      totalActions: this.offlineQueue.length,
      actions: this.offlineQueue.map(item => ({
        id: item.id,
        type: item.action.type,
        timestamp: item.timestamp,
        retries: item.retries
      })),
      syncInProgress: this.syncInProgress
    }
  }

  // Clear offline queue
  clearOfflineQueue() {
    this.offlineQueue = []
    this.saveOfflineQueue()
    console.log('Offline queue cleared')
  }

  // Get cached programs
  async getCachedPrograms() {
    return await this.getCachedData(this.storageKeys.PROGRAMS)
  }

  // Get cached user data
  async getCachedUserData() {
    return await this.getCachedData(this.storageKeys.USER_DATA)
  }

  // Get cached bookings
  async getCachedBookings() {
    return await this.getCachedData(this.storageKeys.BOOKINGS)
  }

  // Store user preferences offline
  storeUserPreferences(userId, preferences) {
    const key = `engage360_preferences_${userId}`
    this.cacheData(key, preferences)
  }

  // Get user preferences offline
  async getUserPreferences(userId) {
    const key = `engage360_preferences_${userId}`
    return await this.getCachedData(key)
  }

  // Store form data offline
  storeFormData(formId, data) {
    const key = `engage360_form_${formId}`
    this.cacheData(key, data, Date.now() + (7 * 24 * 60 * 60 * 1000)) // 7 days
  }

  // Get form data offline
  async getFormData(formId) {
    const key = `engage360_form_${formId}`
    return await this.getCachedData(key)
  }

  // Store search history offline
  storeSearchHistory(query, results) {
    const key = 'engage360_search_history'
    this.getCachedData(key).then(history => {
      const searchHistory = history || []
      searchHistory.unshift({
        query,
        results: results.length,
        timestamp: new Date().toISOString()
      })
      
      // Keep only last 50 searches
      if (searchHistory.length > 50) {
        searchHistory.splice(50)
      }
      
      this.cacheData(key, searchHistory)
    })
  }

  // Get search history offline
  async getSearchHistory() {
    return await this.getCachedData('engage360_search_history')
  }

  // Store analytics data offline
  storeAnalyticsData(data) {
    const key = 'engage360_analytics'
    this.getCachedData(key).then(existing => {
      const analytics = existing || []
      analytics.push({
        ...data,
        timestamp: new Date().toISOString()
      })
      
      // Keep only last 100 entries
      if (analytics.length > 100) {
        analytics.splice(0, analytics.length - 100)
      }
      
      this.cacheData(key, analytics)
    })
  }

  // Get analytics data offline
  async getAnalyticsData() {
    return await this.getCachedData('engage360_analytics')
  }

  // Clear all cached data
  clearAllCache() {
    Object.values(this.storageKeys).forEach(key => {
      localStorage.removeItem(key)
    })
    
    // Clear other Engage360 related data
    const keys = Object.keys(localStorage).filter(key => key.startsWith('engage360_'))
    keys.forEach(key => localStorage.removeItem(key))
    
    console.log('All cached data cleared')
  }

  // Get storage usage
  getStorageUsage() {
    let totalSize = 0
    const usage = {}
    
    Object.entries(this.storageKeys).forEach(([name, key]) => {
      const data = localStorage.getItem(key)
      if (data) {
        const size = new Blob([data]).size
        usage[name] = {
          key,
          size,
          sizeFormatted: this.formatBytes(size)
        }
        totalSize += size
      }
    })
    
    return {
      total: totalSize,
      totalFormatted: this.formatBytes(totalSize),
      breakdown: usage
    }
  }

  // Format bytes to human readable format
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Cleanup
  destroy() {
    this.eventListeners.forEach(({ event, handler }) => {
      window.removeEventListener(event, handler)
    })
    this.eventListeners = []
  }
}

// Export singleton instance
export const offlineService = new OfflineService()
export default offlineService
