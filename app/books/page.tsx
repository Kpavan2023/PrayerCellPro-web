"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, getDocs, query, where } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { BookOpenText, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { MainNav } from "@/components/main-nav"

interface Book {
  id: string
  title: string
  author: string
  category: string
  description: string
  status: "available" | "unavailable"
  coverImage: string
}

export default function BooksPage() {
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

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Book Collection</h1>
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
                {searchQuery ? "Try a different search term" : "Books will appear here once added by an admin"}
              </p>
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
                  <CardFooter>
                    {user ? (
                      <Button className="w-full" disabled={book.status !== "available"} asChild>
                        <Link href={`/user/request-book/${book.id}`}>
                          {book.status === "available" ? "Request Book" : "Unavailable"}
                        </Link>
                      </Button>
                    ) : (
                      <Button className="w-full" asChild>
                        <Link href="/login">Login to Request</Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
