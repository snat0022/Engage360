import { reactive } from 'vue'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, googleProvider } from '@/firebase/config'

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
      await result.user.updateProfile({ displayName: name })
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

  isLoggedIn() {
    return !!this.currentUser
  },

  getUserRole() {
    if (!this.currentUser) return null

    // For demo purposes, assign admin role to specific emails
    const adminEmails = ['admin@engage360.com', 'test@admin.com', 'shreyasnatraj97@gmail.com']
    return adminEmails.includes(this.currentUser.email) ? 'admin' : 'user'
  },

  // Fallback methods for compatibility
  getAttemptsMap() {
    return {}
  },

  clearAttempts(email) {
    console.log('Clearing attempts for:', email)
  },
})
