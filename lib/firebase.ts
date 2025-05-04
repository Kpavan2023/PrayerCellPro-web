import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"

// Use environment variables if available
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Function to check if Firebase is properly configured
export function isFirebaseConfigured() {
  // Check if all required Firebase config values are present and valid
  return (
    !!firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "undefined" &&
    !!firebaseConfig.authDomain &&
    !!firebaseConfig.projectId
  )
}

// Initialize Firebase only if it's properly configured
let app: FirebaseApp | undefined
let auth: Auth
let db: Firestore
let storage: FirebaseStorage

if (isFirebaseConfigured()) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }

    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
  } catch (error) {
    console.error("Firebase initialization error:", error)
  }
} else {
  console.warn("Firebase configuration is missing or invalid. Firebase services will not be available.")
}

export { auth, db, storage }
