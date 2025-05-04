"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { collection, addDoc } from "firebase/firestore"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { db } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"
import { AdminNav } from "@/components/admin-nav"
import { ChevronLeft } from "lucide-react"
import imageCompression from "browser-image-compression"

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  author: z.string().min(2, { message: "Author must be at least 2 characters." }),
  category: z.string().min(2, { message: "Category is required." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  status: z.enum(["available", "unavailable"]),
  coverImage: z.any().optional(),
})

const categories = [
  "Bible Study",
  "Prayer",
  "Devotional",
  "Theology",
  "Christian Living",
  "Biography",
  "Fiction",
  "Children",
  "Youth",
  "Leadership",
  "Evangelism",
  "Missions",
  "Other",
]

export default function AddBookPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      category: "",
      description: "",
      status: "available",
    },
  })

  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("fileName", `${Date.now()}-${file.name}`)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Image upload failed")
    }

    const data = await response.json()
    return data.url
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      let coverImageUrl = ""

      if (values.coverImage && values.coverImage.length > 0) {
        const file = values.coverImage[0]

        const compressedFile = await imageCompression(file, {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        })

        coverImageUrl = await uploadImage(compressedFile)
      }

      await addDoc(collection(db, "books"), {
        title: values.title,
        author: values.author,
        category: values.category,
        description: values.description,
        status: values.status,
        coverImage: coverImageUrl,
        createdAt: new Date().toISOString(),
      })

      toast({
        title: "Book added",
        description: "The book has been added successfully.",
      })

      router.push("/admin/books")
    } catch (error: any) {
      console.error("Error adding book:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to add book. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
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
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href="/admin/books">
              <ChevronLeft className="h-4 w-4" />
              Back to Books
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Add New Book</h2>
        </div>

        <div className="grid gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter book title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter author name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="unavailable">Unavailable</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter book description" className="min-h-32" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coverImage"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Cover Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onChange(e.target.files)}
                        {...fieldProps}
                      />
                    </FormControl>
                    <FormDescription>Upload a cover image (automatically compressed)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => router.push("/admin/books")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Book"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
