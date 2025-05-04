"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db, isFirebaseConfigured } from "./firebase"

interface UserData {
  uid: string
  name: string
  email: string
  role: "user" | "admin"
}

interface AuthContextType {
  user: UserData | null
  loading: boolean
  firebaseReady: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  firebaseReady: false,
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [firebaseReady, setFirebaseReady] = useState(false)

  useEffect(() => {
    // Check if Firebase is properly configured
    const isConfigured = isFirebaseConfigured()
    setFirebaseReady(isConfigured)

    if (!isConfigured) {
      setLoading(false)
      return
    }

    // Only set up the auth state listener if Firebase is properly configured
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

            if (userDoc.exists()) {
              const userData = userDoc.data()
              setUser({
                uid: firebaseUser.uid,
                name: userData.name,
                email: userData.email,
                role: userData.role,
              })
            } else {
              // User document doesn't exist
              setUser(null)
            }
          } catch (error) {
            console.error("Error fetching user data:", error)
            setUser(null)
          }
        } else {
          setUser(null)
        }
        setLoading(false)
      })

      return () => {
        if (unsubscribe) {
          unsubscribe()
        }
      }
    } catch (error) {
      console.error("Error setting up auth state listener:", error)
      setLoading(false)
    }
  }, [])

  const logout = async () => {
    if (!firebaseReady) {
      return
    }

    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return <AuthContext.Provider value={{ user, loading, firebaseReady, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
