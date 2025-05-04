"use client"

import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"

export function AdminNav() {
  const { user, logout, firebaseReady } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    if (!firebaseReady) {
      toast({
        variant: "destructive",
        title: "Firebase not configured",
        description: "Firebase is not properly configured.",
      })
      return
    }

    try {
      await logout()
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      })
      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      })
    }
  }

  if (!user || user.role !== "admin") return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            <p className="text-xs font-medium text-primary">Admin</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/admin/dashboard")}>Dashboard</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/admin/books")}>Manage Books</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/books")}>Browse Books</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
