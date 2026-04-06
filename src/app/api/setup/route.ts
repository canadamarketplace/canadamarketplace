import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ensureDatabaseSeeded } from "@/lib/auto-seed"

/**
 * Ensures the database schema is in sync by adding missing columns
 * that were added to the Prisma schema but not yet migrated.
 * Uses raw SQL to ALTER TABLE so it works in serverless environments.
 */
async function ensureSchemaSync(): Promise<{ synced: boolean; message: string }> {
  try {
    // Get existing columns in the Store table
    const columns = await db.$queryRawUnsafe(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'Store'`
    ) as Array<{ column_name: string }>

    const existingCols = new Set(columns.map(c => c.column_name))

    // Columns that may be missing (added in schema but not migrated)
    const missingColumns: Array<{ name: string; type: string; default: string }> = []
    if (!existingCols.has('facebookUrl')) missingColumns.push({ name: 'facebookUrl', type: 'TEXT', default: 'NULL' })
    if (!existingCols.has('twitterUrl')) missingColumns.push({ name: 'twitterUrl', type: 'TEXT', default: 'NULL' })
    if (!existingCols.has('instagramUrl')) missingColumns.push({ name: 'instagramUrl', type: 'TEXT', default: 'NULL' })
    if (!existingCols.has('websiteUrl')) missingColumns.push({ name: 'websiteUrl', type: 'TEXT', default: 'NULL' })
    if (!existingCols.has('vacationMode')) missingColumns.push({ name: 'vacationMode', type: 'BOOLEAN', default: 'DEFAULT false' })
    if (!existingCols.has('vacationMessage')) missingColumns.push({ name: 'vacationMessage', type: 'TEXT', default: 'NULL' })
    if (!existingCols.has('approvalStatus')) missingColumns.push({ name: 'approvalStatus', type: 'TEXT', default: "DEFAULT 'APPROVED'" })

    // Check for missing columns in Product table
    const productColumns = await db.$queryRawUnsafe(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'Product'`
    ) as Array<{ column_name: string }>

    const existingProductCols = new Set(productColumns.map(c => c.column_name))
    if (!existingProductCols.has('moderationStatus')) {
      missingColumns.push({ name: 'moderationStatus', type: 'TEXT', default: "DEFAULT 'APPROVED'" })
    }

    if (missingColumns.length === 0) {
      return { synced: false, message: 'Schema already in sync' }
    }

    console.log(`🔧 Adding ${missingColumns.length} missing columns...`)
    for (const col of missingColumns) {
      const table = ['approvalStatus'].includes(col.name) ? '"Store"' : ['moderationStatus'].includes(col.name) ? '"Product"' : '"Store"'
      await db.$executeRawUnsafe(
        `ALTER TABLE ${table} ADD COLUMN "${col.name}" ${col.type} ${col.default}`
      )
      console.log(`  ✅ Added column: ${col.name}`)
    }

    return { synced: true, message: `Added ${missingColumns.length} columns: ${missingColumns.map(c => c.name).join(', ')}` }
  } catch (error) {
    console.error('Schema sync failed:', error)
    return { synced: false, message: `Schema sync failed: ${error instanceof Error ? error.message : String(error)}` }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check for force reseed parameter
    const { searchParams } = new URL(request.url)
    const force = searchParams.get('force') === 'true'

    // First, ensure schema is in sync
    const schemaResult = await ensureSchemaSync()
    console.log(`Schema sync: ${schemaResult.message}`)

    // Then seed (with optional force reseed)
    const result = await ensureDatabaseSeeded(force)
    return NextResponse.json({
      ok: true,
      schemaSync: schemaResult,
      seeded: result.seeded,
      force,
      message: result.message,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
