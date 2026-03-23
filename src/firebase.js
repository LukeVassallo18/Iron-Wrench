import { getAnalytics } from 'firebase/analytics'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']
const hasFirebaseConfig = requiredKeys.every((key) => Boolean(firebaseConfig[key]))

if (!hasFirebaseConfig) {
  console.warn('Firebase config is missing. Add values to .env (see .env.example).')
}

const app = hasFirebaseConfig ? initializeApp(firebaseConfig) : null
const analytics = app && typeof window !== 'undefined' ? getAnalytics(app) : null
const auth = app ? getAuth(app) : null
const db = app ? getFirestore(app) : null
const storage = app ? getStorage(app) : null

export { analytics, app, auth, db, storage }

