"use client"

import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function FirebaseStatus() {
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    try {
      // Check if Firebase Auth is initialized
      if (auth) {
        console.log("Firebase Auth initialized")
        setInitialized(true)
      }
    } catch (err: any) {
      console.error("Firebase initialization error:", err)
      setError(err.message || "Failed to initialize Firebase")
    }
  }, [])

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Firebase Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!initialized) {
    return null
  }

  return null
}
