import { reactive } from "vue"

const AUTH_KEY = "vue-auth-users"
const SESSION_KEY = "vue-auth-session"
const ATTEMPTS_KEY = "vue-auth-attempts"

export const authStore = reactive({
  currentUser: JSON.parse(localStorage.getItem(SESSION_KEY)) || null,
  users: JSON.parse(localStorage.getItem(AUTH_KEY)) || [],
  attempts: JSON.parse(localStorage.getItem(ATTEMPTS_KEY)) || {},

  // Save attempts map to storage
  saveAttempts() {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(this.attempts))
  },

  // Register user
  register(user) {
    const exists = this.users.some((u) => u.email === user.email)
    if (exists) throw new Error("Email already registered.")
    user.status = "active" // default status
    this.users.push(user)
    localStorage.setItem(AUTH_KEY, JSON.stringify(this.users))
  },

  // Login with brute-force protection
  login(email, password) {
    const user = this.users.find((u) => u.email === email)

    if (!user) {
      this.trackAttempt(email)
      throw new Error("Invalid credentials.")
    }

    // Block if suspended
    if (user.status === "suspended") {
      throw new Error("Your account is suspended. Contact admin.")
    }

    // Block if too many attempts
    if (this.attempts[email] && this.attempts[email] >= 3) {
      throw new Error("Too many failed attempts. Try again later.")
    }

    // Validate password
    if (user.password !== password) {
      this.trackAttempt(email)
      throw new Error("Invalid credentials.")
    }

    // Successful login → reset attempts
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

  // Track failed login attempt
  trackAttempt(email) {
    if (!this.attempts[email]) {
      this.attempts[email] = 0
    }
    this.attempts[email]++
    this.saveAttempts()
  },

  // For Admin Security Logs
  getAttemptsMap() {
    return this.attempts
  },

  clearAttempts(email) {
    delete this.attempts[email]
    this.saveAttempts()
  },
})
