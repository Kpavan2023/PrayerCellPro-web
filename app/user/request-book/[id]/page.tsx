"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc, addDoc, collection, updateDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { BookOpenText, Calendar, ChevronLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { addDays, format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

interface Book {
  id: string
  title: string
  author: string
  category: string
  description: string
  status: "available" | "unavailable"
  coverImage: string
}

export default function RequestBookPage({ params }: { params: { id: string } }) {
  const [book, setBook] = useState<Book | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const bookId = params.id

  useEffect(() => {
    async function fetchBook() {
      try {
        const docRef = doc(db, "books", bookId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setBook({ id: docSnap.id, ...docSnap.data() } as Book)
        } else {
          toast({
            variant: "destructive",
            title: "Book not found",
            description: "The requested book could not be found.",
          })
          router.push("/books")
        }
      } catch (error) {
        console.error("Error fetching book:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load book details. Please try again later.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchBook()
    } else {
      router.push("/login")
    }
  }, [bookId, router, toast, user])

  const handleRequestBook = async () => {
    if (!user || !book) return

    setIsSubmitting(true)

    try {
      // Get user details
      const userDoc = await getDoc(doc(db, "users", user.uid))

      if (!userDoc.exists()) {
        throw new Error("User data not found")
      }

      const userData = userDoc.data()

      // Calculate due date (15 days from now)
      const dueDate = addDays(new Date(), 15)

      // Create book request
      await addDoc(collection(db, "bookRequests"), {
        bookId: book.id,
        bookTitle: book.title,
        userId: user.uid,
        userName: userData.name,
        requestDate: new Date().toISOString(),
        dueDate: dueDate.toISOString(),
        status: "pending",
      })

      // Update book status to unavailable
      await updateDoc(doc(db, "books", book.id), {
        status: "unavailable",
      })

      toast({
        title: "Request submitted",
        description: "Your book request has been submitted successfully.",
      })

      router.push("/user/dashboard")
    } catch (error: any) {
      console.error("Error requesting book:", error)
      toast({
        variant: "destructive",
        title: "Request failed",
        description: error.message || "Failed to submit request. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href="/books">
              <ChevronLeft className="h-4 w-4" />
              Back to Books
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="aspect-[3/4] w-full max-w-md">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-10 w-full max-w-xs" />
          </div>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href="/books">
              <ChevronLeft className="h-4 w-4" />
              Back to Books
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Book Not Found</CardTitle>
            <CardDescription>The requested book could not be found.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/books">Browse Books</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link href="/books">
            <ChevronLeft className="h-4 w-4" />
            Back to Books
          </Link>
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="aspect-[3/4] w-full max-w-md bg-muted relative">
          {book.coverImage ? (
            <img src={book.coverImage || "/placeholder.svg"} alt={book.title} className="object-cover w-full h-full" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BookOpenText className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          <Badge variant={book.status === "available" ? "default" : "secondary"} className="absolute top-2 right-2">
            {book.status}
          </Badge>
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{book.title}</h1>
            <p className="text-lg text-muted-foreground">{book.author}</p>
            <p className="text-sm text-muted-foreground mt-1">Category: {book.category}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p>{book.description}</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Request Information
              </CardTitle>
              <CardDescription>Books are loaned for a period of 15 days</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Due Date: <span className="font-medium">{format(addDays(new Date(), 15), "PPP")}</span>
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleRequestBook}
                disabled={book.status !== "available" || isSubmitting}
                className="w-full"
              >
                {isSubmitting
                  ? "Submitting Request..."
                  : book.status === "available"
                    ? "Request Book"
                    : "Book Unavailable"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
