import { NextResponse } from "next/server"
import imagekit from "imagekit"
import fs from "fs"
import path from "path"

// Required to disable default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
}

const ik = new imagekit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
})

export async function POST(req: Request) {
  const formData = await req.formData()

  const file = formData.get("file") as File
  const fileName = formData.get("fileName") as string

  if (!file || !fileName) {
    return NextResponse.json({ error: "Missing file or fileName" }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())

    const uploadRes = await ik.upload({
      file: buffer,
      fileName,
    })

    return NextResponse.json({ url: uploadRes.url })
  } catch (error) {
    console.error("ImageKit upload failed:", error)
    return NextResponse.json({ error: "Image upload failed" }, { status: 500 })
  }
}
