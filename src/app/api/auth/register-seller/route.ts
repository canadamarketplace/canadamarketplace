import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name, phone, province, city, storeName, storeDescription } = body

    if (!email || !password || !name || !storeName) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const existingStore = await db.store.findUnique({ where: { slug: storeName.toLowerCase().replace(/\s+/g, "-") } })
    if (existingStore) {
      return NextResponse.json({ error: "Store name already taken" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "SELLER",
        phone,
        province,
        city,
        isVerified: false,
        store: {
          create: {
            name: storeName,
            slug: storeName.toLowerCase().replace(/\s+/g, "-"),
            description: storeDescription,
          },
        },
      },
      include: { store: true },
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      store: user.store,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 })
  }
}
