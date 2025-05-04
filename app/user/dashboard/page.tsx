"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, getDocs, query, where } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { UserNav } from "@/components/user-nav"
import { BookOpenText, Calendar, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

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

export default function UserDashboard() {
  const [requests, setRequests] = useState<BookRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchRequests() {
      if (!user) return

      try {
        const q = query(collection(db, "bookRequests"), where("userId", "==", user.uid))
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

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Link href="/" className="font-bold text-lg">
            Prayer Cell Library
          </Link>
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button asChild>
              <Link href="/books">Browse Books</Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval from admin</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Borrows</CardTitle>
              <BookOpenText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedRequests.length}</div>
              <p className="text-xs text-muted-foreground">Books currently in your possession</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Return History</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{returnedRequests.length}</div>
              <p className="text-xs text-muted-foreground">Books you have returned</p>
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
                  </Card>
                ))}
              </div>
            ) : pendingRequests.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Pending Requests</CardTitle>
                  <CardDescription>You don't have any pending book requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href="/books">Browse Books</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <CardTitle>{request.bookTitle}</CardTitle>
                      <CardDescription>Requested on {format(new Date(request.requestDate), "PPP")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge>Pending</Badge>
                      </div>
                    </CardContent>
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
                  </Card>
                ))}
              </div>
            ) : approvedRequests.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Approved Requests</CardTitle>
                  <CardDescription>You don't have any approved book requests</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="space-y-4">
                {approvedRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <CardTitle>{request.bookTitle}</CardTitle>
                      <CardDescription>Approved on {format(new Date(request.requestDate), "PPP")}</CardDescription>
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
                  <CardDescription>You don't have any rejected book requests</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="space-y-4">
                {rejectedRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <CardTitle>{request.bookTitle}</CardTitle>
                      <CardDescription>Rejected on {format(new Date(request.requestDate), "PPP")}</CardDescription>
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
                  <CardDescription>You haven't returned any books yet</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="space-y-4">
                {returnedRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <CardTitle>{request.bookTitle}</CardTitle>
                      <CardDescription>Returned on {format(new Date(request.requestDate), "PPP")}</CardDescription>
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
