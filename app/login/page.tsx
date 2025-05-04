"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { auth, db, isFirebaseConfigured } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"
import {
  Alert, AlertDescription, AlertTitle
} from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card"


const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  role: z.enum(["user", "admin"]),
  adminCode: z.string().optional(),
})

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [firebaseReady, setFirebaseReady] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    setFirebaseReady(isFirebaseConfigured())
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
        description: "Please configure Firebase before attempting to login.",
      })
      return
    }

    setIsLoading(true)

    try {
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
      

      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password)
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))

      if (!userDoc.exists()) {
        throw new Error("User data not found")
      }

      const userData = userDoc.data()

      if (userData.role !== values.role) {
        toast({
          variant: "destructive",
          title: "Invalid role",
          description: `You are not registered as a ${values.role}.`,
        })
        setIsLoading(false)
        return
      }

      toast({
        title: "Login successful!",
        description: `Welcome back, ${userData.role}.`,
      })

      router.push(values.role === "admin" ? "/admin/dashboard" : "/user/dashboard")
    } catch (error: any) {
      console.error("Error during login:", error)
      let errorMessage = "Something went wrong. Please try again."

      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password."
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later."
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection."
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        variant: "destructive",
        title: "Login failed",
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
              Firebase is not properly configured. Please set up Firebase before attempting to login.
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
                <li>Get your Firebase configuration (apiKey, authDomain, etc.) from Project Settings → Your Apps</li>
                <li>
                  Create a <code className="bg-muted px-1 rounded">.env.local</code> file with your Firebase config and
                  admin secret code
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
          <h1 className="text-2xl font-semibold tracking-tight">Login to your account</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials below to login</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <Input placeholder="Enter admin code" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}
