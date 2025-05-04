"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, getDocs, query, updateDoc, doc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { AdminNav } from "@/components/admin-nav"
import { BookOpenText, Calendar, CheckCircle, Clock, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format, addDays } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

interface BookRequest {
  id: string
  bookId: string
  bookTitle: string
  userId: string
  userName: string
  requestDate: string
  dueDate: string
  status: "pending" | "approved" | "rejected" | "returned"
}

export default function AdminDashboard() {
  const [requests, setRequests] = useState<BookRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchRequests() {
      if (!user) return

      try {
        const q = query(collection(db, "bookRequests"))
        const querySnapshot = await getDocs(q)
        const requestsData: BookRequest[] = []

        querySnapshot.forEach((doc) => {
          requestsData.push({ id: doc.id, ...doc.data() } as BookRequest)
        })

        setRequests(requestsData)
      } catch (error) {
        console.error("Error fetching requests:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [user])

  const pendingRequests = requests.filter((req) => req.status === "pending")
  const approvedRequests = requests.filter((req) => req.status === "approved")
  const rejectedRequests = requests.filter((req) => req.status === "rejected")
  const returnedRequests = requests.filter((req) => req.status === "returned")

  const handleApproveRequest = async (requestId: string, bookId: string) => {
    if (isProcessing) return
    setIsProcessing(true)

    try {
      // Update request status
      await updateDoc(doc(db, "bookRequests", requestId), {
        status: "approved",
        dueDate: addDays(new Date(), 15).toISOString(),
      })

      // Update book status
      await updateDoc(doc(db, "books", bookId), {
        status: "unavailable",
      })

      // Update local state
      setRequests(
        requests.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: "approved",
                dueDate: addDays(new Date(), 15).toISOString(),
              }
            : req,
        ),
      )

      toast({
        title: "Request approved",
        description: "The book request has been approved successfully.",
      })
    } catch (error) {
      console.error("Error approving request:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve request. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectRequest = async (requestId: string, bookId: string) => {
    if (isProcessing) return
    setIsProcessing(true)

    try {
      // Update request status
      await updateDoc(doc(db, "bookRequests", requestId), {
        status: "rejected",
      })

      // Update book status
      await updateDoc(doc(db, "books", bookId), {
        status: "available",
      })

      // Update local state
      setRequests(
        requests.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: "rejected",
              }
            : req,
        ),
      )

      toast({
        title: "Request rejected",
        description: "The book request has been rejected.",
      })
    } catch (error) {
      console.error("Error rejecting request:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject request. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMarkReturned = async (requestId: string, bookId: string) => {
    if (isProcessing) return
    setIsProcessing(true)

    try {
      // Update request status
      await updateDoc(doc(db, "bookRequests", requestId), {
        status: "returned",
      })

      // Update book status
      await updateDoc(doc(db, "books", bookId), {
        status: "available",
      })

      // Update local state
      setRequests(
        requests.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: "returned",
              }
            : req,
        ),
      )

      toast({
        title: "Book returned",
        description: "The book has been marked as returned.",
      })
    } catch (error) {
      console.error("Error marking book as returned:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark book as returned. Please try again.",
      })
    } finally {
      setIsProcessing(false)
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
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button asChild>
              <Link href="/admin/books">Manage Books</Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting your approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Borrows</CardTitle>
              <BookOpenText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedRequests.length}</div>
              <p className="text-xs text-muted-foreground">Books currently borrowed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected Requests</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedRequests.length}</div>
              <p className="text-xs text-muted-foreground">Requests you've rejected</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Returned Books</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{returnedRequests.length}</div>
              <p className="text-xs text-muted-foreground">Books that have been returned</p>
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="returned">Returned</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : pendingRequests.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Pending Requests</CardTitle>
                  <CardDescription>There are no pending book requests to approve</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <CardTitle>{request.bookTitle}</CardTitle>
                      <CardDescription>
                        Requested by {request.userName} on {format(new Date(request.requestDate), "PPP")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge>Pending</Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleRejectRequest(request.id, request.bookId)}
                        disabled={isProcessing}
                        className="w-full"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleApproveRequest(request.id, request.bookId)}
                        disabled={isProcessing}
                        className="w-full"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="approved" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : approvedRequests.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Approved Requests</CardTitle>
                  <CardDescription>There are no currently borrowed books</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="space-y-4">
                {approvedRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <CardTitle>{request.bookTitle}</CardTitle>
                      <CardDescription>
                        Borrowed by {request.userName} on {format(new Date(request.requestDate), "PPP")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant="default">Approved</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Due Date:</span>
                        <span className="font-medium">{format(new Date(request.dueDate), "PPP")}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={() => handleMarkReturned(request.id, request.bookId)}
                        disabled={isProcessing}
                        className="w-full"
                      >
                        Mark as Returned
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="rejected" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : rejectedRequests.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Rejected Requests</CardTitle>
                  <CardDescription>You haven't rejected any book requests</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="space-y-4">
                {rejectedRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <CardTitle>{request.bookTitle}</CardTitle>
                      <CardDescription>
                        Requested by {request.userName} on {format(new Date(request.requestDate), "PPP")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant="destructive">Rejected</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="returned" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : returnedRequests.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Returned Books</CardTitle>
                  <CardDescription>No books have been returned yet</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="space-y-4">
                {returnedRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <CardTitle>{request.bookTitle}</CardTitle>
                      <CardDescription>
                        Returned by {request.userName} on {format(new Date(request.requestDate), "PPP")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant="outline">Returned</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
