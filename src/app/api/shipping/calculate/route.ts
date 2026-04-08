import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// Province neighbor groups for determining shipping zones
const PROVINCE_GROUPS: Record<string, string[]> = {
  western: ["Alberta", "British Columbia", "Saskatchewan"],
  central: ["Manitoba", "Ontario"],
  atlantic: ["New Brunswick", "Newfoundland and Labrador", "Nova Scotia", "Prince Edward Island"],
  northern: ["Northwest Territories", "Nunavut", "Yukon"],
}

function getProvinceGroup(province: string): string | null {
  for (const [group, provinces] of Object.entries(PROVINCE_GROUPS)) {
    if (provinces.includes(province)) return group
  }
  return null
}

// Province slug to name mapping
const SLUG_TO_NAME: Record<string, string> = {
  alberta: "Alberta", "british-columbia": "British Columbia", manitoba: "Manitoba",
  "new-brunswick": "New Brunswick", "newfoundland-labrador": "Newfoundland and Labrador",
  "nova-scotia": "Nova Scotia", "prince-edward-island": "Prince Edward Island",
  ontario: "Ontario", quebec: "Quebec", saskatchewan: "Saskatchewan",
  "northwest-territories": "Northwest Territories", yukon: "Yukon", nunavut: "Nunavut",
}

// Province code to name mapping
const CODE_TO_NAME: Record<string, string> = {
  AB: "Alberta", BC: "British Columbia", MB: "Manitoba", NB: "New Brunswick",
  NL: "Newfoundland and Labrador", NS: "Nova Scotia", ON: "Ontario", PE: "Prince Edward Island",
  QC: "Quebec", SK: "Saskatchewan", NT: "Northwest Territories", YT: "Yukon", NU: "Nunavut",
}

function resolveProvinceName(input: string): string | null {
  if (SLUG_TO_NAME[input]) return SLUG_TO_NAME[input]
  if (CODE_TO_NAME[input.toUpperCase()]) return CODE_TO_NAME[input.toUpperCase()]
  // Try direct name match
  const allProvinces = Object.values(SLUG_TO_NAME)
  const found = allProvinces.find(p => p.toLowerCase() === input.toLowerCase())
  return found || null
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const provinceParam = searchParams.get("province") || ""
    const amount = parseFloat(searchParams.get("amount") || "0")
    const items = parseInt(searchParams.get("items") || "1")

    if (!provinceParam) {
      return NextResponse.json({ error: "Province is required" }, { status: 400 })
    }

    // Find seller province from cart items' stores (simplified: use first seller)
    // For now, default to Ontario as the seller hub
    const sellerProvince = "Ontario"
    const buyerProvince = resolveProvinceName(provinceParam)

    if (!buyerProvince) {
      return NextResponse.json({ error: "Invalid province" }, { status: 400 })
    }

    // Determine shipping zone
    let zone = "DOMESTIC"
    if (buyerProvince === sellerProvince) {
      zone = "DOMESTIC"
    } else {
      const sellerGroup = getProvinceGroup(sellerProvince)
      const buyerGroup = getProvinceGroup(buyerProvince)
      if (sellerGroup && buyerGroup && sellerGroup === buyerGroup) {
        zone = "REGIONAL"
      } else {
        zone = "DOMESTIC" // same-province or neighboring gets domestic, else domestic higher rate
      }
    }

    // Get the applicable shipping rate
    const rate = await db.shippingRate.findFirst({
      where: { zone, isActive: true, sellerId: null },
    })

    if (!rate) {
      return NextResponse.json({ cost: 0, zone, message: "No shipping rate configured" })
    }

    // Calculate cost
    let cost = rate.baseRate + (rate.perKgRate * items * 0.5)

    // Check free shipping threshold
    if (rate.freeAbove && amount >= rate.freeAbove) {
      cost = 0
    }

    cost = Math.round(cost * 100) / 100

    return NextResponse.json({
      cost,
      zone,
      freeShipping: cost === 0,
      freeAbove: rate.freeAbove,
    })
  } catch (error) {
    console.error("Error calculating shipping:", error)
    return NextResponse.json({ error: "Failed to calculate shipping" }, { status: 500 })
  }
}
