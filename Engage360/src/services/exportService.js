// src/services/exportService.js
import { firestoreService } from './firestoreService'

export const exportService = {
  // Export data in various formats
  async exportData(dataType, format, filters = {}) {
    try {
      let data = []
      
      // Fetch data based on type
      switch (dataType) {
        case 'users':
          data = await firestoreService.getAllUsers()
          break
        case 'registrations':
          data = await firestoreService.getAllRegistrations()
          break
        case 'programs':
          data = await firestoreService.getAllPrograms()
          break
        case 'admin-activity':
          data = await firestoreService.getAdminActivityLog()
          break
        default:
          throw new Error('Invalid data type')
      }

      // Apply filters
      data = this.applyFilters(data, filters)

      // Generate export based on format
      switch (format) {
        case 'csv':
          return this.generateCSV(data, dataType)
        case 'pdf':
          return this.generatePDF(data, dataType)
        case 'excel':
          return this.generateExcel(data, dataType)
        case 'json':
          return this.generateJSON(data, dataType)
        default:
          throw new Error('Invalid format')
      }
    } catch (error) {
      console.error('Export error:', error)
      throw error
    }
  },

  // Apply filters to data
  applyFilters(data, filters) {
    let filteredData = [...data]

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.createdAt?.toDate?.() || item.createdAt || item.timestamp)
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null
        const toDate = filters.dateTo ? new Date(filters.dateTo) : null

        if (fromDate && itemDate < fromDate) return false
        if (toDate && itemDate > toDate) return false
        return true
      })
    }

    // Text search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredData = filteredData.filter(item => {
        return Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchTerm)
        )
      })
    }

    // Status filter
    if (filters.status) {
      filteredData = filteredData.filter(item => 
        item.status === filters.status || item.emailVerified === (filters.status === 'verified')
      )
    }

    // Role filter
    if (filters.role) {
      filteredData = filteredData.filter(item => 
        item.role === filters.role || item.isAdmin === (filters.role === 'admin')
      )
    }

    return filteredData
  },

  // Generate CSV export
  generateCSV(data, dataType) {
    if (data.length === 0) {
      return this.createBlob('No data available', 'text/csv')
    }

    const headers = this.getHeaders(dataType)
    const csvContent = [
      headers.join(','),
      ...data.map(record => 
        headers.map(header => {
          const value = this.getFieldValue(record, header)
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
      )
    ].join('\n')

    return this.createBlob(csvContent, 'text/csv')
  },

  // Generate PDF export
  generatePDF(data, dataType) {
    return new Promise((resolve) => {
      // Create a simple PDF using browser's print functionality
      const printWindow = window.open('', '_blank')
      const htmlContent = this.generatePDFHTML(data, dataType)
      
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // For now, we'll use a simple approach
      // In a real implementation, you'd use a library like jsPDF
      resolve(this.createBlob(htmlContent, 'text/html'))
    })
  },

  // Generate Excel export
  generateExcel(data, dataType) {
    // Create a simple Excel-compatible CSV
    // In a real implementation, you'd use a library like SheetJS
    const headers = this.getHeaders(dataType)
    const csvContent = [
      headers.join('\t'),
      ...data.map(record => 
        headers.map(header => {
          const value = this.getFieldValue(record, header)
          return String(value).replace(/\t/g, ' ')
        }).join('\t')
      )
    ].join('\n')

    return this.createBlob(csvContent, 'application/vnd.ms-excel')
  },

  // Generate JSON export
  generateJSON(data, dataType) {
    const jsonData = {
      exportInfo: {
        dataType,
        exportDate: new Date().toISOString(),
        recordCount: data.length
      },
      data
    }

    return this.createBlob(JSON.stringify(jsonData, null, 2), 'application/json')
  },

  // Get headers for data type
  getHeaders(dataType) {
    const headerMap = {
      users: ['Name', 'Email', 'Role', 'Email Verified', 'Status', 'Created At'],
      registrations: ['Name', 'Email', 'Phone', 'Fitness Level', 'Programs', 'Health Conditions', 'Submitted At'],
      programs: ['Name', 'Description', 'Level', 'Duration', 'Schedule', 'Price', 'Status', 'Created At'],
      'admin-activity': ['Admin Email', 'Action', 'Target Email', 'Details', 'Timestamp']
    }

    return headerMap[dataType] || []
  },

  // Get field value from record
  getFieldValue(record, header) {
    const fieldMap = {
      'Name': record.displayName || record.name || `${record.firstName || ''} ${record.lastName || ''}`.trim(),
      'Email': record.email || '',
      'Role': record.role || (record.isAdmin ? 'admin' : 'user'),
      'Email Verified': record.emailVerified ? 'Yes' : 'No',
      'Status': record.status || 'active',
      'Created At': this.formatDate(record.createdAt),
      'Phone': record.phone || '',
      'Fitness Level': record.fitnessLevel || '',
      'Programs': Array.isArray(record.programs) ? record.programs.join(', ') : record.programs || '',
      'Health Conditions': record.healthConditions || '',
      'Submitted At': this.formatDate(record.submitted || record.createdAt),
      'Description': record.description || '',
      'Level': record.level || '',
      'Duration': record.duration || '',
      'Schedule': record.schedule || '',
      'Price': record.price || '',
      'Admin Email': record.adminEmail || '',
      'Action': record.action || '',
      'Target Email': record.targetEmail || '',
      'Details': record.details || '',
      'Timestamp': this.formatDate(record.timestamp || record.createdAt)
    }

    return fieldMap[header] || ''
  },

  // Format date for display
  formatDate(date) {
    if (!date) return 'N/A'
    const d = new Date(date.toDate?.() || date)
    return isNaN(d) ? 'N/A' : d.toLocaleString()
  },

  // Create blob for download
  createBlob(content, mimeType) {
    return new Blob([content], { type: mimeType })
  },

  // Download file
  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },

  // Generate PDF HTML content
  generatePDFHTML(data, dataType) {
    const headers = this.getHeaders(dataType)
    const title = `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Export Report`
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f8f9fa; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .export-info { margin-bottom: 20px; color: #666; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="export-info">
          <p><strong>Export Date:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Total Records:</strong> ${data.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(record => `
              <tr>
                ${headers.map(header => `<td>${this.getFieldValue(record, header)}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `
  },

  // Get export statistics
  getExportStats(data) {
    return {
      totalRecords: data.length,
      exportDate: new Date().toLocaleString(),
      dataSize: JSON.stringify(data).length,
      estimatedFileSize: this.estimateFileSize(data)
    }
  },

  // Estimate file size
  estimateFileSize(data) {
    const jsonSize = JSON.stringify(data).length
    return {
      csv: Math.round(jsonSize * 0.8),
      pdf: Math.round(jsonSize * 1.2),
      excel: Math.round(jsonSize * 0.9),
      json: jsonSize
    }
  },

  // Validate export parameters
  validateExportParams(dataType, format, filters) {
    const validDataTypes = ['users', 'registrations', 'programs', 'admin-activity']
    const validFormats = ['csv', 'pdf', 'excel', 'json']

    if (!validDataTypes.includes(dataType)) {
      throw new Error('Invalid data type')
    }

    if (!validFormats.includes(format)) {
      throw new Error('Invalid format')
    }

    if (filters.dateFrom && filters.dateTo) {
      const fromDate = new Date(filters.dateFrom)
      const toDate = new Date(filters.dateTo)
      if (fromDate > toDate) {
        throw new Error('Start date cannot be after end date')
      }
    }

    return true
  }
}
