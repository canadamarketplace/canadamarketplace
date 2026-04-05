import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import sharp from "sharp"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_WIDTH = 1200
const THUMB_WIDTH = 400

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}` },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB" }, { status: 400 })
    }

    // Ensure uploads directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const ext = file.name.split(".").pop() || "jpg"
    const filename = `${timestamp}-${randomStr}.${ext}`
    const thumbFilename = `thumb-${filename}`

    const filePath = path.join(UPLOAD_DIR, filename)
    const thumbPath = path.join(UPLOAD_DIR, thumbFilename)

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Process image with sharp - resize to max width
    const image = sharp(buffer)
    const metadata = await image.metadata()

    // Resize main image to max 1200px width if needed
    if (metadata.width && metadata.width > MAX_WIDTH) {
      await image.resize(MAX_WIDTH, null, { withoutEnlargement: true }).toFile(filePath)
    } else {
      await image.toFile(filePath)
    }

    // Create thumbnail
    await sharp(buffer)
      .resize(THUMB_WIDTH, null, { withoutEnlargement: true })
      .toFile(thumbPath)

    return NextResponse.json({
      url: `/uploads/${filename}`,
      thumbnail: `/uploads/thumb-${filename}`,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
