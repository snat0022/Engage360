import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Form from '../views/Form.vue'
import FAQ from '../views/FAQ.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/form',
    name: 'Form',
    component: Form,
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: FAQ, // 
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
