// Program Service for integrating programs with maps functionality
class ProgramService {
  constructor() {
    this.programs = [
      {
        id: 1,
        name: 'Basketball for Beginners',
        description: 'Learn the fundamentals of basketball in a supportive environment. Perfect for those new to the sport.',
        level: 'Beginner',
        duration: '8 weeks',
        schedule: 'Mon & Wed 6-7 PM',
        price: 'Free',
        features: ['Equipment Provided', 'All Ages', 'Beginner Friendly'],
        location: {
          name: 'Clayton Recreation Centre',
          address: 'Clayton Recreation Centre, Clayton VIC 3168, Australia',
          coordinates: [145.12189, -37.91553], // Your Clayton location
          type: 'recreation_centre'
        },
        category: 'basketball',
        distance: null // Will be calculated based on user location
      },
      {
        id: 2,
        name: 'Community Soccer',
        description: 'Join our inclusive soccer program designed for all skill levels. Focus on fun, fitness, and teamwork.',
        level: 'All Levels',
        duration: '12 weeks',
        schedule: 'Sat 10-11:30 AM',
        price: '$20/month',
        features: ['Team Building', 'Equipment Provided', 'Family Friendly'],
        location: {
          name: 'Clayton Sports Complex',
          address: 'Clayton Sports Complex, Clayton VIC 3168, Australia',
          coordinates: [145.11850, -37.91320],
          type: 'sports_complex'
        },
        category: 'soccer',
        distance: null
      },
      {
        id: 3,
        name: 'Swimming Lessons',
        description: 'Learn to swim or improve your technique with certified instructors. Water safety included.',
        level: 'All Levels',
        duration: '10 weeks',
        schedule: 'Tue & Thu 7-8 PM',
        price: '$30/month',
        features: ['Certified Instructors', 'Safety First', 'All Ages'],
        location: {
          name: 'Monash Aquatic Centre',
          address: 'Monash Aquatic Centre, Clayton VIC 3168, Australia',
          coordinates: [145.12500, -37.91000],
          type: 'aquatic_centre'
        },
        category: 'swimming',
        distance: null
      },
      {
        id: 4,
        name: 'Tennis Fundamentals',
        description: 'Master the basics of tennis with our experienced coaches. Equipment and courts provided.',
        level: 'Beginner',
        duration: '6 weeks',
        schedule: 'Sun 2-3:30 PM',
        price: '$25/month',
        features: ['Equipment Provided', 'Small Groups', 'Beginner Focus'],
        location: {
          name: 'Clayton Tennis Club',
          address: 'Clayton Tennis Club, Clayton VIC 3168, Australia',
          coordinates: [145.12000, -37.91800],
          type: 'tennis_club'
        },
        category: 'tennis',
        distance: null
      },
      {
        id: 5,
        name: 'Volleyball League',
        description: 'Join our recreational volleyball league. Great for building teamwork and staying active.',
        level: 'Intermediate',
        duration: '8 weeks',
        schedule: 'Fri 6-8 PM',
        price: '$15/month',
        features: ['League Play', 'Team Building', 'Competitive Fun'],
        location: {
          name: 'Clayton Recreation Centre',
          address: 'Clayton Recreation Centre, Clayton VIC 3168, Australia',
          coordinates: [145.12189, -37.91553],
          type: 'recreation_centre'
        },
        category: 'volleyball',
        distance: null
      },
      {
        id: 6,
        name: 'Fitness Classes',
        description: 'High-energy fitness classes designed to improve strength, endurance, and overall health.',
        level: 'All Levels',
        duration: 'Ongoing',
        schedule: 'Mon, Wed, Fri 6-7 AM',
        price: '$35/month',
        features: ['High Energy', 'All Fitness Levels', 'Morning Classes'],
        location: {
          name: 'Clayton Fitness Centre',
          address: 'Clayton Fitness Centre, Clayton VIC 3168, Australia',
          coordinates: [145.11950, -37.91450],
          type: 'fitness_centre'
        },
        category: 'fitness',
        distance: null
      },
      {
        id: 7,
        name: 'Walking Groups',
        description: 'Join our community walking groups for gentle exercise and social connection.',
        level: 'All Levels',
        duration: 'Ongoing',
        schedule: 'Daily 8-9 AM',
        price: 'Free',
        features: ['Gentle Exercise', 'Social Connection', 'All Ages'],
        location: {
          name: 'Clayton Park',
          address: 'Clayton Park, Clayton VIC 3168, Australia',
          coordinates: [145.12350, -37.91700],
          type: 'park'
        },
        category: 'walking',
        distance: null
      },
      {
        id: 8,
        name: 'Yoga Sessions',
        description: 'Relax and strengthen your body and mind with our inclusive yoga classes.',
        level: 'All Levels',
        duration: 'Ongoing',
        schedule: 'Tue & Thu 7-8 PM',
        price: '$20/month',
        features: ['Mind & Body', 'All Levels', 'Mats Provided'],
        location: {
          name: 'Clayton Community Centre',
          address: 'Clayton Community Centre, Clayton VIC 3168, Australia',
          coordinates: [145.12200, -37.91650],
          type: 'community_centre'
        },
        category: 'yoga',
        distance: null
      },
      {
        id: 9,
        name: 'Dancing Classes',
        description: 'Learn various dance styles while having fun and staying active. No experience needed!',
        level: 'Beginner',
        duration: '6 weeks',
        schedule: 'Sat 3-4:30 PM',
        price: '$25/month',
        features: ['Fun & Energetic', 'No Experience Needed', 'All Ages'],
        location: {
          name: 'Clayton Community Centre',
          address: 'Clayton Community Centre, Clayton VIC 3168, Australia',
          coordinates: [145.12200, -37.91650],
          type: 'community_centre'
        },
        category: 'dancing',
        distance: null
      },
      {
        id: 10,
        name: 'Cycling Groups',
        description: 'Explore Melbourne on two wheels with our guided cycling groups. Bikes available for rent.',
        level: 'All Levels',
        duration: 'Ongoing',
        schedule: 'Sun 9-11 AM',
        price: '$30/month',
        features: ['Bike Rental Available', 'Guided Tours', 'Scenic Routes'],
        location: {
          name: 'Clayton Bike Hub',
          address: 'Clayton Bike Hub, Clayton VIC 3168, Australia',
          coordinates: [145.12400, -37.91900],
          type: 'bike_hub'
        },
        category: 'cycling',
        distance: null
      }
    ]
  }

  // Get all programs
  getAllPrograms() {
    return this.programs
  }

  // Get programs by category
  getProgramsByCategory(category) {
    return this.programs.filter(program => 
      program.category.toLowerCase() === category.toLowerCase()
    )
  }

  // Get programs by level
  getProgramsByLevel(level) {
    return this.programs.filter(program => 
      program.level.toLowerCase() === level.toLowerCase() ||
      program.level === 'All Levels'
    )
  }

  // Get nearby programs based on user location
  getNearbyPrograms(userLocation, radiusKm = 5) {
    const programsWithDistance = this.programs.map(program => {
      const distance = this.calculateDistance(
        userLocation.lat, userLocation.lng,
        program.location.coordinates[1], program.location.coordinates[0]
      )
      return { ...program, distance }
    })

    return programsWithDistance
      .filter(program => program.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
  }

  // Get program suggestions based on user preferences
  getProgramSuggestions(userLocation, preferences = {}) {
    let suggestions = this.getNearbyPrograms(userLocation, preferences.radiusKm || 5)

    // Filter by category if specified
    if (preferences.category) {
      suggestions = suggestions.filter(program => 
        program.category === preferences.category
      )
    }

    // Filter by level if specified
    if (preferences.level) {
      suggestions = suggestions.filter(program => 
        program.level === preferences.level || program.level === 'All Levels'
      )
    }

    // Filter by price if specified
    if (preferences.maxPrice) {
      suggestions = suggestions.filter(program => {
        const price = program.price === 'Free' ? 0 : parseInt(program.price.replace(/[^0-9]/g, ''))
        return price <= preferences.maxPrice
      })
    }

    return suggestions.slice(0, preferences.limit || 5)
  }

  // Get program by ID
  getProgramById(id) {
    return this.programs.find(program => program.id === id)
  }

  // Calculate distance between two coordinates (in kilometers)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Get directions to a specific program
  getDirectionsToProgram(programId, userLocation) {
    const program = this.getProgramById(programId)
    if (!program) {
      throw new Error('Program not found')
    }

    return {
      origin: userLocation,
      destination: {
        name: program.location.name,
        address: program.location.address,
        coordinates: program.location.coordinates
      },
      program: program
    }
  }

  // Get programs by transport mode
  getProgramsByTransportMode(transportMode) {
    const transportPreferences = {
      'walking': ['walking', 'yoga', 'fitness'],
      'cycling': ['cycling', 'tennis', 'basketball'],
      'driving': this.programs.map(p => p.category), // All programs accessible by car
      'bus': this.programs.map(p => p.category), // Most programs accessible by bus
      'train': ['swimming', 'fitness', 'yoga', 'dancing'],
      'tram': ['swimming', 'fitness', 'yoga', 'dancing']
    }

    const preferredCategories = transportPreferences[transportMode] || []
    return this.programs.filter(program => 
      preferredCategories.includes(program.category)
    )
  }
}

// Export singleton instance
export const programService = new ProgramService()
export default programService
