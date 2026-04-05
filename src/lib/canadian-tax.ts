// Canadian Provincial Tax Rates (as of 2025)
// GST: 5% federal (all provinces)
// HST: Harmonized Sales Tax (replaces GST+PST in some provinces)
// PST: Provincial Sales Tax (separate from GST in some provinces)

export interface TaxBreakdown {
  province: string
  provinceCode: string
  gst: number      // Federal GST (5%)
  hst: number      // Harmonized (replaces GST+PST)
  pst: number      // Provincial
  totalRate: number // Combined effective rate
  totalTax: number // Dollar amount
  subtotal: number // Pre-tax amount
}

export interface TaxResult {
  subtotal: number
  tax: TaxBreakdown
  total: number
}

const TAX_RATES: Record<string, { gst: number; hst: number; pst: number; label: string }> = {
  'AB': { gst: 5, hst: 0, pst: 0, label: 'Alberta — 5% GST' },
  'BC': { gst: 5, hst: 0, pst: 7, label: 'British Columbia — 5% GST + 7% PST' },
  'MB': { gst: 5, hst: 0, pst: 7, label: 'Manitoba — 5% GST + 7% PST' },
  'NB': { gst: 0, hst: 15, pst: 0, label: 'New Brunswick — 15% HST' },
  'NL': { gst: 0, hst: 15, pst: 0, label: 'Newfoundland and Labrador — 15% HST' },
  'NS': { gst: 0, hst: 15, pst: 0, label: 'Nova Scotia — 15% HST' },
  'ON': { gst: 0, hst: 13, pst: 0, label: 'Ontario — 13% HST' },
  'PE': { gst: 0, hst: 15, pst: 0, label: 'Prince Edward Island — 15% HST' },
  'QC': { gst: 5, hst: 0, pst: 9.975, label: 'Quebec — 5% GST + 9.975% QST' },
  'SK': { gst: 5, hst: 0, pst: 6, label: 'Saskatchewan — 5% GST + 6% PST' },
  'NT': { gst: 5, hst: 0, pst: 0, label: 'Northwest Territories — 5% GST' },
  'NU': { gst: 5, hst: 0, pst: 0, label: 'Nunavut — 5% GST' },
  'YT': { gst: 5, hst: 0, pst: 0, label: 'Yukon — 5% GST' },
}

// Province name to code mapping
export const PROVINCE_CODE_MAP: Record<string, string> = {
  'alberta': 'AB', 'british columbia': 'BC', 'manitoba': 'MB',
  'new brunswick': 'NB', 'newfoundland and labrador': 'NL', 'nova scotia': 'NS',
  'ontario': 'ON', 'prince edward island': 'PE', 'quebec': 'QC',
  'saskatchewan': 'SK', 'northwest territories': 'NT', 'nunavut': 'NU', 'yukon': 'YT',
  'AB': 'AB', 'BC': 'BC', 'MB': 'MB', 'NB': 'NB', 'NL': 'NL', 'NS': 'NS',
  'ON': 'ON', 'PE': 'PE', 'QC': 'QC', 'SK': 'SK', 'NT': 'NT', 'NU': 'NU', 'YT': 'YT',
}

export function getProvinceCode(province: string): string {
  const trimmed = province.trim()
  return PROVINCE_CODE_MAP[trimmed] || PROVINCE_CODE_MAP[trimmed.toLowerCase()] || PROVINCE_CODE_MAP[trimmed.toUpperCase()] || 'ON'
}

export function calculateTax(subtotal: number, provinceCode: string): TaxResult {
  const code = getProvinceCode(provinceCode)
  const rates = TAX_RATES[code] || TAX_RATES['ON']

  let gst = 0, hst = 0, pst = 0, totalTax = 0

  if (rates.hst > 0) {
    hst = subtotal * (rates.hst / 100)
    totalTax = hst
  } else {
    gst = subtotal * (rates.gst / 100)
    pst = subtotal * (rates.pst / 100)
    totalTax = gst + pst
  }

  return {
    subtotal,
    tax: {
      province: rates.label.split('—')[0].trim(),
      provinceCode: code,
      gst: Math.round(gst * 100) / 100,
      hst: Math.round(hst * 100) / 100,
      pst: Math.round(pst * 100) / 100,
      totalRate: rates.hst > 0 ? rates.hst : rates.gst + rates.pst,
      totalTax: Math.round(totalTax * 100) / 100,
      subtotal,
    },
    total: Math.round((subtotal + totalTax) * 100) / 100,
  }
}

export function getTaxRates() {
  return Object.entries(TAX_RATES).map(([code, rates]) => ({
    code,
    label: rates.label,
    totalRate: rates.hst > 0 ? rates.hst : rates.gst + rates.pst,
    gst: rates.gst,
    hst: rates.hst,
    pst: rates.pst,
  }))
}
