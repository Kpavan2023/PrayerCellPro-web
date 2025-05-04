"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { BookOpenText, Edit, Plus, Search, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { AdminNav } from "@/components/admin-nav"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Book {
  id: string
  title: string
  author: string
  category: string
  description: string
  status: "available" | "unavailable" | "deleted"
  coverImage: string
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchBooks() {
      try {
        const q = query(collection(db, "books"), where("status", "!=", "deleted"))
        const querySnapshot = await getDocs(q)
        const booksData: Book[] = []

        querySnapshot.forEach((doc) => {
          booksData.push({ id: doc.id, ...doc.data() } as Book)
        })

        setBooks(booksData)
        setFilteredBooks(booksData)
      } catch (error) {
        console.error("Error fetching books:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load books. Please try again later.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooks()
  }, [toast])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBooks(books)
    } else {
      const filtered = books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredBooks(filtered)
    }
  }, [searchQuery, books])

  const handleToggleStatus = async (bookId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "available" ? "unavailable" : "available"

      await updateDoc(doc(db, "books", bookId), {
        status: newStatus,
      })

      setBooks(
        books.map((book) =>
          book.id === bookId ? { ...book, status: newStatus as "available" | "unavailable" } : book,
        ),
      )

      toast({
        title: "Status updated",
        description: `Book is now ${newStatus}.`,
      })
    } catch (error) {
      console.error("Error updating book status:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update book status. Please try again.",
      })
    }
  }

  const handleDeleteBook = async (bookId: string) => {
    try {
      // Soft delete by updating status
      await updateDoc(doc(db, "books", bookId), {
        status: "deleted",
      })

      // Remove from local state
      setBooks(books.filter((book) => book.id !== bookId))

      toast({
        title: "Book deleted",
        description: "The book has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting book:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete book. Please try again.",
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Link href="/" className="font-bold text-lg">
            Prayer Cell Library
          </Link>
          <div className="ml-auto flex items-center space-x-4">
            <AdminNav />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Manage Books</h2>
          <Button asChild>
            <Link href="/admin/books/add">
              <Plus className="mr-2 h-4 w-4" /> Add Book
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search books..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-[3/4] w-full">
                  <Skeleton className="h-full w-full" />
                </div>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <BookOpenText className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium">No books found</h2>
            <p className="text-muted-foreground">
              {searchQuery ? "Try a different search term" : "Add your first book to get started"}
            </p>
            <Button className="mt-4" asChild>
              <Link href="/admin/books/add">
                <Plus className="mr-2 h-4 w-4" /> Add Book
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="overflow-hidden flex flex-col">
                <div className="aspect-[3/4] w-full bg-muted relative">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage || "/placeholder.svg"}
                      alt={book.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookOpenText className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <Badge
                    variant={book.status === "available" ? "default" : "secondary"}
                    className="absolute top-2 right-2"
                  >
                    {book.status}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{book.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm line-clamp-3">{book.description}</p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <div className="flex gap-2 w-full">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/admin/books/edit/${book.id}`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the book from the library.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteBook(book.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <Button
                    variant={book.status === "available" ? "destructive" : "default"}
                    className="w-full"
                    onClick={() => handleToggleStatus(book.id, book.status)}
                  >
                    {book.status === "available" ? "Mark Unavailable" : "Mark Available"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

