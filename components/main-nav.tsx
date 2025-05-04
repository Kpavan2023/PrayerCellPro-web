"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"

export function MainNav() {
  const pathname = usePathname()
  const { user, firebaseReady } = useAuth()

  if (!firebaseReady) {
    // You can show a loading spinner or a message here
    return (
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Link href="/" className="font-bold text-lg">
            Prayer Cell Library
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="font-bold text-lg">
          Prayer Cell Library
        </Link>
        <nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
          <Link
            href="/books"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/books" ? "text-primary" : "text-muted-foreground",
            )}
          >
            Books
          </Link>
          {user && (
            <Link
              href={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname.includes("/dashboard") ? "text-primary" : "text-muted-foreground",
              )}
            >
              Dashboard
            </Link>
          )}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          {user ? (
            <UserNav />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
