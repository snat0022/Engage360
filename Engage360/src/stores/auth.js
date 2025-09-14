import { reactive } from 'vue'

const AUTH_KEY = 'vue-auth-users'
const SESSION_KEY = 'vue-auth-session'

export const authStore = reactive({
  currentUser: JSON.parse(localStorage.getItem(SESSION_KEY)) || null,
  users: JSON.parse(localStorage.getItem(AUTH_KEY)) || [],

  register(user) {
    const exists = this.users.some(u => u.email === user.email)
    if (exists) throw new Error('Email already registered.')
    this.users.push({ ...user, status: 'active' }) // added status
    localStorage.setItem(AUTH_KEY, JSON.stringify(this.users))
  },

  login(email, password) {
    const user = this.users.find(u => u.email === email && u.password === password)
    if (!user) throw new Error('Invalid credentials.')
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
})
