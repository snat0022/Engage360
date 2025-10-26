import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Form from '../views/Form.vue'
import FAQ from '../views/FAQ.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import AboutView from '../views/AboutView.vue'
import AdminView from '../views/AdminView.vue'
import RatingsView from '../views/RatingsView.vue'
import { firebaseAuthStore } from '@/stores/firebaseAuth'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/form', name: 'Form', component: Form },
  { path: '/faq', name: 'FAQ', component: FAQ },
  { path: '/about', name: 'About', component: AboutView },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/ratings', name: 'Ratings', component: RatingsView },
  { path: '/admin', name: 'Admin', component: AdminView, meta: { requiresRole: 'admin' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Role-based guard
router.beforeEach((to, from, next) => {
  if (to.meta.requiresRole && firebaseAuthStore.getUserRole() !== to.meta.requiresRole) {
    return next('/login')
  }
  next()
})

export default router
