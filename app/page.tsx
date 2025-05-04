import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, BookText, Users } from "lucide-react"
import { FirebaseStatus } from "@/components/firebase-status"


export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-primary text-primary-foreground px-6 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Prayer Cell Library</h1>
          <div className="space-x-2">
            <Button variant="secondary" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Welcome to Prayer Cell Library</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Borrow books from our collection and enrich your spiritual journey
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/books">Browse Books</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <BookOpen className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Extensive Collection</h3>
                  <p className="text-muted-foreground">Access a wide range of spiritual and religious books</p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <BookText className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Easy Borrowing</h3>
                  <p className="text-muted-foreground">Simple request process to borrow books for up to 15 days</p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Prayer Cell Community</h3>
                  <p className="text-muted-foreground">Share knowledge and grow together as a community</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Prayer Cell Library. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
