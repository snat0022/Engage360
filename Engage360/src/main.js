import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'mapbox-gl/dist/mapbox-gl.css'
import './assets/accessibility.css'
import mapboxgl from 'mapbox-gl'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { firebaseAuthStore } from './stores/firebaseAuth'
import { accessibilityService } from './services/accessibilityService'
import { geminiAIService } from './services/geminiAIService'
import { offlineService } from './services/offlineService'
import { apiService } from './services/apiService'

// Make mapboxgl available globally
window.mapboxgl = mapboxgl

const app = createApp(App)
app.use(router)

// Initialize Firebase Auth
firebaseAuthStore.init()

// Initialize Services
Promise.all([
  accessibilityService.initialize(),
  geminiAIService.initialize(),
  offlineService.initialize(),
  apiService.initialize()
]).then(() => {
  console.log('All services initialized successfully')
}).catch(error => {
  console.error('Failed to initialize services:', error)
})

app.mount('#app')
