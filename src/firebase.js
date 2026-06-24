import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: "AIzaSyDr2f5P523VU3xoRtaQ-M02uiCR0987PWo",
  authDomain: "talo-guidebook.firebaseapp.com",
  projectId: "talo-guidebook",
  storageBucket: "talo-guidebook.firebasestorage.app",
  messagingSenderId: "633522021910",
  appId: "1:633522021910:web:562813373993e4a739f737"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)
export const functions = getFunctions(app) // us-central1 (matches provisionTenant)
