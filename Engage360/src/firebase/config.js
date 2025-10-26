import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase configuration for Week7-Shreyas project
const firebaseConfig = {
  apiKey: "AIzaSyBQN9plFPMHvJ4GaXvn_1WohxRxb7hTESk",
  authDomain: "week7-shreyas.firebaseapp.com",
  projectId: "week7-shreyas",
  storageBucket: "week7-shreyas.firebasestorage.app",
  messagingSenderId: "931399826882",
  appId: "1:931399826882:web:5577837b300c47414d2a5b"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
export default app
