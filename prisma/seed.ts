import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

async function seed() {
  console.log("🌱 Seeding Canada Marketplace database...")

  // Clear existing data (order matters due to foreign keys)
  await db.appliedCoupon.deleteMany()
  await db.coupon.deleteMany()
  await db.message.deleteMany()
  await db.conversation.deleteMany()
  await db.cartItem.deleteMany()
  await db.dispute.deleteMany()
  await db.review.deleteMany()
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.product.deleteMany()
  await db.payout.deleteMany()
  await db.notification.deleteMany()
  await db.siteSetting.deleteMany()
  await db.store.deleteMany()
  await db.province.deleteMany()
  await db.category.deleteMany()
  await db.user.deleteMany()

  // Create Categories
  const categories = await Promise.all([
    db.category.create({ data: { name: "T-Shirts", slug: "tshirts", icon: "tshirt-crew", productCount: 8 } }),
    db.category.create({ data: { name: "Mugs", slug: "mugs", icon: "cup", productCount: 5 } }),
    db.category.create({ data: { name: "Caps", slug: "caps", icon: "hat-fedora", productCount: 5 } }),
    db.category.create({ data: { name: "Music & Culture", slug: "music-culture", icon: "music-note", productCount: 3 } }),
  ])
  console.log(`  ✅ ${categories.length} categories`)

  // Create Provinces
  const provinces = await Promise.all([
    db.province.create({ data: { name: "Alberta", slug: "alberta", code: "AB", listingCount: 2400 } }),
    db.province.create({ data: { name: "British Columbia", slug: "british-columbia", code: "BC", listingCount: 5100 } }),
    db.province.create({ data: { name: "Manitoba", slug: "manitoba", code: "MB", listingCount: 1800 } }),
    db.province.create({ data: { name: "New Brunswick", slug: "new-brunswick", code: "NB", listingCount: 900 } }),
    db.province.create({ data: { name: "Newfoundland and Labrador", slug: "newfoundland-labrador", code: "NL", listingCount: 700 } }),
    db.province.create({ data: { name: "Nova Scotia", slug: "nova-scotia", code: "NS", listingCount: 1200 } }),
    db.province.create({ data: { name: "Ontario", slug: "ontario", code: "ON", listingCount: 12500 } }),
    db.province.create({ data: { name: "Prince Edward Island", slug: "prince-edward-island", code: "PE", listingCount: 400 } }),
    db.province.create({ data: { name: "Quebec", slug: "quebec", code: "QC", listingCount: 9800 } }),
    db.province.create({ data: { name: "Saskatchewan", slug: "saskatchewan", code: "SK", listingCount: 1600 } }),
    db.province.create({ data: { name: "Northwest Territories", slug: "northwest-territories", code: "NT", listingCount: 150 } }),
    db.province.create({ data: { name: "Yukon", slug: "yukon", code: "YT", listingCount: 200 } }),
    db.province.create({ data: { name: "Nunavut", slug: "nunavut", code: "NU", listingCount: 100 } }),
  ])
  console.log(`  ✅ ${provinces.length} provinces`)

  // Create Admin User
  const adminPassword = await bcrypt.hash("Admin123!", 12)
  const admin = await db.user.create({
    data: {
      email: "admin@canadamarketplace.ca",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
      isVerified: true,
      province: "Ontario",
      city: "Ottawa",
    },
  })

  // Create Seller Users with Stores
  const sellerData = [
    { name: "tunogkalye.net", email: "sarah@techshop.ca", store: "tunogkalye.net", province: "ON", city: "Toronto", desc: "tunogkalye.net Store — Street sound culture meets Canadian style. Premium quality T-shirts, mugs, and caps inspired by the rhythm of the streets. All prices in CAD." },
    { name: "Marco Reyes", email: "jp@montrealfashion.ca", store: "Tunog Kalye West", province: "BC", city: "Vancouver", desc: "Tunog Kalye West Coast edition. Bringing street music culture to British Columbia. Premium streetwear and accessories." },
    { name: "Émile Tremblay", email: "mike@homegear.ca", store: "Tunog Kalye Québec", province: "QC", city: "Montréal", desc: "Tunog Kalyé — Le son des rues, le style du Québec. Produits officiels Tunog Kalye pour la communauté québécoise." },
    { name: "Aisha Khan", email: "emily@sportsplus.ca", store: "Tunog Kalye Prairies", province: "AB", city: "Calgary", desc: "Tunog Kalye Prairies — Street sound across Alberta and the Prairies. Official Tunog Kalye merchandise." },
    { name: "Jordan Williams", email: "david@canread.ca", store: "Tunog Kalye Atlantic", province: "NS", city: "Halifax", desc: "Tunog Kalye Atlantic — East Coast vibes, street sound culture. Shipping across the Maritimes." },
  ]

  const sellers = []
  for (const s of sellerData) {
    const sellerPassword = await bcrypt.hash("Seller123!", 12)
    const seller = await db.user.create({
      data: {
        email: s.email,
        password: sellerPassword,
        name: s.name,
        role: "SELLER",
        isVerified: true,
        province: s.province,
        city: s.city,
        store: {
          create: {
            name: s.store,
            slug: s.store.toLowerCase().replace(/\s+/g, "-"),
            description: s.desc,
            rating: 4 + Math.random() * 0.9,
            totalSales: Math.floor(Math.random() * 500) + 50,
          },
        },
      },
      include: { store: true },
    })
    sellers.push(seller)
  }
  console.log(`  ✅ ${sellers.length} sellers with stores`)

  // Create Buyer Users
  const buyerData = [
    { name: "Alex Johnson", email: "alex@gmail.com", province: "ON", city: "Toronto" },
    { name: "Marie Tremblay", email: "marie@hotmail.com", province: "QC", city: "Québec City" },
    { name: "Chris Brown", email: "chris@outlook.com", province: "AB", city: "Edmonton" },
    { name: "Priya Patel", email: "priya@gmail.com", province: "BC", city: "Surrey" },
    { name: "Tom Harris", email: "tom@yahoo.ca", province: "MB", city: "Winnipeg" },
  ]

  const buyerPassword = await bcrypt.hash("Buyer123!", 12)
  const buyers = await Promise.all(
    buyerData.map((b) =>
      db.user.create({
        data: {
          email: b.email,
          password: buyerPassword,
          name: b.name,
          role: "BUYER",
          province: b.province,
          city: b.city,
        },
      })
    )
  )
  console.log(`  ✅ ${buyers.length} buyers`)

  // Create Products
  const productTemplates = [
    // T-Shirts (by tunogkalye.net - Seller 0)
    { title: 'Tunog Kalye Classic Logo Tee — Black', cat: "tshirts", seller: 0, price: 32.99, condition: "NEW", desc: "The iconic Tunog Kalye logo on premium 100% cotton. Classic black tee for street music lovers. Comfortable fit, durable print.", images: ["/products/tshirt-classic-black.png", "/products/tshirt-neon-soundwave.png"], isFeatured: true },
    { title: 'Tunog Kalye Classic Logo Tee — White', cat: "tshirts", seller: 0, price: 32.99, condition: "NEW", desc: "The iconic Tunog Kalye logo on crisp white cotton. A clean look for any occasion. Comfortable fit, durable print.", images: ["/products/tshirt-classic-white.png", "/products/tshirt-street-vibes.png"], isFeatured: false },
    { title: 'Tunog Kalye "Street Vibes" Graphic Tee', cat: "tshirts", seller: 0, price: 34.99, condition: "NEW", desc: "Bold graphic design inspired by urban sound culture. Premium cotton blend with vibrant colours that last. Street vibes guaranteed.", images: ["/products/tshirt-street-vibes.png", "/products/tshirt-classic-black.png"], isFeatured: true },
    { title: 'Tunog Kalye "Bass Drop" Music Tee', cat: "tshirts", seller: 0, price: 34.99, condition: "NEW", desc: "Feel the bass drop with this eye-catching music tee. Features a stylised bass waveform graphic. Premium quality print.", images: ["/products/tshirt-bass-drop.png", "/products/tshirt-neon-soundwave.png"], isFeatured: false },
    { title: 'Tunog Kalye "Pinoy Pride" Heritage Tee', cat: "tshirts", seller: 0, price: 36.99, condition: "NEW", desc: "Celebrate Filipino heritage with Tunog Kalye. This heritage tee combines cultural pride with street sound energy. Premium cotton.", images: ["/products/tshirt-pinoy-pride.png", "/products/tshirt-retro-wave.png"], isFeatured: false },
    { title: 'Tunog Kalye Retro Wave Tee', cat: "tshirts", seller: 0, price: 34.99, condition: "NEW", desc: "Retro-inspired design meets street culture. The Tunog Kalye Retro Wave tee takes you back to the golden era of sound. Vibrant colours.", images: ["/products/tshirt-retro-wave.png", "/products/tshirt-bass-drop.png"], isFeatured: false },
    { title: 'Tunog Kalye Neon Soundwave Tee', cat: "tshirts", seller: 0, price: 34.99, condition: "NEW", desc: "Light up the streets with this neon soundwave design. Glowing colours on dark fabric. Premium quality, made to stand out.", images: ["/products/tshirt-neon-soundwave.png", "/products/tshirt-kalye-life.png"], isFeatured: false },
    { title: 'Tunog Kalye "Kalye Life" Urban Tee', cat: "tshirts", seller: 0, price: 32.99, condition: "NEW", desc: "Live the Kalye life! This urban tee celebrates the everyday rhythm of the streets. Comfortable and stylish, perfect for any day.", images: ["/products/tshirt-kalye-life.png", "/products/tshirt-pinoy-pride.png"], isFeatured: false },
    // Mugs (by Tunog Kalye West - Seller 1)
    { title: 'Tunog Kalye Soundwave Ceramic Mug', cat: "mugs", seller: 1, price: 17.99, condition: "NEW", desc: "Start your morning with the sound of Tunog Kalye. Premium ceramic mug with a sleek soundwave design. Microwave and dishwasher safe.", images: ["/products/mug-soundwave.png", "/products/mug-music-lover.png"], isFeatured: true },
    { title: 'Tunog Kalye Logo Travel Tumbler', cat: "mugs", seller: 1, price: 22.99, condition: "NEW", desc: "Take Tunog Kalye on the go. Insulated stainless steel tumbler with the official logo. Keeps drinks hot or cold for hours.", images: ["/products/mug-travel-tumbler.png", "/products/mug-soundwave.png"], isFeatured: false },
    { title: 'Tunog Kalye "Morning Beats" Coffee Mug', cat: "mugs", seller: 1, price: 16.99, condition: "NEW", desc: "Every morning needs beats and coffee. This fun ceramic mug features the Morning Beats design. Great gift for music lovers.", images: ["/products/mug-morning-beats.png", "/products/mug-beats-coffee.png"], isFeatured: false },
    { title: 'Tunog Kalye "Music Lover" Ceramic Mug', cat: "mugs", seller: 1, price: 17.99, condition: "NEW", desc: "Show your love for music with this beautifully designed ceramic mug. Features Tunog Kalye's Music Lover graphic. 11oz capacity.", images: ["/products/mug-music-lover.png", "/products/mug-morning-beats.png"], isFeatured: false },
    { title: 'Tunog Kalye "Beats & Coffee" Mug', cat: "mugs", seller: 1, price: 19.99, condition: "NEW", desc: "The perfect duo: beats and coffee. This premium ceramic mug features a stylish Beats & Coffee design. A must-have for your desk.", images: ["/products/mug-beats-coffee.png", "/products/mug-travel-tumbler.png"], isFeatured: false },
    // Caps (by Tunog Kalye Québec - Seller 2)
    { title: 'Tunog Kalye Classic Snapback — Black', cat: "caps", seller: 2, price: 29.99, condition: "NEW", desc: "The classic Tunog Kalye snapback in black. Embroidered logo, adjustable snap closure. One size fits all. Premium quality.", images: ["/products/cap-snapback-black.png", "/products/cap-trucker.png"], isFeatured: true },
    { title: 'Tunog Kalye Classic Snapback — Red', cat: "caps", seller: 2, price: 29.99, condition: "NEW", desc: "Stand out with the Tunog Kalye snapback in bold red. Embroidered logo, adjustable snap closure. One size fits all.", images: ["/products/cap-snapback-red.png", "/products/cap-snapback-black.png"], isFeatured: false },
    { title: 'Tunog Kalye Trucker Hat', cat: "caps", seller: 2, price: 27.99, condition: "NEW", desc: "Classic trucker style with Tunog Kalye flair. Mesh back for breathability, embroidered front logo. Perfect for summer.", images: ["/products/cap-trucker.png", "/products/cap-dad-hat.png"], isFeatured: false },
    { title: 'Tunog Kalye Dad Hat — Khaki', cat: "caps", seller: 2, price: 26.99, condition: "NEW", desc: "Relaxed dad hat style with Tunog Kalye branding. Soft washed cotton, adjustable brass buckle. Effortlessly cool.", images: ["/products/cap-dad-hat.png", "/products/cap-trucker.png"], isFeatured: false },
    { title: 'Tunog Kalye "Bass" Embroidered Cap', cat: "caps", seller: 2, price: 31.99, condition: "NEW", desc: "Premium embroidered cap featuring the Tunog Kalye Bass design. Structured crown, curved brim. A statement piece for bass lovers.", images: ["/products/cap-bass-embroidered.png", "/products/cap-snapback-black.png"], isFeatured: false },
  ]

  const catMap: Record<string, number> = {}
  categories.forEach((c, i) => { catMap[c.slug] = i })

  const products = []
  for (const p of productTemplates) {
    const seller = sellers[p.seller]
    const catIndex = catMap[p.cat]
    const product = await db.product.create({
      data: {
        title: p.title,
        slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""),
        description: p.desc,
        price: p.price,
        comparePrice: Math.round(p.price * 1.2),
        condition: p.condition,
        categoryId: categories[catIndex].id,
        storeId: seller.store!.id,
        province: seller.province,
        city: seller.city,
        images: JSON.stringify(p.images),
        stock: 10,
        sold: Math.floor(Math.random() * 20),
        status: "ACTIVE",
        isFeatured: p.isFeatured,
        views: Math.floor(Math.random() * 500),
      },
    })
    products.push(product)
  }
  console.log(`  ✅ ${products.length} products`)

  // Create Product Variants
  const variantData: Record<number, Array<{ name: string; value: string; priceDelta: number; stock: number }>> = {
    // T-Shirts - Size variants (products 0-7)
    0: [
      { name: 'Size', value: 'S', priceDelta: 0, stock: 8 },
      { name: 'Size', value: 'M', priceDelta: 0, stock: 12 },
      { name: 'Size', value: 'L', priceDelta: 0, stock: 10 },
      { name: 'Size', value: 'XL', priceDelta: 0, stock: 6 },
      { name: 'Size', value: 'XXL', priceDelta: 3, stock: 4 },
    ],
    1: [
      { name: 'Size', value: 'S', priceDelta: 0, stock: 8 },
      { name: 'Size', value: 'M', priceDelta: 0, stock: 12 },
      { name: 'Size', value: 'L', priceDelta: 0, stock: 10 },
      { name: 'Size', value: 'XL', priceDelta: 0, stock: 6 },
      { name: 'Size', value: 'XXL', priceDelta: 3, stock: 4 },
    ],
    2: [
      { name: 'Size', value: 'S', priceDelta: 0, stock: 6 },
      { name: 'Size', value: 'M', priceDelta: 0, stock: 10 },
      { name: 'Size', value: 'L', priceDelta: 0, stock: 8 },
      { name: 'Size', value: 'XL', priceDelta: 0, stock: 5 },
      { name: 'Size', value: 'XXL', priceDelta: 3, stock: 3 },
    ],
    3: [
      { name: 'Size', value: 'S', priceDelta: 0, stock: 6 },
      { name: 'Size', value: 'M', priceDelta: 0, stock: 10 },
      { name: 'Size', value: 'L', priceDelta: 0, stock: 8 },
      { name: 'Size', value: 'XL', priceDelta: 0, stock: 5 },
    ],
    4: [
      { name: 'Size', value: 'S', priceDelta: 0, stock: 5 },
      { name: 'Size', value: 'M', priceDelta: 0, stock: 8 },
      { name: 'Size', value: 'L', priceDelta: 0, stock: 6 },
      { name: 'Size', value: 'XL', priceDelta: 0, stock: 4 },
    ],
    5: [
      { name: 'Size', value: 'S', priceDelta: 0, stock: 6 },
      { name: 'Size', value: 'M', priceDelta: 0, stock: 10 },
      { name: 'Size', value: 'L', priceDelta: 0, stock: 8 },
      { name: 'Size', value: 'XL', priceDelta: 0, stock: 5 },
    ],
    6: [
      { name: 'Size', value: 'S', priceDelta: 0, stock: 6 },
      { name: 'Size', value: 'M', priceDelta: 0, stock: 10 },
      { name: 'Size', value: 'L', priceDelta: 0, stock: 8 },
      { name: 'Size', value: 'XL', priceDelta: 0, stock: 5 },
    ],
    7: [
      { name: 'Size', value: 'S', priceDelta: 0, stock: 8 },
      { name: 'Size', value: 'M', priceDelta: 0, stock: 12 },
      { name: 'Size', value: 'L', priceDelta: 0, stock: 10 },
      { name: 'Size', value: 'XL', priceDelta: 0, stock: 6 },
    ],
    // Mugs - No variants needed (products 8-12) — mugs are one-size
    // Caps - Size variants (products 13-17)
    13: [
      { name: 'Size', value: 'One Size', priceDelta: 0, stock: 10 },
    ],
    14: [
      { name: 'Size', value: 'One Size', priceDelta: 0, stock: 10 },
    ],
    15: [
      { name: 'Size', value: 'One Size', priceDelta: 0, stock: 8 },
    ],
    16: [
      { name: 'Size', value: 'One Size', priceDelta: 0, stock: 8 },
    ],
    17: [
      { name: 'Size', value: 'One Size', priceDelta: 0, stock: 6 },
    ],
  }

  let variantCount = 0
  for (const [productIndex, variants] of Object.entries(variantData)) {
    const product = products[parseInt(productIndex)]
    if (!product) continue
    for (let i = 0; i < variants.length; i++) {
      await db.productVariant.create({
        data: {
          productId: product.id,
          name: variants[i].name,
          value: variants[i].value,
          priceDelta: variants[i].priceDelta,
          stock: variants[i].stock,
          position: i,
        },
      })
      variantCount++
    }
  }
  console.log(`  ✅ ${variantCount} product variants`)

  // Create Orders
  const orderStatuses = ["PAID", "SHIPPED", "DELIVERED", "PENDING", "CANCELLED", "DISPUTED"]
  const orders = []
  for (let i = 0; i < 15; i++) {
    const buyer = buyers[Math.floor(Math.random() * buyers.length)]
    const numItems = Math.floor(Math.random() * 3) + 1
    const orderItems: any[] = []
    let subtotal = 0

    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)]
      const qty = Math.floor(Math.random() * 2) + 1
      orderItems.push({
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: qty,
        image: JSON.parse(product.images)[0],
      })
      subtotal += product.price * qty
    }

    const fee = Math.round(subtotal * 0.08 * 100) / 100
    const total = subtotal + fee
    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)]

    const order = await db.order.create({
      data: {
        orderNumber: `CM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        buyerId: buyer.id,
        status,
        subtotal,
        fee,
        total,
        shippingAddress: `${100 + Math.floor(Math.random() * 9000)} Main St`,
        shippingCity: buyer.city,
        shippingProvince: buyer.province,
        shippingPostalCode: "A1A 1A1",
        paidAt: ["PAID", "SHIPPED", "DELIVERED", "DISPUTED"].includes(status) ? new Date(Date.now() - Math.random() * 30 * 86400000) : null,
        shippedAt: ["SHIPPED", "DELIVERED"].includes(status) ? new Date(Date.now() - Math.random() * 14 * 86400000) : null,
        deliveredAt: status === "DELIVERED" ? new Date(Date.now() - Math.random() * 7 * 86400000) : null,
        items: { create: orderItems },
      },
      include: { items: true },
    })
    orders.push(order)
  }
  console.log(`  ✅ ${orders.length} orders`)

  // Create Reviews
  for (let i = 0; i < 20; i++) {
    const product = products[Math.floor(Math.random() * products.length)]
    const buyer = buyers[Math.floor(Math.random() * buyers.length)]
    const deliveredOrder = orders.find((o) => o.status === "DELIVERED" && o.buyerId === buyer.id)

    await db.review.create({
      data: {
        productId: product.id,
        reviewerId: buyer.id,
        orderId: deliveredOrder?.id,
        rating: Math.floor(Math.random() * 2) + 4,
        title: ["Great product!", "Exactly as described", "Fast shipping, excellent quality", "Love it!", "Very satisfied with purchase"][Math.floor(Math.random() * 5)],
        comment: ["Really happy with this purchase. Would buy again from this seller.", "Product matches the description perfectly. Arrived well-packaged.", "Great value for money. Canadian seller, fast shipping.", "Quality is top-notch. Highly recommend this seller.", "Smooth transaction from start to finish."][Math.floor(Math.random() * 5)],
      },
    })
  }
  console.log(`  ✅ Reviews created`)

  // Create Disputes
  const disputedOrders = orders.filter((o) => o.status === "DISPUTED")
  for (const order of disputedOrders) {
    const sellerItem = order.items[0]
    const product = await db.product.findUnique({ where: { id: sellerItem.productId }, include: { store: true } })
    if (product && product.store) {
      await db.dispute.create({
        data: {
          orderId: order.id,
          buyerId: order.buyerId,
          sellerId: product.store.sellerId,
          reason: ["Item not as described", "Item never arrived", "Damaged on arrival", "Wrong item sent"][Math.floor(Math.random() * 4)],
          description: "The product received does not match the listing description. Requesting resolution.",
          status: ["OPEN", "UNDER_REVIEW", "RESOLVED"][Math.floor(Math.random() * 3)],
        },
      })
    }
  }
  console.log(`  ✅ Disputes created`)

  // Create Payouts
  for (const seller of sellers) {
    const sellerOrders = await db.order.findMany({
      where: {
        items: { some: { product: { storeId: seller.store!.id } } },
        status: { in: ["DELIVERED", "SHIPPED"] },
      },
      include: { items: true },
    })
    for (const order of sellerOrders) {
      const sellerItems = order.items.filter((item: any) => {
        return true
      })
      if (sellerItems.length > 0) {
        await db.payout.create({
          data: {
            sellerId: seller.id,
            amount: order.subtotal * 0.92,
            fee: order.subtotal * 0.08,
            net: order.subtotal * 0.92,
            status: ["COMPLETED", "PENDING", "PROCESSING"][Math.floor(Math.random() * 3)],
            processedAt: Math.random() > 0.3 ? new Date() : null,
          },
        })
      }
    }
  }
  console.log(`  ✅ Payouts created`)

  // Create Site Settings
  const settings = [
    { key: "site_name", value: "Canada Marketplace" },
    { key: "site_description", value: "Canada's trusted marketplace. Buy and sell safely." },
    { key: "marketplace_fee", value: "0.08" },
    { key: "gold_seller_fee", value: "0.05" },
    { key: "dispute_window_days", value: "14" },
    { key: "payout_speed_days", value: "2" },
    { key: "max_listing_images", value: "10" },
    { key: "currency", value: "CAD" },
  ]
  await Promise.all(settings.map((s) => db.siteSetting.create({ data: s })))
  console.log(`  ✅ Site settings created`)

  // Create Sample Conversations & Messages
  const sampleConversations = [
    { buyer: buyers[0], seller: sellers[0], messages: [
      { sender: buyers[0], text: "Hi! Is the Classic Logo Tee in black still available in size L?", delay: 0 },
      { sender: sellers[0], text: "Yes! We have it in stock. Size L is available.", delay: 1 },
      { sender: buyers[0], text: "Awesome! Do you have any bundle deals if I buy 2 tees?", delay: 2 },
      { sender: sellers[0], text: "Sure! Use code TUNOG10 for 10% off on orders of 2 or more items.", delay: 3 },
    ]},
    { buyer: buyers[1], seller: sellers[2], messages: [
      { sender: buyers[1], text: "Bonjour! Le Snapback rouge est-il disponible?", delay: 0 },
      { sender: sellers[2], text: "Oui! Le Classic Snapback en rouge est en stock. Livraison gratuite au Québec!", delay: 1 },
      { sender: buyers[1], text: "Parfait! Je vais en prendre un avec le mug Soundwave.", delay: 2 },
    ]},
    { buyer: buyers[2], seller: sellers[1], messages: [
      { sender: buyers[2], text: "Hey! Do you ship the Travel Tumbler to Calgary?", delay: 0 },
      { sender: sellers[1], text: "Yes! We ship nationwide. Free shipping on orders over $50.", delay: 1 },
    ]},
  ]

  for (const conv of sampleConversations) {
    const conversation = await db.conversation.create({
      data: {
        participant1Id: conv.buyer.id,
        participant2Id: conv.seller.id,
        lastMessage: conv.messages[conv.messages.length - 1].text,
        lastMessageAt: new Date(Date.now() - (conv.messages.length - 1) * 3600000),
      },
    })
    for (const msg of conv.messages) {
      await db.message.create({
        data: {
          conversationId: conversation.id,
          senderId: msg.sender.id,
          content: msg.text,
          isRead: msg.sender.id === conv.seller.id,
          createdAt: new Date(Date.now() - msg.delay * 3600000),
        },
      })
    }
  }
  console.log(`  ✅ ${sampleConversations.length} conversations with messages`)

  // Create Sample Notifications
  const notificationTemplates = [
    { user: buyers[0], type: "ORDER", title: "Order Shipped", message: "Your Tunog Kalye order has been shipped! Track your package.", link: "orders" },
    { user: buyers[0], type: "MESSAGE", title: "New Message", message: "tunogkalye.net sent you a message about Classic Logo Tee.", link: "messages" },
    { user: buyers[1], type: "ORDER", title: "Order Delivered", message: "Your Tunog Kalye order has been delivered! Leave a review.", link: "orders" },
    { user: sellers[0], type: "ORDER", title: "New Order", message: "You received a new order for Tunog Kalye merchandise!", link: "my-orders" },
    { user: sellers[0], type: "REVIEW", title: "New Review", message: "Someone left a 5-star review on your Classic Logo Tee!", link: "my-products" },
    { user: sellers[1], type: "MESSAGE", title: "New Message", message: "A buyer asked about shipping to Calgary.", link: "messages" },
    { user: sellers[2], type: "PAYOUT", title: "Payout Processed", message: "Your Tunog Kalye payout of $284.50 has been processed.", link: "my-payouts" },
    { user: admin, type: "DISPUTE", title: "New Dispute Filed", message: "A buyer filed a dispute. Review required.", link: "admin-disputes" },
  ]

  for (let i = 0; i < notificationTemplates.length; i++) {
    const n = notificationTemplates[i]
    await db.notification.create({
      data: {
        userId: n.user.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        isRead: i > 4,
        createdAt: new Date(Date.now() - i * 7200000),
      },
    })
  }
  console.log(`  ✅ ${notificationTemplates.length} notifications`)

  // Create Sample Coupons
  const couponData = [
    { code: "TUNOG10", type: "PERCENTAGE", value: 10, minOrderAmount: 25, maxUses: 100, sellerId: null, startsAt: new Date("2024-01-01"), expiresAt: null },
    { code: "STREET20", type: "FIXED", value: 20, minOrderAmount: 75, maxUses: 50, sellerId: null, startsAt: new Date("2024-01-01"), expiresAt: null },
    { code: "KALYE15", type: "PERCENTAGE", value: 15, minOrderAmount: 50, maxUses: 30, sellerId: sellers[0].id, startsAt: new Date("2024-01-01"), expiresAt: null },
    { code: "BUNDLE", type: "FIXED", value: 10, minOrderAmount: 60, maxUses: null, sellerId: null, startsAt: new Date("2024-01-01"), expiresAt: null },
    { code: "SUMMER25", type: "PERCENTAGE", value: 25, minOrderAmount: 0, maxUses: 200, sellerId: null, startsAt: new Date("2024-06-01"), expiresAt: new Date("2025-09-30") },
    { code: "WESTCOAST", type: "PERCENTAGE", value: 10, minOrderAmount: 30, maxUses: null, sellerId: sellers[1].id, startsAt: new Date("2024-01-01"), expiresAt: null },
  ]

  const coupons = []
  for (const c of couponData) {
    const coupon = await db.coupon.create({
      data: {
        code: c.code,
        type: c.type,
        value: c.value,
        minOrderAmount: c.minOrderAmount,
        maxUses: c.maxUses,
        usedCount: Math.floor(Math.random() * Math.min(c.maxUses || 50, 15)),
        startsAt: c.startsAt,
        expiresAt: c.expiresAt,
        isActive: true,
        sellerId: c.sellerId,
      },
    })
    coupons.push(coupon)
  }
  console.log(`  ✅ ${coupons.length} coupons`)

  console.log("\n🍁 Canada Marketplace seeded successfully!")
  console.log("\n📋 Test Accounts:")
  console.log("  Admin:   admin@canadamarketplace.ca / Admin123!")
  console.log("  Sellers: sarah@techshop.ca / Seller123!")
  console.log("           jp@montrealfashion.ca / Seller123!")
  console.log("  Buyers:  alex@gmail.com / Buyer123!")
  console.log("           marie@hotmail.com / Buyer123!")
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
