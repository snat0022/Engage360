import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { firebaseAuthStore } from './stores/firebaseAuth'

const app = createApp(App)
app.use(router)

// Initialize Firebase Auth
firebaseAuthStore.init()

app.mount('#app')
