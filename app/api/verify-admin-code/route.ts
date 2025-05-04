import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { adminCode } = await req.json()

  const isValid = adminCode === process.env.ADMIN_SECRET_CODE

  return NextResponse.json({ valid: isValid })
}
