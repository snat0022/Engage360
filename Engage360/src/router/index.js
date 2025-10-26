import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Form from '../views/Form.vue'
import FAQ from '../views/FAQ.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import AboutView from '../views/AboutView.vue'
import AdminView from '../views/AdminView.vue'
import RatingsView from '../views/RatingsView.vue'
import ProgramsView from '../views/ProgramsView.vue'
import MapsView from '../views/MapsView.vue'
import AppointmentBooking from '../components/AppointmentBooking.vue'
import BookingPage from '../views/BookingPage.vue'
import BulkEmail from '../components/BulkEmail.vue'
import InteractiveCharts from '../components/InteractiveCharts.vue'
import GenAIAssistant from '../components/GenAIAssistant.vue'
import { firebaseAuthStore } from '@/stores/firebaseAuth'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/programs', name: 'Programs', component: ProgramsView },
  { path: '/maps', name: 'Maps', component: MapsView },
  { path: '/form', name: 'Form', component: Form },
  { path: '/faq', name: 'FAQ', component: FAQ },
  { path: '/about', name: 'About', component: AboutView },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/ratings', name: 'Ratings', component: RatingsView },
  { path: '/admin', name: 'Admin', component: AdminView, meta: { requiresRole: 'admin' } },
  // Innovation Features Routes
  { path: '/appointments', name: 'Appointments', component: AppointmentBooking, meta: { requiresAuth: true } },
  { path: '/book', name: 'Book', component: BookingPage, meta: { requiresAuth: true } },
  { path: '/bulk-email', name: 'BulkEmail', component: BulkEmail, meta: { requiresRole: 'admin' } },
  { path: '/analytics', name: 'Analytics', component: InteractiveCharts, meta: { requiresRole: 'admin' } },
  { path: '/ai-assistant', name: 'GenAI', component: GenAIAssistant, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Role-based guard
router.beforeEach(async (to, from, next) => {
  // Check if route requires authentication
  if (to.meta.requiresAuth || to.meta.requiresRole) {
    try {
      const userRole = await firebaseAuthStore.getUserRole()
      
      // Check if user is authenticated
      if (!userRole && to.meta.requiresAuth) {
        return next('/login')
      }
      
      // Check if user has required role
      if (to.meta.requiresRole && userRole !== to.meta.requiresRole) {
        return next('/login')
      }
    } catch (error) {
      console.error('Error checking user role:', error)
      return next('/login')
    }
  }
  next()
})

export default router
