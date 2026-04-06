'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigation } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  MapPin, Search, Star, Store, Filter, X, ArrowLeft,
  Map, ExternalLink, Navigation, ChevronRight, MapPinned
} from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Province coordinates — capital cities or major metro areas
// Keys include both full names AND short codes (BC, QC, ON, etc.)
const PROVINCE_COORDS: Record<string, { lat: number; lng: number; label: string; name: string }> = {
  'Alberta':                { lat: 51.0447,  lng: -114.0719, label: 'Calgary',       name: 'Alberta' },
  'AB':                      { lat: 51.0447,  lng: -114.0719, label: 'Calgary',       name: 'Alberta' },
  'British Columbia':       { lat: 49.2827,  lng: -123.1207, label: 'Vancouver',     name: 'British Columbia' },
  'BC':                      { lat: 49.2827,  lng: -123.1207, label: 'Vancouver',     name: 'British Columbia' },
  'Manitoba':               { lat: 49.8951,  lng: -97.1384,  label: 'Winnipeg',      name: 'Manitoba' },
  'MB':                      { lat: 49.8951,  lng: -97.1384,  label: 'Winnipeg',      name: 'Manitoba' },
  'New Brunswick':          { lat: 45.9636,  lng: -66.6431,  label: 'Fredericton',   name: 'New Brunswick' },
  'NB':                      { lat: 45.9636,  lng: -66.6431,  label: 'Fredericton',   name: 'New Brunswick' },
  'Newfoundland and Labrador': { lat: 47.5615, lng: -52.7126, label: "St. John's", name: 'Newfoundland and Labrador' },
  'NL':                      { lat: 47.5615,  lng: -52.7126,  label: "St. John's",   name: 'Newfoundland and Labrador' },
  'Nova Scotia':            { lat: 44.6488,  lng: -63.5752,  label: 'Halifax',       name: 'Nova Scotia' },
  'NS':                      { lat: 44.6488,  lng: -63.5752,  label: 'Halifax',       name: 'Nova Scotia' },
  'Ontario':                { lat: 43.6532,  lng: -79.3832,  label: 'Toronto',       name: 'Ontario' },
  'ON':                      { lat: 43.6532,  lng: -79.3832,  label: 'Toronto',       name: 'Ontario' },
  'Prince Edward Island':   { lat: 46.2382,  lng: -63.1311,  label: 'Charlottetown', name: 'Prince Edward Island' },
  'PE':                      { lat: 46.2382,  lng: -63.1311,  label: 'Charlottetown', name: 'Prince Edward Island' },
  'Quebec':                 { lat: 46.8139,  lng: -71.2080,  label: 'Quebec City',   name: 'Quebec' },
  'QC':                      { lat: 46.8139,  lng: -71.2080,  label: 'Quebec City',   name: 'Quebec' },
  'Saskatchewan':           { lat: 50.4452,  lng: -104.6189, label: 'Regina',        name: 'Saskatchewan' },
  'SK':                      { lat: 50.4452,  lng: -104.6189, label: 'Regina',        name: 'Saskatchewan' },
  'Northwest Territories':  { lat: 62.4540,  lng: -114.3718, label: 'Yellowknife',   name: 'Northwest Territories' },
  'NT':                      { lat: 62.4540,  lng: -114.3718, label: 'Yellowknife',   name: 'Northwest Territories' },
  'Yukon':                  { lat: 60.7212,  lng: -135.0568, label: 'Whitehorse',    name: 'Yukon' },
  'YT':                      { lat: 60.7212,  lng: -135.0568, label: 'Whitehorse',    name: 'Yukon' },
  'Nunavut':                { lat: 68.2055,  lng: -85.2798,  label: 'Iqaluit',       name: 'Nunavut' },
  'NU':                      { lat: 68.2055,  lng: -85.2798,  label: 'Iqaluit',       name: 'Nunavut' },
}

interface SellerPin {
  storeId: string
  storeName: string
  slug: string
  sellerName: string
  province: string
  city: string
  lat: number
  lng: number
  rating: number
  totalSales: number
  totalProducts: number
  isVerified: boolean
  logo?: string | null
}

// ─── Inline Leaflet Map Component ───────────────────────────────────────────
interface MapComponentProps {
  sellers: SellerPin[]
  onSellerClick: (seller: SellerPin) => void
  selectedSeller: SellerPin | null
  flyToTarget: SellerPin | null
}

function DynamicMap({ sellers, onSellerClick, selectedSeller, flyToTarget }: MapComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const initDone = useRef(false)

  // 1️⃣  Initialise the map once
  useEffect(() => {
    if (!containerRef.current || initDone.current) return
    initDone.current = true

    let L: any
    ;(async () => {
      L = (await import('leaflet')).default

      // Fix default icon — use local copies
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/marker-icon/marker-icon-2x.png',
        iconUrl: '/marker-icon/marker-icon.png',
        shadowUrl: '/marker-icon/marker-shadow.png',
      })

      const map = L.map(containerRef.current!, {
        center: [56.0, -96.0],
        zoom: 4,
        zoomControl: false,
        scrollWheelZoom: true,
      })

      // Dark tile layer (CartoDB Dark Matter — free, no key)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 18,
      }).addTo(map)

      L.control.zoom({ position: 'bottomright' }).addTo(map)
      mapRef.current = map
      setTimeout(() => map.invalidateSize(), 300)
    })()
  }, [])

  // 2️⃣  Add / update markers whenever sellers list changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    ;(async () => {
      const L = (await import('leaflet')).default

      // Clear old markers
      markersRef.current.forEach((m) => map.removeLayer(m))
      markersRef.current = []

      // Icon factories
      const makeIcon = (gold: boolean) =>
        L.divIcon({
          className: '',
          html: `<div style="
            width:${gold ? 40 : 34}px; height:${gold ? 40 : 34}px;
            border-radius:50%;
            background:linear-gradient(135deg,${gold ? '#f59e0b,#d97706' : '#dc2626,#b91c1c'});
            border:3px solid rgba(255,255,255,.9);
            box-shadow:0 2px 8px rgba(0,0,0,.45),0 0 0 2px ${gold ? 'rgba(245,158,11,.3)' : 'rgba(220,38,38,.3)'};
            display:flex;align-items:center;justify-content:center;
            color:#fff;font-size:${gold ? 15 : 13}px;font-weight:700;
            font-family:system-ui,sans-serif;
            cursor:pointer;
            transition:transform .2s,box-shadow .2s;
          ">$</div>`,
          iconSize: [gold ? 40 : 34, gold ? 40 : 34],
          iconAnchor: [gold ? 20 : 17, gold ? 20 : 17],
          popupAnchor: [0, -22],
        })

      sellers.forEach((seller) => {
        const isGold = seller.totalSales >= 50
        const marker = L.marker([seller.lat, seller.lng], {
          icon: makeIcon(isGold),
        })

        // Tooltip on hover
        marker.bindTooltip(
          `<div style="font-weight:600;font-size:12px;font-family:system-ui,sans-serif">${seller.storeName}</div>` +
          `<div style="color:#a8a29e;font-size:11px">${seller.city}, ${seller.province}</div>`,
          { direction: 'top', offset: [0, -10] },
        )

        marker.on('click', () => onSellerClick(seller))
        marker.addTo(map)
        markersRef.current.push(marker)
      })
    })()
  }, [sellers, onSellerClick])

  // 3️⃣  Fly-to animation when user clicks a seller from sidebar
  useEffect(() => {
    const map = mapRef.current
    if (!map || !flyToTarget) return
    map.flyTo([flyToTarget.lat, flyToTarget.lng], 8, { duration: 1.2 })
  }, [flyToTarget])

  // 4️⃣  Highlight selected marker
  useEffect(() => {
    if (!mapRef.current) return
    markersRef.current.forEach((marker, i) => {
      const seller = sellers[i]
      if (!seller) return
      const isSelected = selectedSeller?.storeId === seller.storeId
      const el = marker.getElement()
      if (!el) return
      const inner = el.querySelector('div') as HTMLElement | null
      if (!inner) return
      inner.style.transform = isSelected ? 'scale(1.35)' : 'scale(1)'
      inner.style.zIndex = isSelected ? '1000' : ''
      if (isSelected) {
        marker.openTooltip()
      }
    })
  }, [selectedSeller, sellers])

  // 5️⃣  Resize handler
  useEffect(() => {
    const onResize = () => mapRef.current?.invalidateSize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function SellerLocatorPage() {
  const { navigate } = useNavigation()
  const [sellers, setSellers] = useState<SellerPin[]>([])
  const [allSellers, setAllSellers] = useState<SellerPin[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [selectedSeller, setSelectedSeller] = useState<SellerPin | null>(null)
  const [flyToTarget, setFlyToTarget] = useState<SellerPin | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch stores from dedicated API
  useEffect(() => {
    async function fetchStores() {
      try {
        const res = await fetch('/api/stores')
        if (!res.ok) return
        const stores: any[] = await res.json()

        const pins: SellerPin[] = stores.map((store) => {
          const rawProvince = store.seller?.province || 'Ontario'
          const city = store.seller?.city || 'Unknown'
          const coords = PROVINCE_COORDS[rawProvince] || PROVINCE_COORDS['Ontario']
          const province = coords?.name || rawProvince // Resolve short code → full name
          return {
            storeId: store.id,
            storeName: store.name,
            slug: store.slug,
            sellerName: store.seller?.name || 'Seller',
            province,
            city,
            lat: coords.lat + (Math.random() - 0.5) * 2,
            lng: coords.lng + (Math.random() - 0.5) * 2,
            rating: store.rating || 4.5,
            totalSales: store.totalSales || 0,
            totalProducts: store._count?.products || 0,
            isVerified: store.seller?.isVerified || false,
            logo: store.logo || null,
          }
        })

        setAllSellers(pins)
        setSellers(pins)
      } catch (e) {
        console.error('Failed to fetch stores:', e)
      }
      setLoading(false)
    }
    fetchStores()
  }, [])

  // Filter
  const filteredSellers = sellers.filter((s) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      !q ||
      s.storeName.toLowerCase().includes(q) ||
      s.sellerName.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.province.toLowerCase().includes(q)
    const matchesProvince = !selectedProvince || s.province === selectedProvince
    return matchesSearch && matchesProvince
  })

  // Province counts from ALL sellers (using resolved full names)
  const provinceCounts: Record<string, number> = {}
  allSellers.forEach((s) => {
    provinceCounts[s.province] = (provinceCounts[s.province] || 0) + 1
  })
  const sellerProvinces = [...new Set(allSellers.map((s) => s.province))].sort()

  // Stable callback for map marker clicks
  const handleMapSellerClick = useCallback((seller: SellerPin) => {
    setSelectedSeller(seller)
  }, [])

  // Sidebar seller click → also fly to
  const handleSidebarClick = useCallback((seller: SellerPin) => {
    setSelectedSeller(seller)
    setFlyToTarget(seller)
    // Reset flyToTarget after animation so re-clicks still work
    setTimeout(() => setFlyToTarget(null), 1500)
  }, [])

  const goToStorefront = (seller: SellerPin) => {
    navigate('storefront', { slug: seller.slug })
  }

  const goToRandomStore = () => {
    if (filteredSellers.length === 0) return
    const random = filteredSellers[Math.floor(Math.random() * filteredSellers.length)]
    handleSidebarClick(random)
  }

  return (
    <div className="min-h-screen bg-cm-bg">
      {/* ── Custom Leaflet overrides (scoped via a wrapper class) ── */}
      <style>{`
        .cm-seller-locator .leaflet-container        { background: #0a0a0a !important; z-index:1; }
        .cm-seller-locator .leaflet-control-zoom a    { background-color:#171717!important; color:#f5f5f4!important;
          border-color:rgba(255,255,255,.1)!important; width:32px!important; height:32px!important;
          line-height:32px!important; font-size:16px!important; }
        .cm-seller-locator .leaflet-control-zoom a:hover { background-color:#262626!important; }
        .cm-seller-locator .leaflet-control-zoom      { border:none!important; box-shadow:0 2px 10px rgba(0,0,0,.3)!important; }
        .cm-seller-locator .leaflet-tooltip            { background:#171717!important; border:1px solid rgba(255,255,255,.12)!important;
          border-radius:10px!important; padding:8px 12px!important; box-shadow:0 4px 14px rgba(0,0,0,.5)!important;
          font-family:system-ui,sans-serif!important; color:#f5f5f4!important; }
        .cm-seller-locator .leaflet-tooltip-top::before { border-top-color:#171717!important; }
        .cm-seller-locator .leaflet-tooltip-bottom::before { border-bottom-color:#171717!important; }
        .cm-seller-locator .leaflet-control-attribution { background:rgba(10,10,10,.85)!important; color:#57534e!important;
          font-size:10px!important; padding:2px 8px!important; border-radius:4px!important;
          border:1px solid rgba(255,255,255,.05)!important; }
        .cm-seller-locator .leaflet-control-attribution a { color:#78716c!important; }
      `}</style>

      {/* ── Hero ── */}
      <section className="relative py-20 px-6 bg-gradient-to-b from-red-900/10 via-transparent to-transparent">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/3 w-80 h-80 bg-red-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <button
            onClick={() => navigate('home')}
            className="inline-flex items-center gap-2 text-sm text-cm-dim hover:text-cm-secondary mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </button>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 mb-6">
            <MapPinned className="w-4 h-4 text-red-300" />
            <span className="text-xs font-medium text-red-300 uppercase tracking-[0.2em]">Find Sellers Near You</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Seller <span className="bg-gradient-to-r from-red-300 to-red-400 bg-clip-text text-transparent">Locator</span>
          </h1>
          <p className="text-cm-muted font-light max-w-2xl mx-auto mb-8">
            Discover verified sellers across Canada. Click any marker to view their storefront and browse their products.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-cm-dim">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-400" />
              <strong className="text-cm-secondary">{allSellers.length}</strong> verified sellers
            </span>
            <span className="text-cm-faint">|</span>
            <span className="flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-red-300" />
              <strong className="text-cm-secondary">{sellerProvinces.length}</strong> provinces
            </span>
          </div>
        </div>
      </section>

      {/* ── Main Map + Sidebar ── */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6" style={{ height: '620px' }}>

            {/* ── Sidebar ── */}
            <div className="w-full lg:w-80 flex-shrink-0 flex flex-col rounded-2xl border border-cm-border-subtle bg-cm-elevated/80 backdrop-blur-sm overflow-hidden">
              {/* Search + Filter Toggle */}
              <div className="p-4 border-b border-cm-border-subtle">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-dim" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search sellers, cities..."
                    className="w-full pl-10 pr-9 h-10 bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint rounded-xl text-sm focus:border-red-500/30 focus:ring-1 focus:ring-red-500/20"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-cm-dim hover:text-cm-secondary">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="mt-2 flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-cm-hover border border-cm-border-hover text-sm text-cm-secondary hover:bg-cm-hover-strong hover:text-cm-primary transition-all"
                >
                  <Filter className="w-4 h-4" />
                  {showFilters ? 'Hide Filters' : 'Filter by Province'}
                  {selectedProvince && (
                    <Badge className="ml-auto bg-red-500/10 text-red-300 border-red-500/20 text-[10px] border">
                      1 active
                    </Badge>
                  )}
                </button>
              </div>

              {/* Province Filter Panel */}
              {showFilters && (
                <div className="px-4 py-3 border-b border-cm-border-subtle space-y-1 max-h-52 overflow-y-auto">
                  <button
                    onClick={() => setSelectedProvince(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${!selectedProvince ? 'bg-red-500/10 text-white' : 'text-cm-secondary hover:bg-cm-hover'}`}
                  >
                    All Provinces ({allSellers.length})
                  </button>
                  {sellerProvinces.map((prov) => (
                    <button
                      key={prov}
                      onClick={() => setSelectedProvince(selectedProvince === prov ? null : prov)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${selectedProvince === prov ? 'bg-red-500/10 text-white' : 'text-cm-secondary hover:bg-cm-hover'}`}
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-cm-faint" />
                        {prov}
                      </span>
                      <span className="text-xs text-cm-faint bg-cm-hover px-2 py-0.5 rounded-full">
                        {provinceCounts[prov] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Seller Detail Card */}
              {selectedSeller && (
                <div className="px-4 py-4 border-b border-cm-border-subtle bg-red-500/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-white ${
                        selectedSeller.totalSales >= 50
                          ? 'bg-gradient-to-br from-red-500 to-red-600'
                          : 'bg-gradient-to-br from-red-600 to-red-700'
                      }`}>
                        {selectedSeller.storeName.charAt(0).toUpperCase()}
                      </div>
                      <h3 className="text-sm font-semibold text-cm-secondary truncate">{selectedSeller.storeName}</h3>
                    </div>
                    <button onClick={() => setSelectedSeller(null)} className="text-cm-dim hover:text-cm-secondary flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-cm-muted">
                      <MapPin className="w-3.5 h-3.5 text-cm-dim flex-shrink-0" />
                      {selectedSeller.city}, {selectedSeller.province}
                    </div>
                    <div className="flex items-center gap-2 text-cm-muted">
                      <Star className="w-3.5 h-3.5 text-red-300 fill-red-300 flex-shrink-0" />
                      <span>{selectedSeller.rating.toFixed(1)} rating</span>
                      <span className="text-cm-faint">· {selectedSeller.totalSales} sales</span>
                    </div>
                    <div className="flex items-center gap-2 text-cm-muted">
                      <Store className="w-3.5 h-3.5 text-cm-dim flex-shrink-0" />
                      <span className="text-xs text-cm-dim">{selectedSeller.totalProducts} products listed</span>
                    </div>
                    <Button
                      onClick={() => goToStorefront(selectedSeller)}
                      className="w-full mt-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-sm shadow-lg shadow-red-500/20"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Storefront
                    </Button>
                  </div>
                </div>
              )}

              {/* Seller List */}
              <ScrollArea className="flex-1 px-2">
                <div className="py-2 space-y-1.5">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="p-4 rounded-xl bg-cm-hover animate-pulse" style={{ height: '72px' }} />
                    ))
                  ) : filteredSellers.length === 0 ? (
                    <div className="text-center py-10 px-4">
                      <MapPin className="w-8 h-8 text-cm-faint mx-auto mb-2" />
                      <p className="text-sm text-cm-faint">No sellers found</p>
                      <button
                        onClick={() => { setSearchQuery(''); setSelectedProvince(null) }}
                        className="text-xs text-red-400 hover:underline mt-2"
                      >
                        Clear all filters
                      </button>
                    </div>
                  ) : (
                    filteredSellers.map((seller) => (
                      <button
                        key={seller.storeId}
                        onClick={() => handleSidebarClick(seller)}
                        className={`w-full text-left p-3 rounded-xl transition-all group ${
                          selectedSeller?.storeId === seller.storeId
                            ? 'bg-red-500/10 border border-red-500/20'
                            : 'hover:bg-cm-hover border border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-white shadow-lg ${
                            seller.totalSales >= 50
                              ? 'bg-gradient-to-br from-red-500 to-red-600'
                              : 'bg-gradient-to-br from-red-600 to-red-700'
                          }`}>
                            {seller.storeName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-cm-secondary truncate group-hover:text-white transition-colors">
                              {seller.storeName}
                            </h4>
                            <p className="text-xs text-cm-dim truncate">{seller.city}, {seller.province}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="flex items-center gap-0.5 text-xs text-cm-dim">
                                <Star className="w-3 h-3 text-red-300 fill-red-300" />
                                {seller.rating.toFixed(1)}
                              </span>
                              <span className="text-[10px] text-cm-faint">{seller.totalProducts} products</span>
                              {seller.totalSales >= 50 && (
                                <Badge className="bg-red-500/10 text-red-300 border-red-500/20 text-[9px] px-1.5 py-0 border">
                                  GOLD
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-cm-faint group-hover:text-cm-muted flex-shrink-0 mt-1" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Bottom Bar */}
              <div className="px-4 py-3 border-t border-cm-border-subtle flex items-center justify-between text-xs text-cm-faint">
                <span>{filteredSellers.length} of {allSellers.length} sellers</span>
                <button onClick={goToRandomStore} className="text-red-400 hover:text-red-300 hover:underline flex items-center gap-1">
                  Random Store <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* ── Map ── */}
            <div className="flex-1 rounded-2xl border border-cm-border-subtle overflow-hidden relative cm-seller-locator">
              {/* Top gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent z-10 pointer-events-none" />

              {loading ? (
                <div className="w-full h-full flex items-center justify-center bg-cm-elevated">
                  <div className="text-center">
                    <div className="w-10 h-10 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-cm-faint">Loading map...</p>
                  </div>
                </div>
              ) : (
                <DynamicMap
                  sellers={filteredSellers}
                  onSellerClick={handleMapSellerClick}
                  selectedSeller={selectedSeller}
                  flyToTarget={flyToTarget}
                />
              )}

              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 z-10">
                <div className="p-3 rounded-xl bg-cm-bg/90 backdrop-blur-xl border border-cm-border-hover shadow-lg shadow-black/30">
                  <p className="text-[10px] text-cm-dim uppercase tracking-wider font-medium mb-2">Legend</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-600 to-red-700 border-2 border-white/80 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">$</div>
                      <span className="text-[10px] text-cm-muted">Verified Seller</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-red-500 to-red-600 border-2 border-white/80 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">$</div>
                      <span className="text-[10px] text-cm-muted">Gold Seller (50+ sales)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Province Quick-Jump */}
              <div className="absolute top-3 right-3 z-10 hidden xl:block">
                <div className="p-2 rounded-xl bg-cm-bg/90 backdrop-blur-xl border border-cm-border-hover shadow-lg">
                  <p className="text-[10px] text-cm-dim uppercase tracking-wider font-medium px-1 mb-1">Jump to</p>
                  <div className="grid grid-cols-2 gap-0.5">
                    {sellerProvinces.slice(0, 12).map((prov) => (
                      <button
                        key={prov}
                        onClick={() => {
                          const coords = PROVINCE_COORDS[prov]
                          if (coords) {
                            const fakeSeller: SellerPin = {
                              storeId: `province-${prov}`, storeName: prov, slug: '',
                              sellerName: '', province: prov, city: coords.label,
                              lat: coords.lat, lng: coords.lng,
                              rating: 0, totalSales: 0, totalProducts: 0, isVerified: false,
                            }
                            setFlyToTarget(fakeSeller)
                            setTimeout(() => setFlyToTarget(null), 1500)
                          }
                        }}
                        className="px-2 py-1 rounded-lg text-[10px] text-cm-secondary hover:bg-cm-hover-strong hover:text-cm-primary transition-all text-left truncate"
                      >
                        {prov.length > 14 ? prov.slice(0, 12) + '...' : prov}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-cm-primary">
              How It <span className="bg-gradient-to-r from-red-300 to-red-400 bg-clip-text text-transparent">Works</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-cm-hover border border-cm-border-subtle text-center">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-sm font-semibold text-cm-secondary mb-2">1. Search</h3>
                <p className="text-xs text-cm-dim leading-relaxed">Browse the map or use the sidebar to search by seller name, city, or province. All sellers are verified Canadian businesses.</p>
              </div>
              <div className="p-6 rounded-2xl bg-cm-hover border border-cm-border-subtle text-center">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-5 h-5 text-red-300" />
                </div>
                <h3 className="text-sm font-semibold text-cm-secondary mb-2">2. Click</h3>
                <p className="text-xs text-cm-dim leading-relaxed">Click any seller marker on the map to see their details, rating, total sales, and product count at a glance.</p>
              </div>
              <div className="p-6 rounded-2xl bg-cm-hover border border-cm-border-subtle text-center">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <ExternalLink className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-sm font-semibold text-cm-secondary mb-2">3. Visit</h3>
                <p className="text-xs text-cm-dim leading-relaxed">Click &quot;Visit Storefront&quot; to browse their full product catalog and start shopping safely with escrow protection.</p>
              </div>
          </div>
        </div>
      </section>
    </div>
  )
}
