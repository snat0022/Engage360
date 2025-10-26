import { reactive } from 'vue'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth, googleProvider } from '@/firebase/config'
import { firestoreService } from '@/services/firestoreService'

export const firebaseAuthStore = reactive({
  currentUser: null,
  loading: true,
  error: null,

  async init() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user
      this.loading = false
    })
  },

  async loginWithEmail(email, password) {
    try {
      this.error = null
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result.user
    } catch (error) {
      this.error = error.message
      throw error
    }
  },

  async registerWithEmail(email, password, name) {
    try {
      this.error = null
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName: name })
      
      // Save user to Firestore
      await firestoreService.createUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: name,
        emailVerified: result.user.emailVerified,
        role: 'user',
        status: 'active'
      })
      console.log('User saved to Firestore successfully')
      
      return result.user
    } catch (error) {
      this.error = error.message
      throw error
    }
  },

  async loginWithGoogle() {
    try {
      this.error = null
      const result = await signInWithPopup(auth, googleProvider)
      return result.user
    } catch (error) {
      this.error = error.message
      throw error
    }
  },

  async logout() {
    try {
      await signOut(auth)
    } catch (error) {
      this.error = error.message
      throw error
    }
  },

  async sendEmailVerification() {
    try {
      if (!this.currentUser) throw new Error('No user logged in')
      await sendEmailVerification(this.currentUser)
      return true
    } catch (error) {
      this.error = error.message
      throw error
    }
  },

  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(auth, email)
      return true
    } catch (error) {
      this.error = error.message
      throw error
    }
  },

  isLoggedIn() {
    return !!this.currentUser
  },

  async getUserRole() {
    if (!this.currentUser) return null
    
    // First check hardcoded admin emails (more reliable)
    const adminEmails = [
      'admin@engage360.com', 
      'test@admin.com', 
      'shreyasnatraj97@gmail.com'
    ]
    const isHardcodedAdmin = adminEmails.includes(this.currentUser.email)
    
    if (isHardcodedAdmin) {
      return 'admin'
    }
    
    // Then try Firestore check
    try {
      const isAdmin = await firestoreService.getAdminRole(this.currentUser.email)
      console.log('Firestore admin check result:', isAdmin)
      return isAdmin ? 'admin' : 'user'
    } catch (error) {
      console.error('Error getting user role from Firestore:', error)
      return 'user'
    }
  },

  // Fallback methods for compatibility
  getAttemptsMap() {
    return {}
  },

  clearAttempts(email) {
    console.log('Clearing attempts for:', email)
  },
})
