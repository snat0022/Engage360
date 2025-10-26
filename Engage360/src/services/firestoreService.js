// src/services/firestoreService.js
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  where
} from 'firebase/firestore'
import { db } from '@/firebase/config'

// Collections
const USERS_COLLECTION = 'users'
const REGISTRATIONS_COLLECTION = 'programRegistrations'
const ADMIN_ROLES_COLLECTION = 'adminRoles'
const PROGRAMS_COLLECTION = 'programs'
const BOOKINGS_COLLECTION = 'bookings'
const INSTRUCTORS_COLLECTION = 'instructors'
const EMAIL_CAMPAIGNS_COLLECTION = 'emailCampaigns'

export const firestoreService = {
  // User Management
  async createUser(userData) {
    try {
      const docRef = await addDoc(collection(db, USERS_COLLECTION), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },

  async updateUser(userId, userData) {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId)
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  async getAllUsers() {
    try {
      const usersRef = collection(db, USERS_COLLECTION)
      const snapshot = await getDocs(usersRef)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error getting all users:', error)
      throw error
    }
  },

  async deleteUser(userId) {
    try {
      await deleteDoc(doc(db, USERS_COLLECTION, userId))
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  },

  async getUser(userId) {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId)
      const userSnap = await getDoc(userRef)
      return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null
    } catch (error) {
      console.error('Error getting user:', error)
      throw error
    }
  },

  async getAllUsers() {
    try {
      const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION))
      return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error('Error getting users:', error)
      throw error
    }
  },

  // Real-time user listener
  onUsersSnapshot(callback) {
    const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      callback(users)
    })
  },

  // Program Registration Management
  async createRegistration(registrationData) {
    try {
      const docRef = await addDoc(collection(db, REGISTRATIONS_COLLECTION), {
        ...registrationData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating registration:', error)
      throw error
    }
  },

  async updateRegistration(registrationId, registrationData) {
    try {
      const registrationRef = doc(db, REGISTRATIONS_COLLECTION, registrationId)
      await updateDoc(registrationRef, {
        ...registrationData,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating registration:', error)
      throw error
    }
  },

  async deleteRegistration(registrationId) {
    try {
      await deleteDoc(doc(db, REGISTRATIONS_COLLECTION, registrationId))
    } catch (error) {
      console.error('Error deleting registration:', error)
      throw error
    }
  },

  async getAllRegistrations() {
    try {
      const registrationsSnapshot = await getDocs(collection(db, REGISTRATIONS_COLLECTION))
      return registrationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error('Error getting registrations:', error)
      throw error
    }
  },

  // Real-time registration listener
  onRegistrationsSnapshot(callback) {
    const q = query(collection(db, REGISTRATIONS_COLLECTION), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snapshot) => {
      const registrations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      callback(registrations)
    })
  },

  // Admin Role Management
  async setAdminRole(email, isAdmin) {
    try {
      const q = query(collection(db, ADMIN_ROLES_COLLECTION), where('email', '==', email))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        // Update existing role
        const docRef = querySnapshot.docs[0].ref
        await updateDoc(docRef, { 
          isAdmin, 
          updatedAt: serverTimestamp() 
        })
      } else {
        // Create new role
        await addDoc(collection(db, ADMIN_ROLES_COLLECTION), {
          email,
          isAdmin,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Error setting admin role:', error)
      throw error
    }
  },

  async getAdminRole(email) {
    try {
      console.log('Checking admin role for:', email)
      
      // First try Firestore query
      const q = query(collection(db, ADMIN_ROLES_COLLECTION), where('email', '==', email))
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        const isAdmin = querySnapshot.docs[0].data().isAdmin
        console.log('Admin role from Firestore:', isAdmin)
        return isAdmin
      }
      
      // Fallback to hardcoded admin emails if Firestore fails or no record found
      const adminEmails = [
        'admin@engage360.com',
        'test@admin.com', 
        'shreyasnatraj97@gmail.com'
      ]
      const isHardcodedAdmin = adminEmails.includes(email)
      console.log('Admin role from hardcoded list:', isHardcodedAdmin)
      return isHardcodedAdmin
      
    } catch (error) {
      console.error('Error getting admin role from Firestore:', error)
      console.log('Falling back to hardcoded admin emails due to Firestore error')
      
      // Fallback to hardcoded admin emails if Firestore fails
      const adminEmails = [
        'admin@engage360.com',
        'test@admin.com', 
        'shreyasnatraj97@gmail.com'
      ]
      const isHardcodedAdmin = adminEmails.includes(email)
      console.log('Admin role from hardcoded fallback:', isHardcodedAdmin)
      return isHardcodedAdmin
    }
  },

  async getAllAdminRoles() {
    try {
      const adminSnapshot = await getDocs(collection(db, ADMIN_ROLES_COLLECTION))
      return adminSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error('Error getting admin roles:', error)
      throw error
    }
  },

  // Real-time users listener
  onUsersSnapshot(callback) {
    return onSnapshot(collection(db, USERS_COLLECTION), (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      callback(users)
    }, (error) => {
      console.error('Error listening to users:', error)
    })
  },

  // Real-time admin roles listener
  onAdminRolesSnapshot(callback) {
    return onSnapshot(collection(db, ADMIN_ROLES_COLLECTION), (snapshot) => {
      const adminRoles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      callback(adminRoles)
    })
  },

  // Admin Activity Logging
  async logAdminActivity(activityData) {
    try {
      const docRef = await addDoc(collection(db, 'adminActivityLog'), {
        ...activityData,
        createdAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error('Error logging admin activity:', error)
      throw error
    }
  },

  async getAdminActivityLog() {
    try {
      const q = query(collection(db, 'adminActivityLog'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error('Error getting admin activity log:', error)
      throw error
    }
  },

  // Real-time admin activity log listener
  onAdminActivityLogSnapshot(callback) {
    const q = query(collection(db, 'adminActivityLog'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      callback(activities)
    }, (error) => {
      console.error('Error listening to admin activity log:', error)
    })
  },

  // Program Management
  async createProgram(programData) {
    try {
      const docRef = await addDoc(collection(db, PROGRAMS_COLLECTION), {
        ...programData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating program:', error)
      throw error
    }
  },

  async updateProgram(programId, programData) {
    try {
      const programRef = doc(db, PROGRAMS_COLLECTION, programId)
      await updateDoc(programRef, {
        ...programData,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating program:', error)
      throw error
    }
  },

  async deleteProgram(programId) {
    try {
      await deleteDoc(doc(db, PROGRAMS_COLLECTION, programId))
    } catch (error) {
      console.error('Error deleting program:', error)
      throw error
    }
  },

  async getAllPrograms() {
    try {
      const programsSnapshot = await getDocs(collection(db, PROGRAMS_COLLECTION))
      return programsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error('Error getting programs:', error)
      throw error
    }
  },

  // Real-time programs listener
  onProgramsSnapshot(callback) {
    const q = query(collection(db, PROGRAMS_COLLECTION), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snapshot) => {
      const programs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      callback(programs)
    }, (error) => {
      console.error('Error listening to programs:', error)
    })
  },

  // Statistics
  async getStats() {
    try {
      const [usersSnapshot, registrationsSnapshot] = await Promise.all([
        getDocs(collection(db, USERS_COLLECTION)),
        getDocs(collection(db, REGISTRATIONS_COLLECTION))
      ])

      const users = usersSnapshot.docs.map(doc => doc.data())
      const registrations = registrationsSnapshot.docs.map(doc => doc.data())

      return {
        totalUsers: users.length,
        totalRegistrations: registrations.length,
        verifiedUsers: users.filter(user => user.emailVerified).length,
        adminUsers: users.filter(user => user.role === 'admin').length
      }
    } catch (error) {
      console.error('Error getting stats:', error)
      throw error
    }
  }
}

// Booking & Instructor APIs (used by AppointmentBooking)
firestoreService.createBooking = async function createBooking(bookingData) {
  const maxRetries = 3
  let lastError = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`createBooking: Attempt ${attempt} - Creating booking with data:`, bookingData)
      
      const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), {
        ...bookingData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      console.log('createBooking: Booking created successfully with ID:', docRef.id)
      return docRef.id
      
    } catch (error) {
      lastError = error
      console.error(`createBooking: Attempt ${attempt} failed:`, error)
      
      if (attempt < maxRetries) {
        console.log(`createBooking: Retrying in ${attempt * 1000}ms...`)
        await new Promise(resolve => setTimeout(resolve, attempt * 1000))
      }
    }
  }
  
  console.error('createBooking: All attempts failed:', lastError)
  throw lastError
}

firestoreService.onUserBookingsSnapshot = function onUserBookingsSnapshot(userId, callback) {
  console.log('onUserBookingsSnapshot: Setting up real-time listener for user bookings:', userId)
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where('userId', '==', userId)
  )
  return onSnapshot(q, (snapshot) => {
    console.log('onUserBookingsSnapshot: Snapshot received, docs count:', snapshot.docs.length)
    const bookings = snapshot.docs.map(d => {
      const data = d.data()
      console.log('onUserBookingsSnapshot: Document:', { id: d.id, ...data })
      return { id: d.id, ...data }
    })
    console.log('onUserBookingsSnapshot: Calling callback with bookings:', bookings)
    callback(bookings)
  }, (error) => {
    console.error('onUserBookingsSnapshot: Error listening to user bookings:', error)
  })
}

firestoreService.getUserBookings = async function getUserBookings(userId) {
  try {
    const qUser = query(
      collection(db, BOOKINGS_COLLECTION),
      where('userId', '==', userId)
    )
    const snapshot = await getDocs(qUser)
    const bookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    // Sort client-side by date+time desc to avoid composite index requirement
    return bookings.sort((a, b) => {
      const aDT = new Date(`${a.date}T${a.time}`)
      const bDT = new Date(`${b.date}T${b.time}`)
      return bDT - aDT
    })
  } catch (error) {
    console.error('Error getting user bookings:', error)
    throw error
  }
}

firestoreService.getProgramBookings = async function getProgramBookings(programId, date, time) {
  try {
    let qBase = query(
      collection(db, BOOKINGS_COLLECTION),
      where('programId', '==', programId)
    )
    // Apply optional date/time filtering client-side after fetch to keep queries simple
    const snapshot = await getDocs(qBase)
    let results = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    if (date) {
      results = results.filter(b => b.date === date)
    }
    if (time) {
      results = results.filter(b => b.time === time)
    }
    return results
  } catch (error) {
    console.error('Error getting program bookings:', error)
    throw error
  }
}

firestoreService.getInstructorBookings = async function getInstructorBookings(instructorId, date, time) {
  try {
    let qBase = query(
      collection(db, BOOKINGS_COLLECTION),
      where('instructorId', '==', instructorId)
    )
    const snapshot = await getDocs(qBase)
    let results = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    if (date) {
      results = results.filter(b => b.date === date)
    }
    if (time) {
      results = results.filter(b => b.time === time)
    }
    return results
  } catch (error) {
    console.error('Error getting instructor bookings:', error)
    throw error
  }
}

firestoreService.getAllInstructors = async function getAllInstructors() {
  try {
    const snapshot = await getDocs(collection(db, INSTRUCTORS_COLLECTION))
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (error) {
    console.error('Error getting instructors:', error)
    // Graceful fallback: return an empty list so UI still works
    return []
  }
}

firestoreService.updateBooking = async function updateBooking(bookingId, update) {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId)
    await updateDoc(bookingRef, { ...update, updatedAt: serverTimestamp() })
  } catch (error) {
    console.error('Error updating booking:', error)
    throw error
  }
}

// Bookings queries for analytics
firestoreService.getAllBookings = async function getAllBookings() {
  try {
    console.log('getAllBookings: Starting to fetch bookings from Firestore...')
    const snapshot = await getDocs(collection(db, BOOKINGS_COLLECTION))
    console.log('getAllBookings: Firestore snapshot:', snapshot)
    console.log('getAllBookings: Number of documents:', snapshot.docs.length)
    
    const bookings = snapshot.docs.map(d => {
      const data = d.data()
      console.log('getAllBookings: Document data:', { id: d.id, ...data })
      return { id: d.id, ...data }
    })
    
    console.log('getAllBookings: Final bookings array:', bookings)
    return bookings
  } catch (error) {
    console.error('getAllBookings: Error getting all bookings:', error)
    return []
  }
}

firestoreService.onBookingsSnapshot = function onBookingsSnapshot(callback) {
  console.log('onBookingsSnapshot: Setting up real-time listener for bookings')
  const col = collection(db, BOOKINGS_COLLECTION)
  return onSnapshot(col, (snapshot) => {
    console.log('onBookingsSnapshot: Snapshot received, docs count:', snapshot.docs.length)
    const items = snapshot.docs.map(d => {
      const data = d.data()
      console.log('onBookingsSnapshot: Document:', { id: d.id, ...data })
      return { id: d.id, ...data }
    })
    console.log('onBookingsSnapshot: Calling callback with items:', items)
    callback(items)
  }, (error) => {
    console.error('onBookingsSnapshot: Error listening to bookings:', error)
  })
}

// Email campaigns for analytics (optional/demo)
firestoreService.getEmailCampaigns = async function getEmailCampaigns() {
  try {
    const snapshot = await getDocs(collection(db, EMAIL_CAMPAIGNS_COLLECTION))
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (error) {
    // Fallback demo data
    return [
      { id: 'demo1', subject: 'Welcome Series', status: 'sent', sentAt: new Date().toISOString(), recipientCount: 120, openRate: 48, clickRate: 12 },
      { id: 'demo2', subject: 'Programs Update', status: 'sent', sentAt: new Date().toISOString(), recipientCount: 95, openRate: 35, clickRate: 9 }
    ]
  }
}

firestoreService.createInstructor = async function createInstructor(instructorData) {
  try {
    const docRef = await addDoc(collection(db, INSTRUCTORS_COLLECTION), {
      ...instructorData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating instructor:', error)
    throw error
  }
}
