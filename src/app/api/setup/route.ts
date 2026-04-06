import { NextResponse } from "next/server"
import { ensureDatabaseSeeded } from "@/lib/auto-seed"

export async function POST() {
  try {
    const result = await ensureDatabaseSeeded()
    return NextResponse.json({
      ok: true,
      seeded: result.seeded,
      message: result.message,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
