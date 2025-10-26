// Accessibility Service - WCAG 2.1 AA Compliance
class AccessibilityService {
  constructor() {
    this.isInitialized = false
    this.announcer = null
    this.focusTrap = null
    this.skipLinks = []
    this.keyboardShortcuts = new Map()
    this.ariaLiveRegions = new Map()
    
    // WCAG 2.1 AA Color Contrast Ratios
    this.contrastRatios = {
      normal: 4.5, // AA level for normal text
      large: 3.0,  // AA level for large text (18pt+ or 14pt+ bold)
      enhanced: 7.0 // AAA level for enhanced contrast
    }
    
    // Common ARIA roles and properties
    this.ariaRoles = {
      button: 'button',
      navigation: 'navigation',
      main: 'main',
      banner: 'banner',
      contentinfo: 'contentinfo',
      complementary: 'complementary',
      search: 'search',
      form: 'form',
      region: 'region',
      dialog: 'dialog',
      alert: 'alert',
      status: 'status',
      log: 'log',
      marquee: 'marquee',
      timer: 'timer'
    }
  }

  // Initialize accessibility features
  async initialize() {
    if (this.isInitialized) return

    try {
      console.log('Initializing Accessibility Service...')
      
      // Create screen reader announcer
      this.createAnnouncer()
      
      // Setup keyboard navigation
      this.setupKeyboardNavigation()
      
      // Setup focus management
      this.setupFocusManagement()
      
      // Setup skip links
      this.setupSkipLinks()
      
      // Setup ARIA live regions
      this.setupAriaLiveRegions()
      
      // Setup color contrast monitoring
      this.setupColorContrastMonitoring()
      
      // Setup reduced motion support
      this.setupReducedMotion()
      
      this.isInitialized = true
      console.log('Accessibility Service initialized successfully')
      
      // Announce initialization
      this.announce('Accessibility features have been enabled')
      
    } catch (error) {
      console.error('Failed to initialize accessibility service:', error)
      throw error
    }
  }

  // Create screen reader announcer
  createAnnouncer() {
    // Create aria-live region for announcements
    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', 'polite')
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    announcer.id = 'accessibility-announcer'
    
    // Add to document
    document.body.appendChild(announcer)
    this.announcer = announcer
  }

  // Announce messages to screen readers
  announce(message, priority = 'polite') {
    if (!this.announcer) return
    
    const announcer = this.announcer
    announcer.setAttribute('aria-live', priority)
    announcer.textContent = message
    
    // Clear after announcement
    setTimeout(() => {
      announcer.textContent = ''
    }, 1000)
  }

  // Setup keyboard navigation
  setupKeyboardNavigation() {
    // Add keyboard event listeners
    document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this))
    
    // Register common keyboard shortcuts
    this.registerKeyboardShortcut('Alt+1', () => this.focusMainContent(), 'Focus main content')
    this.registerKeyboardShortcut('Alt+2', () => this.focusNavigation(), 'Focus navigation')
    this.registerKeyboardShortcut('Alt+3', () => this.focusSearch(), 'Focus search')
    this.registerKeyboardShortcut('Escape', () => this.handleEscapeKey(), 'Close dialogs or menus')
    this.registerKeyboardShortcut('Tab', () => this.handleTabNavigation(), 'Navigate focusable elements')
  }

  // Handle keyboard navigation
  handleKeyboardNavigation(event) {
    if (!event || typeof event !== 'object') return
    const { key, ctrlKey, altKey, shiftKey } = event
    
    // Check for registered shortcuts
    const shortcut = this.getKeyboardShortcut(event)
    if (shortcut) {
      event.preventDefault()
      shortcut.handler()
      this.announce(`Activated: ${shortcut.description}`)
      return
    }
    
    // Handle specific key combinations
    switch (key) {
      case 'Tab':
        this.handleTabNavigation(event)
        break
      case 'Enter':
      case ' ':
        this.handleActivation(event)
        break
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        this.handleArrowNavigation(event)
        break
    }
  }

  // Register keyboard shortcut
  registerKeyboardShortcut(shortcut, handler, description) {
    this.keyboardShortcuts.set(shortcut, { handler, description })
  }

  // Get keyboard shortcut
  getKeyboardShortcut(event) {
    const { key, ctrlKey, altKey, shiftKey } = event
    let shortcut = ''
    
    if (ctrlKey) shortcut += 'Ctrl+'
    if (altKey) shortcut += 'Alt+'
    if (shiftKey) shortcut += 'Shift+'
    shortcut += key
    
    return this.keyboardShortcuts.get(shortcut)
  }

  // Handle tab navigation
  handleTabNavigation(event) {
    if (!event) return
    const focusableElements = this.getFocusableElements()
    const currentIndex = focusableElements.indexOf(document.activeElement)
    
    if (event.shiftKey) {
      // Shift+Tab - move backwards
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1
      focusableElements[prevIndex]?.focus()
    } else {
      // Tab - move forwards
      const nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0
      focusableElements[nextIndex]?.focus()
    }
  }

  // Handle activation (Enter/Space)
  handleActivation(event) {
    const target = event.target
    
    if (target.getAttribute('role') === 'button' || 
        target.tagName === 'BUTTON' ||
        target.getAttribute('tabindex') === '0') {
      event.preventDefault()
      target.click()
    }
  }

  // Handle arrow navigation
  handleArrowNavigation(event) {
    const target = event.target
    const role = target.getAttribute('role')
    
    if (role === 'menuitem' || role === 'tab' || role === 'option') {
      event.preventDefault()
      this.navigateWithArrows(target, event.key)
    }
  }

  // Navigate with arrow keys
  navigateWithArrows(element, direction) {
    const container = element.closest('[role="menu"], [role="tablist"], [role="listbox"]')
    if (!container) return
    
    const items = Array.from(container.querySelectorAll('[role="menuitem"], [role="tab"], [role="option"]'))
    const currentIndex = items.indexOf(element)
    
    let nextIndex = currentIndex
    
    switch (direction) {
      case 'ArrowUp':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
        break
      case 'ArrowDown':
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
        break
      case 'ArrowLeft':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
        break
      case 'ArrowRight':
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
        break
    }
    
    items[nextIndex]?.focus()
  }

  // Setup focus management
  setupFocusManagement() {
    // Track focus changes
    document.addEventListener('focusin', this.handleFocusIn.bind(this))
    document.addEventListener('focusout', this.handleFocusOut.bind(this))
    
    // Setup focus trap for modals
    this.setupFocusTrap()
  }

  // Handle focus in
  handleFocusIn(event) {
    const target = event.target
    
    // Announce focus changes for important elements
    if (target.getAttribute('aria-label') || target.getAttribute('aria-labelledby')) {
      const label = target.getAttribute('aria-label') || 
                   document.getElementById(target.getAttribute('aria-labelledby'))?.textContent
      if (label) {
        this.announce(`Focused: ${label}`)
      }
    }
    
    // Add focus indicator
    target.classList.add('focus-visible')
  }

  // Handle focus out
  handleFocusOut(event) {
    const target = event.target
    target.classList.remove('focus-visible')
  }

  // Setup focus trap
  setupFocusTrap() {
    // This will be used for modal dialogs
    this.focusTrap = {
      trap: (element) => {
        const focusableElements = this.getFocusableElements(element)
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]
        
        const trapHandler = (event) => {
          if (event.key === 'Tab') {
            if (event.shiftKey) {
              if (document.activeElement === firstElement) {
                event.preventDefault()
                lastElement?.focus()
              }
            } else {
              if (document.activeElement === lastElement) {
                event.preventDefault()
                firstElement?.focus()
              }
            }
          }
        }
        
        element.addEventListener('keydown', trapHandler)
        
        // Return cleanup function
        return () => {
          element.removeEventListener('keydown', trapHandler)
        }
      }
    }
  }

  // Setup skip links
  setupSkipLinks() {
    const skipLinks = [
      { href: '#main-content', text: 'Skip to main content' },
      { href: '#navigation', text: 'Skip to navigation' },
      { href: '#search', text: 'Skip to search' }
    ]
    
    skipLinks.forEach(link => {
      const skipLink = document.createElement('a')
      skipLink.href = link.href
      skipLink.textContent = link.text
      skipLink.className = 'skip-link sr-only'
      skipLink.addEventListener('click', (e) => {
        e.preventDefault()
        const target = document.querySelector(link.href)
        if (target) {
          target.focus()
          target.scrollIntoView()
          this.announce(`Skipped to ${link.text.toLowerCase()}`)
        }
      })
      
      document.body.insertBefore(skipLink, document.body.firstChild)
      this.skipLinks.push(skipLink)
    })
  }

  // Setup ARIA live regions
  setupAriaLiveRegions() {
    const regions = [
      { id: 'status', type: 'polite', description: 'Status updates' },
      { id: 'alerts', type: 'assertive', description: 'Important alerts' },
      { id: 'log', type: 'polite', description: 'Activity log' }
    ]
    
    regions.forEach(region => {
      const element = document.createElement('div')
      element.id = region.id
      element.setAttribute('aria-live', region.type)
      element.setAttribute('aria-atomic', 'true')
      element.className = 'sr-only'
      
      document.body.appendChild(element)
      this.ariaLiveRegions.set(region.id, element)
    })
  }

  // Setup color contrast monitoring
  setupColorContrastMonitoring() {
    // Only run contrast check on page load, not continuously
    // This prevents performance issues and the parsing errors
    setTimeout(() => {
      this.checkColorContrast()
    }, 2000) // Wait for page to fully load
    
    // Optional: Monitor for style changes (disabled by default to prevent performance issues)
    if (false) { // Set to true if you want continuous monitoring
      const observer = new MutationObserver(() => {
        this.checkColorContrast()
      })
      
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['style', 'class']
      })
    }
  }

  // Check color contrast
  checkColorContrast() {
    const elements = document.querySelectorAll('*')
    const issues = []
    
    elements.forEach(element => {
      try {
        const styles = window.getComputedStyle(element)
        const color = styles.color
        const backgroundColor = styles.backgroundColor
        
        // Skip elements with transparent backgrounds or no text
        if (!color || 
            !backgroundColor || 
            backgroundColor === 'rgba(0, 0, 0, 0)' || 
            backgroundColor === 'transparent' ||
            element.offsetWidth === 0 ||
            element.offsetHeight === 0) {
          return
        }
        
        const contrast = this.calculateContrast(color, backgroundColor)
        
        if (contrast > 0) { // Only check if we could calculate contrast
          const fontSize = parseFloat(styles.fontSize)
          const fontWeight = styles.fontWeight
          
          const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700))
          const requiredContrast = isLargeText ? this.contrastRatios.large : this.contrastRatios.normal
          
          if (contrast < requiredContrast) {
            issues.push({
              element,
              contrast: contrast.toFixed(2),
              required: requiredContrast,
              isLargeText,
              color,
              backgroundColor
            })
          }
        }
      } catch (error) {
        // Skip elements that cause errors
        console.debug('Skipping element for contrast check:', error.message)
      }
    })
    
    if (issues.length > 0) {
      console.warn('Color contrast issues found:', issues)
      console.log('Detailed contrast issues:')
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. Element:`, issue.element)
        console.log(`   Text: "${issue.element.textContent?.trim().substring(0, 50)}..."`)
        console.log(`   Contrast: ${issue.contrast}:1 (required: ${issue.required}:1)`)
        console.log(`   Text color: ${issue.color}`)
        console.log(`   Background: ${issue.backgroundColor}`)
        console.log(`   Large text: ${issue.isLargeText}`)
        console.log('---')
      })
      this.announce(`Warning: ${issues.length} color contrast issues detected`)
    } else {
      console.log('Color contrast check completed - no issues found')
    }
  }

  // Calculate color contrast ratio
  calculateContrast(color1, color2) {
    const rgb1 = this.parseColor(color1)
    const rgb2 = this.parseColor(color2)
    
    if (!rgb1 || !rgb2) {
      return 1 // Return minimum contrast if colors can't be parsed
    }
    
    const lum1 = this.getLuminance(rgb1)
    const lum2 = this.getLuminance(rgb2)
    
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  }

  // Parse CSS color values to RGB
  parseColor(color) {
    if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
      return null
    }
    
    // Handle hex colors
    if (color.startsWith('#')) {
      return this.hexToRgb(color)
    }
    
    // Handle rgb/rgba colors
    if (color.startsWith('rgb')) {
      return this.rgbToRgb(color)
    }
    
    // Handle named colors
    const namedColor = this.namedColorToRgb(color)
    if (namedColor) {
      return namedColor
    }
    
    // Try to parse as CSS color using canvas
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = color
      const computedColor = ctx.fillStyle
      
      if (computedColor.startsWith('#')) {
        return this.hexToRgb(computedColor)
      } else if (computedColor.startsWith('rgb')) {
        return this.rgbToRgb(computedColor)
      }
    } catch (error) {
      console.warn('Could not parse color:', color)
    }
    
    return null
  }

  // Convert hex to RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  // Convert rgb/rgba to RGB
  rgbToRgb(rgb) {
    const result = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(rgb)
    return result ? {
      r: parseInt(result[1], 10),
      g: parseInt(result[2], 10),
      b: parseInt(result[3], 10)
    } : null
  }

  // Convert named colors to RGB
  namedColorToRgb(colorName) {
    const namedColors = {
      'black': { r: 0, g: 0, b: 0 },
      'white': { r: 255, g: 255, b: 255 },
      'red': { r: 255, g: 0, b: 0 },
      'green': { r: 0, g: 128, b: 0 },
      'blue': { r: 0, g: 0, b: 255 },
      'yellow': { r: 255, g: 255, b: 0 },
      'cyan': { r: 0, g: 255, b: 255 },
      'magenta': { r: 255, g: 0, b: 255 },
      'silver': { r: 192, g: 192, b: 192 },
      'gray': { r: 128, g: 128, b: 128 },
      'maroon': { r: 128, g: 0, b: 0 },
      'olive': { r: 128, g: 128, b: 0 },
      'lime': { r: 0, g: 255, b: 0 },
      'aqua': { r: 0, g: 255, b: 255 },
      'teal': { r: 0, g: 128, b: 128 },
      'navy': { r: 0, g: 0, b: 128 },
      'fuchsia': { r: 255, g: 0, b: 255 },
      'purple': { r: 128, g: 0, b: 128 }
    }
    
    return namedColors[colorName.toLowerCase()] || null
  }

  // Get luminance
  getLuminance(rgb) {
    const { r, g, b } = rgb
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  // Setup reduced motion support
  setupReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    if (prefersReducedMotion.matches) {
      document.documentElement.classList.add('reduced-motion')
      this.announce('Reduced motion mode enabled')
    }
    
    prefersReducedMotion.addEventListener('change', (e) => {
      if (e.matches) {
        document.documentElement.classList.add('reduced-motion')
        this.announce('Reduced motion mode enabled')
      } else {
        document.documentElement.classList.remove('reduced-motion')
        this.announce('Reduced motion mode disabled')
      }
    })
  }

  // Get focusable elements
  getFocusableElements(container = document) {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="tab"]',
      '[role="option"]'
    ]
    
    return Array.from(container.querySelectorAll(focusableSelectors.join(', ')))
      .filter(element => {
        const style = window.getComputedStyle(element)
        return style.display !== 'none' && style.visibility !== 'hidden'
      })
  }

  // Focus management methods
  focusMainContent() {
    const main = document.querySelector('main, [role="main"], #main-content')
    if (main) {
      main.focus()
      this.announce('Focused on main content')
    }
  }

  focusNavigation() {
    const nav = document.querySelector('nav, [role="navigation"], #navigation')
    if (nav) {
      const firstFocusable = this.getFocusableElements(nav)[0]
      if (firstFocusable) {
        firstFocusable.focus()
        this.announce('Focused on navigation')
      }
    }
  }

  focusSearch() {
    const search = document.querySelector('input[type="search"], [role="search"], #search')
    if (search) {
      search.focus()
      this.announce('Focused on search')
    }
  }

  handleEscapeKey() {
    // Close any open modals or menus
    const openModal = document.querySelector('[role="dialog"][aria-hidden="false"]')
    if (openModal) {
      const closeButton = openModal.querySelector('[aria-label*="close"], [aria-label*="Close"]')
      if (closeButton) {
        closeButton.click()
        this.announce('Dialog closed')
      }
    }
  }

  // Utility methods
  addAriaLabel(element, label) {
    element.setAttribute('aria-label', label)
  }

  addAriaDescribedBy(element, descriptionId) {
    element.setAttribute('aria-describedby', descriptionId)
  }

  addAriaExpanded(element, expanded) {
    element.setAttribute('aria-expanded', expanded.toString())
  }

  addAriaSelected(element, selected) {
    element.setAttribute('aria-selected', selected.toString())
  }

  addAriaChecked(element, checked) {
    element.setAttribute('aria-checked', checked.toString())
  }

  addAriaHidden(element, hidden) {
    element.setAttribute('aria-hidden', hidden.toString())
  }

  addAriaLive(element, message, priority = 'polite') {
    const liveRegion = this.ariaLiveRegions.get('status')
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority)
      liveRegion.textContent = message
      
      setTimeout(() => {
        liveRegion.textContent = ''
      }, 1000)
    }
  }

  // Cleanup
  destroy() {
    if (this.announcer) {
      this.announcer.remove()
    }
    
    this.skipLinks.forEach(link => link.remove())
    this.ariaLiveRegions.forEach(region => region.remove())
    
    this.isInitialized = false
  }
}

// Export singleton instance
export const accessibilityService = new AccessibilityService()
export default accessibilityService
