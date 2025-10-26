// API Routes Service for Third-Party Access
// This service provides REST API endpoints for external applications

import { firestoreService } from './firestoreService'
import { firebaseAuthStore } from '@/stores/firebaseAuth'

class APIService {
  constructor() {
    this.baseURL = '/api/v1'
    this.apiKey = null
    this.rateLimits = new Map() // Track API usage per key
  }

  // Initialize API service
  async initialize() {
    console.log('API Service initialized')
    return true
  }

  // Generate API key for third-party access
  async generateAPIKey(userId, permissions = ['read']) {
    try {
      const apiKey = this.generateRandomKey()
      const keyData = {
        key: apiKey,
        userId: userId,
        permissions: permissions,
        createdAt: new Date(),
        lastUsed: null,
        usageCount: 0,
        isActive: true
      }
      
      await firestoreService.createAPIKey(keyData)
      return apiKey
    } catch (error) {
      console.error('Error generating API key:', error)
      throw error
    }
  }

  // Validate API key
  async validateAPIKey(apiKey) {
    try {
      const keyData = await firestoreService.getAPIKey(apiKey)
      
      if (!keyData || !keyData.isActive) {
        throw new Error('Invalid or inactive API key')
      }
      
      // Update usage statistics
      await firestoreService.updateAPIKey(apiKey, {
        lastUsed: new Date(),
        usageCount: (keyData.usageCount || 0) + 1
      })
      
      return keyData
    } catch (error) {
      console.error('Error validating API key:', error)
      throw error
    }
  }

  // Check rate limits
  checkRateLimit(apiKey, endpoint) {
    const key = `${apiKey}-${endpoint}`
    const now = Date.now()
    const windowMs = 15 * 60 * 1000 // 15 minutes
    const maxRequests = 100 // Max requests per window
    
    if (!this.rateLimits.has(key)) {
      this.rateLimits.set(key, { count: 1, resetTime: now + windowMs })
      return true
    }
    
    const limit = this.rateLimits.get(key)
    
    if (now > limit.resetTime) {
      // Reset window
      this.rateLimits.set(key, { count: 1, resetTime: now + windowMs })
      return true
    }
    
    if (limit.count >= maxRequests) {
      return false
    }
    
    limit.count++
    return true
  }

  // API Route Handlers
  async handleGetUsers(request) {
    try {
      const { apiKey, queryParams } = request
      
      // Validate API key
      const keyData = await this.validateAPIKey(apiKey)
      
      // Check permissions
      if (!keyData.permissions.includes('read')) {
        throw new Error('Insufficient permissions')
      }
      
      // Check rate limit
      if (!this.checkRateLimit(apiKey, 'users')) {
        throw new Error('Rate limit exceeded')
      }
      
      // Get users with optional filtering
      const users = await firestoreService.getAllUsers()
      
      // Apply filters if provided
      let filteredUsers = users
      
      if (queryParams.role) {
        filteredUsers = filteredUsers.filter(user => user.role === queryParams.role)
      }
      
      if (queryParams.program) {
        filteredUsers = filteredUsers.filter(user => 
          user.enrolledPrograms && user.enrolledPrograms.includes(queryParams.program)
        )
      }
      
      if (queryParams.status) {
        filteredUsers = filteredUsers.filter(user => user.status === queryParams.status)
      }
      
      // Limit results
      const limit = parseInt(queryParams.limit) || 50
      const offset = parseInt(queryParams.offset) || 0
      
      const paginatedUsers = filteredUsers.slice(offset, offset + limit)
      
      return {
        success: true,
        data: paginatedUsers,
        pagination: {
          total: filteredUsers.length,
          limit: limit,
          offset: offset,
          hasMore: offset + limit < filteredUsers.length
        },
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  async handleGetPrograms(request) {
    try {
      const { apiKey, queryParams } = request
      
      // Validate API key
      const keyData = await this.validateAPIKey(apiKey)
      
      // Check permissions
      if (!keyData.permissions.includes('read')) {
        throw new Error('Insufficient permissions')
      }
      
      // Check rate limit
      if (!this.checkRateLimit(apiKey, 'programs')) {
        throw new Error('Rate limit exceeded')
      }
      
      // Get programs
      const programs = await firestoreService.getAllPrograms()
      
      // Apply filters
      let filteredPrograms = programs
      
      if (queryParams.status) {
        filteredPrograms = filteredPrograms.filter(program => program.status === queryParams.status)
      }
      
      if (queryParams.category) {
        filteredPrograms = filteredPrograms.filter(program => program.category === queryParams.category)
      }
      
      if (queryParams.location) {
        filteredPrograms = filteredPrograms.filter(program => 
          program.location && program.location.toLowerCase().includes(queryParams.location.toLowerCase())
        )
      }
      
      // Limit results
      const limit = parseInt(queryParams.limit) || 50
      const offset = parseInt(queryParams.offset) || 0
      
      const paginatedPrograms = filteredPrograms.slice(offset, offset + limit)
      
      return {
        success: true,
        data: paginatedPrograms,
        pagination: {
          total: filteredPrograms.length,
          limit: limit,
          offset: offset,
          hasMore: offset + limit < filteredPrograms.length
        },
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  async handleGetBookings(request) {
    try {
      const { apiKey, queryParams } = request
      
      // Validate API key
      const keyData = await this.validateAPIKey(apiKey)
      
      // Check permissions
      if (!keyData.permissions.includes('read')) {
        throw new Error('Insufficient permissions')
      }
      
      // Check rate limit
      if (!this.checkRateLimit(apiKey, 'bookings')) {
        throw new Error('Rate limit exceeded')
      }
      
      // Get bookings
      let bookings = []
      
      if (queryParams.userId) {
        bookings = await firestoreService.getUserBookings(queryParams.userId)
      } else if (queryParams.programId) {
        bookings = await firestoreService.getProgramBookings(queryParams.programId)
      } else {
        bookings = await firestoreService.getAllBookings()
      }
      
      // Apply filters
      let filteredBookings = bookings
      
      if (queryParams.status) {
        filteredBookings = filteredBookings.filter(booking => booking.status === queryParams.status)
      }
      
      if (queryParams.dateFrom) {
        const fromDate = new Date(queryParams.dateFrom)
        filteredBookings = filteredBookings.filter(booking => new Date(booking.date) >= fromDate)
      }
      
      if (queryParams.dateTo) {
        const toDate = new Date(queryParams.dateTo)
        filteredBookings = filteredBookings.filter(booking => new Date(booking.date) <= toDate)
      }
      
      // Limit results
      const limit = parseInt(queryParams.limit) || 50
      const offset = parseInt(queryParams.offset) || 0
      
      const paginatedBookings = filteredBookings.slice(offset, offset + limit)
      
      return {
        success: true,
        data: paginatedBookings,
        pagination: {
          total: filteredBookings.length,
          limit: limit,
          offset: offset,
          hasMore: offset + limit < filteredBookings.length
        },
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  async handleGetAnalytics(request) {
    try {
      const { apiKey, queryParams } = request
      
      // Validate API key
      const keyData = await this.validateAPIKey(apiKey)
      
      // Check permissions
      if (!keyData.permissions.includes('read')) {
        throw new Error('Insufficient permissions')
      }
      
      // Check rate limit
      if (!this.checkRateLimit(apiKey, 'analytics')) {
        throw new Error('Rate limit exceeded')
      }
      
      // Get analytics data
      const analytics = await this.generateAnalytics(queryParams)
      
      return {
        success: true,
        data: analytics,
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  // Generate analytics data
  async generateAnalytics(queryParams = {}) {
    const period = queryParams.period || '30d' // 7d, 30d, 90d, 1y
    
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }
    
    // Get data
    const [users, programs, bookings, emails] = await Promise.all([
      firestoreService.getAllUsers(),
      firestoreService.getAllPrograms(),
      firestoreService.getAllBookings(),
      firestoreService.getEmailCampaigns()
    ])
    
    // Filter data by date range
    const recentUsers = users.filter(user => new Date(user.createdAt) >= startDate)
    const recentBookings = bookings.filter(booking => new Date(booking.createdAt) >= startDate)
    const recentEmails = emails.filter(email => new Date(email.sentAt) >= startDate)
    
    // Calculate metrics
    const analytics = {
      period: period,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      overview: {
        totalUsers: users.length,
        newUsers: recentUsers.length,
        totalPrograms: programs.length,
        activePrograms: programs.filter(p => p.status === 'active').length,
        totalBookings: bookings.length,
        recentBookings: recentBookings.length,
        totalEmails: emails.length,
        recentEmails: recentEmails.length
      },
      userMetrics: {
        byRole: this.groupBy(users, 'role'),
        byStatus: this.groupBy(users, 'status'),
        enrollmentRate: this.calculateEnrollmentRate(users, programs)
      },
      programMetrics: {
        byCategory: this.groupBy(programs, 'category'),
        byStatus: this.groupBy(programs, 'status'),
        averageCapacity: this.calculateAverageCapacity(programs)
      },
      bookingMetrics: {
        byStatus: this.groupBy(bookings, 'status'),
        byProgram: this.groupBy(bookings, 'programId'),
        averageBookingsPerUser: bookings.length / users.length
      },
      emailMetrics: {
        byCategory: this.groupBy(emails, 'category'),
        byStatus: this.groupBy(emails, 'status'),
        averageOpenRate: this.calculateAverageOpenRate(emails),
        averageClickRate: this.calculateAverageClickRate(emails)
      }
    }
    
    return analytics
  }

  // Utility methods
  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const value = item[key] || 'Unknown'
      groups[value] = (groups[value] || 0) + 1
      return groups
    }, {})
  }

  calculateEnrollmentRate(users, programs) {
    const enrolledUsers = users.filter(user => user.enrolledPrograms && user.enrolledPrograms.length > 0)
    return users.length > 0 ? (enrolledUsers.length / users.length) * 100 : 0
  }

  calculateAverageCapacity(programs) {
    const activePrograms = programs.filter(p => p.status === 'active' && p.maxCapacity)
    return activePrograms.length > 0 ? 
      activePrograms.reduce((sum, p) => sum + p.maxCapacity, 0) / activePrograms.length : 0
  }

  calculateAverageOpenRate(emails) {
    const sentEmails = emails.filter(e => e.status === 'sent' && e.openRate !== undefined)
    return sentEmails.length > 0 ? 
      sentEmails.reduce((sum, e) => sum + e.openRate, 0) / sentEmails.length : 0
  }

  calculateAverageClickRate(emails) {
    const sentEmails = emails.filter(e => e.status === 'sent' && e.clickRate !== undefined)
    return sentEmails.length > 0 ? 
      sentEmails.reduce((sum, e) => sum + e.clickRate, 0) / sentEmails.length : 0
  }

  generateRandomKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // API Documentation
  getAPIDocumentation() {
    return {
      version: '1.0.0',
      baseURL: this.baseURL,
      authentication: {
        type: 'API Key',
        header: 'X-API-Key',
        description: 'Include your API key in the X-API-Key header'
      },
      rateLimits: {
        requestsPerWindow: 100,
        windowSize: '15 minutes',
        description: 'Rate limits are applied per API key and endpoint'
      },
      endpoints: {
        'GET /users': {
          description: 'Retrieve users with optional filtering',
          parameters: {
            role: 'Filter by user role (admin, user)',
            program: 'Filter by enrolled program ID',
            status: 'Filter by user status',
            limit: 'Number of results to return (default: 50)',
            offset: 'Number of results to skip (default: 0)'
          },
          response: {
            success: 'boolean',
            data: 'array of user objects',
            pagination: 'pagination metadata',
            timestamp: 'ISO timestamp'
          }
        },
        'GET /programs': {
          description: 'Retrieve programs with optional filtering',
          parameters: {
            status: 'Filter by program status (active, inactive)',
            category: 'Filter by program category',
            location: 'Filter by location (partial match)',
            limit: 'Number of results to return (default: 50)',
            offset: 'Number of results to skip (default: 0)'
          },
          response: {
            success: 'boolean',
            data: 'array of program objects',
            pagination: 'pagination metadata',
            timestamp: 'ISO timestamp'
          }
        },
        'GET /bookings': {
          description: 'Retrieve bookings with optional filtering',
          parameters: {
            userId: 'Filter by specific user ID',
            programId: 'Filter by specific program ID',
            status: 'Filter by booking status',
            dateFrom: 'Filter bookings from date (ISO format)',
            dateTo: 'Filter bookings to date (ISO format)',
            limit: 'Number of results to return (default: 50)',
            offset: 'Number of results to skip (default: 0)'
          },
          response: {
            success: 'boolean',
            data: 'array of booking objects',
            pagination: 'pagination metadata',
            timestamp: 'ISO timestamp'
          }
        },
        'GET /analytics': {
          description: 'Retrieve analytics and metrics data',
          parameters: {
            period: 'Time period (7d, 30d, 90d, 1y)'
          },
          response: {
            success: 'boolean',
            data: 'analytics object with metrics',
            timestamp: 'ISO timestamp'
          }
        }
      },
      examples: {
        'Get all users': 'GET /api/v1/users',
        'Get active programs': 'GET /api/v1/programs?status=active',
        'Get user bookings': 'GET /api/v1/bookings?userId=123&status=confirmed',
        'Get analytics': 'GET /api/v1/analytics?period=30d'
      }
    }
  }
}

// Export singleton instance
export const apiService = new APIService()
export default apiService
