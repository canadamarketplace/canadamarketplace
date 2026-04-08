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

    // Check if Report table exists, create if not
    const tables = await db.$queryRawUnsafe(
      `SELECT table_name FROM information_schema.tables WHERE table_name = 'Report' AND table_schema = 'public'`
    ) as Array<{ table_name: string }>

    if (tables.length === 0) {
      console.log('🔧 Creating Report table...')
      await db.$executeRawUnsafe(`
        CREATE TABLE "Report" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "reporterId" TEXT NOT NULL,
          "targetType" TEXT NOT NULL,
          "targetId" TEXT NOT NULL,
          "reason" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'OPEN',
          "adminNotes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
        )
      `)
      await db.$executeRawUnsafe(`CREATE INDEX "Report_targetType_targetId_idx" ON "Report"("targetType", "targetId")`)
      await db.$executeRawUnsafe(`CREATE INDEX "Report_status_idx" ON "Report"("status")`)
      console.log('  ✅ Created Report table with indexes')
    }

    // Create new tables if they don't exist
    const newTables = ['"Brand"', '"GiftCard"', '"RewardPoints"', '"StoreCredit"', '"Affiliate"', '"ExtraFee"', '"ShippingRate"', '"PickupLocation"', '"DailyDeal"', '"QuoteRequest"', '"Return"'] as const
    const existingNewTables = await db.$queryRawUnsafe(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN (${newTables.join(',')})`
    ) as Array<{ table_name: string }>
    const existingTableNames = new Set(existingNewTables.map(t => t.table_name))

    const tableSQLs: Record<string, string> = {
      '"Brand"': `CREATE TABLE "Brand" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL UNIQUE, "slug" TEXT NOT NULL UNIQUE, "logo" TEXT, "description" TEXT, "website" TEXT, "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
      '"GiftCard"': `CREATE TABLE "GiftCard" ("id" TEXT NOT NULL PRIMARY KEY, "code" TEXT NOT NULL UNIQUE, "balance" DOUBLE PRECISION NOT NULL, "initialAmount" DOUBLE PRECISION NOT NULL, "currency" TEXT NOT NULL DEFAULT 'CAD', "recipientName" TEXT, "recipientEmail" TEXT, "message" TEXT, "isActive" BOOLEAN NOT NULL DEFAULT true, "expiresAt" TIMESTAMP(3), "purchasedById" TEXT, "redeemedById" TEXT, "redeemedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "GiftCard_purchasedById_fkey" FOREIGN KEY ("purchasedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "GiftCard_redeemedById_fkey" FOREIGN KEY ("redeemedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE)`,
      '"RewardPoints"': `CREATE TABLE "RewardPoints" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "points" INTEGER NOT NULL, "type" TEXT NOT NULL, "description" TEXT NOT NULL, "orderId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "RewardPoints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE)`,
      '"StoreCredit"': `CREATE TABLE "StoreCredit" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "amount" DOUBLE PRECISION NOT NULL, "type" TEXT NOT NULL, "description" TEXT NOT NULL, "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "StoreCredit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE)`,
      '"Affiliate"': `CREATE TABLE "Affiliate" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL UNIQUE, "referralCode" TEXT NOT NULL UNIQUE, "referredBy" TEXT, "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0, "totalReferrals" INTEGER NOT NULL DEFAULT 0, "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Affiliate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
      '"ExtraFee"': `CREATE TABLE "ExtraFee" ("id" TEXT NOT NULL PRIMARY KEY, "sellerId" TEXT, "name" TEXT NOT NULL, "type" TEXT NOT NULL, "amount" DOUBLE PRECISION NOT NULL, "minOrder" DOUBLE PRECISION, "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ExtraFee_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE)`,
      '"ShippingRate"': `CREATE TABLE "ShippingRate" ("id" TEXT NOT NULL PRIMARY KEY, "sellerId" TEXT, "zone" TEXT NOT NULL, "baseRate" DOUBLE PRECISION NOT NULL, "perKgRate" DOUBLE PRECISION NOT NULL DEFAULT 0, "freeAbove" DOUBLE PRECISION, "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ShippingRate_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE)`,
      '"PickupLocation"': `CREATE TABLE "PickupLocation" ("id" TEXT NOT NULL PRIMARY KEY, "sellerId" TEXT NOT NULL, "storeId" TEXT NOT NULL, "name" TEXT NOT NULL, "address" TEXT NOT NULL, "city" TEXT NOT NULL, "province" TEXT NOT NULL, "postalCode" TEXT NOT NULL, "phone" TEXT, "hours" TEXT, "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PickupLocation_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "PickupLocation_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
      '"DailyDeal"': `CREATE TABLE "DailyDeal" ("id" TEXT NOT NULL PRIMARY KEY, "productId" TEXT NOT NULL UNIQUE, "dealPrice" DOUBLE PRECISION NOT NULL, "startsAt" TIMESTAMP(3) NOT NULL, "endsAt" TIMESTAMP(3) NOT NULL, "maxQty" INTEGER, "soldQty" INTEGER NOT NULL DEFAULT 0, "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "DailyDeal_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
      '"QuoteRequest"': `CREATE TABLE "QuoteRequest" ("id" TEXT NOT NULL PRIMARY KEY, "buyerId" TEXT NOT NULL, "productId" TEXT, "sellerId" TEXT, "message" TEXT NOT NULL, "quantity" INTEGER, "targetPrice" DOUBLE PRECISION, "status" TEXT NOT NULL DEFAULT 'PENDING', "response" TEXT, "quotePrice" DOUBLE PRECISION, "expiresAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "QuoteRequest_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "QuoteRequest_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "QuoteRequest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE)`,
      '"Return"': `CREATE TABLE "Return" ("id" TEXT NOT NULL PRIMARY KEY, "rmaNumber" TEXT NOT NULL UNIQUE, "orderId" TEXT NOT NULL, "orderItemId" TEXT, "buyerId" TEXT NOT NULL, "sellerId" TEXT NOT NULL, "reason" TEXT NOT NULL, "description" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'REQUESTED', "refundAmount" DOUBLE PRECISION, "refundMethod" TEXT, "returnShippingMethod" TEXT, "trackingNumber" TEXT, "sellerNotes" TEXT, "adminNotes" TEXT, "approvedAt" TIMESTAMP(3), "rejectedAt" TIMESTAMP(3), "receivedAt" TIMESTAMP(3), "refundedAt" TIMESTAMP(3), "closedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Return_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "Return_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "Return_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
    }

    for (const [tableName, sql] of Object.entries(tableSQLs)) {
      if (!existingTableNames.has(tableName.replace(/"/g, ''))) {
        try {
          await db.$executeRawUnsafe(sql)
          console.log(`  ✅ Created table ${tableName}`)
        } catch (e) {
          console.error(`  ❌ Failed to create ${tableName}:`, e)
        }
      }
    }

    // Add missing columns to existing tables
    const missingColsToAdd: Array<{ table: string; name: string; type: string; default: string }> = []

    // User: pointsBalance
    const userCols = await db.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_name = 'User'`) as any[]
    const userColSet = new Set(userCols.map(c => c.column_name))
    if (!userColSet.has('pointsBalance')) missingColsToAdd.push({ table: '"User"', name: 'pointsBalance', type: 'INTEGER', default: 'DEFAULT 0' })

    // Product: brandId, attachments
    if (!existingProductCols.has('brandId')) missingColsToAdd.push({ table: '"Product"', name: 'brandId', type: 'TEXT', default: 'NULL' })
    if (!existingProductCols.has('attachments')) missingColsToAdd.push({ table: '"Product"', name: 'attachments', type: 'TEXT', default: "DEFAULT '[]'" })

    // Order: deliveryDate, deliveryTimeSlot, deliveryMethod, pickupLocationId
    const orderCols = await db.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_name = 'Order'`) as any[]
    const orderColSet = new Set(orderCols.map(c => c.column_name))
    if (!orderColSet.has('deliveryDate')) missingColsToAdd.push({ table: '"Order"', name: 'deliveryDate', type: 'TIMESTAMP(3)', default: 'NULL' })
    if (!orderColSet.has('deliveryTimeSlot')) missingColsToAdd.push({ table: '"Order"', name: 'deliveryTimeSlot', type: 'TEXT', default: 'NULL' })
    if (!orderColSet.has('deliveryMethod')) missingColsToAdd.push({ table: '"Order"', name: 'deliveryMethod', type: 'TEXT', default: "DEFAULT 'SHIPPING'" })
    if (!orderColSet.has('pickupLocationId')) missingColsToAdd.push({ table: '"Order"', name: 'pickupLocationId', type: 'TEXT', default: 'NULL' })

    // Store: pickupLocations relation
    if (!existingCols.has('pickupLocations')) { /* handled by table creation */ }

    for (const col of missingColsToAdd) {
      try {
        await db.$executeRawUnsafe(`ALTER TABLE ${col.table} ADD COLUMN "${col.name}" ${col.type} ${col.default}`)
        console.log(`  ✅ Added column ${col.table}.${col.name}`)
      } catch (e) {
        console.error(`  ❌ Failed to add column ${col.table}.${col.name}:`, e)
      }
    }

    if (missingColumns.length === 0 && tables.length > 0 && existingTableNames.size === newTables.length && missingColsToAdd.length === 0) {
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

    let msg = ''
    if (missingColumns.length > 0) {
      msg += `Added ${missingColumns.length} columns: ${missingColumns.map(c => c.name).join(', ')}`
    }
    if (tables.length === 0) {
      msg += (msg ? '; ' : '') + 'Created Report table'
    }
    return { synced: true, message: msg || 'Schema synced' }
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
// rebuild trigger 
