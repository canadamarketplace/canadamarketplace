import { NextResponse } from "next/server"
import { execSync } from "child_process"

export async function POST() {
  try {
    // Step 1: Ensure database tables exist by running prisma db push
    // This handles cases where the build step didn't create the tables
    let pushOutput = ""
    try {
      pushOutput = execSync("npx prisma db push --skip-generate --accept-data-loss 2>&1", {
        timeout: 60000,
        env: { ...process.env },
      }).toString()
    } catch (pushError) {
      pushOutput = pushError instanceof Error ? pushError.message : String(pushError)
    }

    // Step 2: Now import and run the seed
    const { ensureDatabaseSeeded } = await import("@/lib/auto-seed")
    const result = await ensureDatabaseSeeded()

    return NextResponse.json({
      ok: true,
      seeded: result.seeded,
      message: result.message,
      schemaPush: pushOutput.substring(0, 500),
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
