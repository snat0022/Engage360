import { reactive } from 'vue'

const AUTH_KEY = 'vue-auth-users'
const SESSION_KEY = 'vue-auth-session'
const ATTEMPTS_KEY = 'vue-auth-attempts'

export const authStore = reactive({
  currentUser: JSON.parse(localStorage.getItem(SESSION_KEY)) || null,
  users: [],
  attempts: {},

  loadUsers() {
    const raw = localStorage.getItem(AUTH_KEY)
    try {
      const parsed = JSON.parse(raw) || []
      this.users = parsed.map(u => ({
        status: u.status || 'active',
        ...u,
      }))
    } catch {
      this.users = []
    }

    this.attempts = JSON.parse(localStorage.getItem(ATTEMPTS_KEY)) || {}
  },

  saveUsers() {
    localStorage.setItem(AUTH_KEY, JSON.stringify(this.users))
  },

  saveAttempts() {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(this.attempts))
  },

  register(user) {
    this.loadUsers()
    const exists = this.users.some(u => u.email === user.email)
    if (exists) throw new Error('Email already registered.')

    this.users.push({
      name: user.name || '',
      email: user.email,
      password: user.password,
      role: user.role || 'user',
      status: 'active',
    })

    this.saveUsers()
  },

  login(email, password) {
    this.loadUsers()

    const user = this.users.find(u => u.email === email)

    if (!user) {
      this.trackAttempt(email)
      throw new Error('Invalid credentials.')
    }

    if (user.status === 'suspended') {
      throw new Error('User suspended. Please contact admin.')
    }

    if (this.attempts[email] >= 3) {
      throw new Error('Too many failed attempts. Try again later.')
    }

    if (user.password !== password) {
      this.trackAttempt(email)
      throw new Error('Invalid credentials.')
    }

    delete this.attempts[email]
    this.saveAttempts()

    this.currentUser = user
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  },

  logout() {
    this.currentUser = null
    localStorage.removeItem(SESSION_KEY)
  },

  isLoggedIn() {
    return !!this.currentUser
  },

  getRole() {
    return this.currentUser?.role || null
  },

  trackAttempt(email) {
    this.attempts[email] = (this.attempts[email] || 0) + 1
    this.saveAttempts()
  },

  clearAttempts(email) {
    if (this.attempts[email]) {
      delete this.attempts[email]
      this.saveAttempts()
    }
  },

  clearAllAttempts() {
    this.attempts = {}
    this.saveAttempts()
  },

  getAttemptsMap() {
    return this.attempts
  },
})
