import { getAnalytics } from 'firebase/analytics'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// getting firebase variables fron the .env file for security reasons
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const ENV_KEY_MAP = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'VITE_FIREBASE_APP_ID',
  measurementId: 'VITE_FIREBASE_MEASUREMENT_ID',
}

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId']
const missingRequiredKeys = requiredKeys.filter((key) => !firebaseConfig[key])
const hasFirebaseConfig = missingRequiredKeys.length === 0

if (!hasFirebaseConfig) {
  const missingEnvKeys = missingRequiredKeys.map((key) => ENV_KEY_MAP[key]).join(', ')
  console.warn(`Firebase config is missing required env keys: ${missingEnvKeys}`)
}

const app = hasFirebaseConfig ? initializeApp(firebaseConfig) : null
const analytics = app && firebaseConfig.measurementId && typeof window !== 'undefined' ? getAnalytics(app) : null
const auth = app ? getAuth(app) : null
const db = app ? getFirestore(app) : null
const storage = app && firebaseConfig.storageBucket ? getStorage(app) : null

export { analytics, app, auth, db, storage }
