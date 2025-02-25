// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
const firebaseConfig = {
  apiKey: 'AIzaSyAXWb60nzD2cDq2lDddymIVURZSwm4dja8',
  authDomain: 'real-time-chat-ffe00.firebaseapp.com',
  projectId: 'real-time-chat-ffe00',
  storageBucket: 'real-time-chat-ffe00.firebasestorage.app',
  messagingSenderId: '452089355507',
  appId: '1:452089355507:web:fc22dbc81e1d8c1a3ceb86',
  measurementId: 'G-5VNMK1QXZC',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
