"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { auth, db, isFirebaseConfigured } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  role: z.enum(["user", "admin"]),
  adminCode: z.string().optional(),
})

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [firebaseReady, setFirebaseReady] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if Firebase is properly configured
    setFirebaseReady(isFirebaseConfigured())
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
      adminCode: "",
    },
  })

  const role = form.watch("role")

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firebaseReady) {
      toast({
        variant: "destructive",
        title: "Firebase not configured",
        description: "Please configure Firebase before attempting to register.",
      })
      return
    }

    setIsLoading(true)

    try {
      // Check admin code if role is admin
      if (values.role === "admin") {
        const res = await fetch("/api/verify-admin-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminCode: values.adminCode }),
        })
      
        const data = await res.json()
      
        if (!data.valid) {
          toast({
            variant: "destructive",
            title: "Invalid admin code",
            description: "The admin code you entered is incorrect.",
          })
          setIsLoading(false)
          return
        }
      }      

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password)

      // Add user to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: values.name,
        email: values.email,
        role: values.role,
        createdAt: new Date().toISOString(),
      })

      toast({
        title: "Registration successful!",
        description: "You have been registered successfully.",
      })

      // Redirect based on role
      if (values.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/user/dashboard")
      }
    } catch (error: any) {
      console.error("Error during registration:", error)
      let errorMessage = "Something went wrong. Please try again."

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please use a different email or try logging in."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "The email address is not valid."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters."
      } else if (error.code === "auth/api-key-not-valid") {
        errorMessage = "Firebase API key is not valid. Please configure Firebase properly."
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        variant: "destructive",
        title: "Registration failed",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!firebaseReady) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Firebase Configuration Required</CardTitle>
            <CardDescription>
              Firebase is not properly configured. Please set up Firebase before attempting to register.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Firebase Error</AlertTitle>
              <AlertDescription>
                The Firebase API key is not valid. You need to set up your own Firebase project and configure the
                environment variables.
              </AlertDescription>
            </Alert>
            <div className="space-y-4">
              <h3 className="font-medium">Quick Setup Guide:</h3>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Create a Firebase project at the Firebase Console</li>
                <li>Enable Authentication with Email/Password provider</li>
                <li>Set up Firestore Database and Storage</li>
                <li>Get your Firebase configuration (apiKey, authDomain, etc.) from Project Settings &gt; Your Apps</li>
                <li>
                  Create a <code className="bg-muted px-1 rounded">.env.local</code> file with your Firebase
                  configuration
                </li>
              </ol>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/">Return Home</Link>
            </Button>
            <Button asChild>
              <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">
                Go to Firebase Console
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">Enter your details below to create your account</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="******" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {role === "admin" && (
              <FormField
                control={form.control}
                name="adminCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Admin Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </form>
        </Form>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="text-blue-500">Log in</Link>
        </p>
      </div>
    </div>
  )
}
