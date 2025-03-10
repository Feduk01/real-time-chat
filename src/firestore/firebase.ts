// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: 'real-time-chat-ffe00.firebaseapp.com',
  projectId: 'real-time-chat-ffe00',
  storageBucket: 'real-time-chat-ffe00.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_MESSAGINGSENDER_ID,
  appId: import.meta.env.APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
