import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

let seedRunning = false

export async function ensureDatabaseSeeded(): Promise<{ seeded: boolean; message: string }> {
  // Prevent concurrent seed runs
  if (seedRunning) {
    return { seeded: false, message: "Seed already in progress" }
  }

  try {
    // Check if database already has data
    const categoryCount = await db.category.count()
    if (categoryCount > 0) {
      return { seeded: false, message: `Database already has ${categoryCount} categories` }
    }

    seedRunning = true
    console.log("🌱 Auto-seeding database (first request on this instance)...")

    // Create Categories
    const categories = await Promise.all([
      db.category.create({ data: { name: "Electronics", slug: "electronics", icon: "laptop", productCount: 124 } }),
      db.category.create({ data: { name: "Fashion", slug: "fashion", icon: "tshirt-crew", productCount: 283 } }),
      db.category.create({ data: { name: "Home & Garden", slug: "home-garden", icon: "sofa", productCount: 198 } }),
      db.category.create({ data: { name: "Sports", slug: "sports", icon: "hockey-puck", productCount: 82 } }),
      db.category.create({ data: { name: "Vehicles", slug: "vehicles", icon: "car", productCount: 56 } }),
      db.category.create({ data: { name: "Books", slug: "books", icon: "book-open-variant", productCount: 151 } }),
      db.category.create({ data: { name: "Music", slug: "music", icon: "music-note", productCount: 47 } }),
      db.category.create({ data: { name: "Outdoor", slug: "outdoor", icon: "pine-tree", productCount: 73 } }),
    ])

    // Create Provinces
    await Promise.all([
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

    // Create Admin
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

    // Create Sellers with Stores
    const sellerData = [
      { name: "Sarah Mitchell", email: "sarah@techshop.ca", store: "TechHub Canada", storeSlug: "techhub-canada", province: "BC", city: "Vancouver", desc: "Your trusted source for quality electronics across Canada. All prices in CAD, all data stays in Canada." },
      { name: "Jean-Pierre Beaumont", email: "jp@montrealfashion.ca", store: "Style Québec", storeSlug: "style-quebec", province: "QC", city: "Montréal", desc: "Montréal-based fashion retailer featuring premium Canadian and international brands." },
      { name: "Mike Thompson", email: "mike@homegear.ca", store: "Maple Home Living", storeSlug: "maple-home-living", province: "ON", city: "Toronto", desc: "Quality home furnishings and appliances. Proudly Canadian, serving customers nationwide." },
      { name: "Emily Chen", email: "emily@sportsplus.ca", store: "Great White North Sports", storeSlug: "great-white-north-sports", province: "AB", city: "Calgary", desc: "Canada's premier sports equipment retailer. Hockey, cycling, camping and more." },
      { name: "David Williams", email: "david@canread.ca", store: "CanRead Books", storeSlug: "canread-books", province: "NS", city: "Halifax", desc: "Atlantic Canada's favourite bookstore. Canadian authors, international bestsellers, and rare finds." },
      { name: "Ana Rodrigues", email: "ana@outdoorbc.ca", store: "BC Outdoor Co", storeSlug: "bc-outdoor-co", province: "BC", city: "Victoria", desc: "Pacific Northwest outdoor gear specialists. Tested in BC's rugged wilderness." },
      { name: "James Wilson", email: "james@autocanada.ca", store: "Auto Canada Direct", storeSlug: "auto-canada-direct", province: "ON", city: "Mississauga", desc: "Quality pre-owned vehicles with full mechanical inspection. Canadian winters approved." },
      { name: "Lisa Park", email: "lisa@melodymart.ca", store: "Melody Mart", storeSlug: "melody-mart", province: "ON", city: "Ottawa", desc: "Musical instruments and audio equipment for every level. Ottawa's music store since 2018." },
    ]

    const sellerPassword = await bcrypt.hash("Seller123!", 12)
    const sellers: Array<{ id: string; store: { id: string }; province?: string | null; city?: string | null }> = []
    for (const s of sellerData) {
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
              slug: s.storeSlug,
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

    // Create Buyers
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

    // Create Products
    const productTemplates = [
      { title: 'MacBook Pro 14" M3', cat: "electronics", seller: 0, price: 2199, condition: "LIKE_NEW", desc: "Late 2023 model. 16GB RAM, 512GB SSD. Barely used, includes original box and charger. Battery cycles: 23." },
      { title: "Sony WH-1000XM5 Headphones", cat: "electronics", seller: 0, price: 349, condition: "NEW", desc: "Brand new, sealed in box. Industry-leading noise cancellation with exceptional sound quality. 30-hour battery life." },
      { title: "iPad Air M2 256GB", cat: "electronics", seller: 0, price: 749, condition: "NEW", desc: "Latest generation iPad Air with M2 chip. 256GB storage, WiFi + Cellular. Space Gray." },
      { title: "Samsung Galaxy S24 Ultra", cat: "electronics", seller: 0, price: 1299, condition: "LIKE_NEW", desc: "256GB, Titanium Black. Comes with original box, case, and screen protector already applied." },
      { title: "Nintendo Switch OLED", cat: "electronics", seller: 0, price: 379, condition: "GOOD", desc: "White Joy-Con model. Includes dock, charger, and 3 games (Zelda, Mario Kart, Smash Bros)." },
      { title: 'Dell UltraSharp 27" 4K Monitor', cat: "electronics", seller: 0, price: 599, condition: "NEW", desc: "USB-C hub, HDR support. Perfect for professionals. Canadian warranty." },
      { title: "Canada Goose Expedition Parka", cat: "fashion", seller: 1, price: 1695, condition: "NEW", desc: "Authentic Canada Goose, Arctic Tech fabric. Size M, colour: Spirit. Full Canadian warranty." },
      { title: "Lululemon Define Jacket", cat: "fashion", seller: 1, price: 148, condition: "LIKE_NEW", desc: "Black, Size 6. Worn twice. 4-way stretch Luon fabric with built-in bra." },
      { title: "Arc'teryx Beta AR Jacket", cat: "fashion", seller: 1, price: 599, condition: "NEW", desc: "Gore-Tex Pro, all-season mountain jacket. Size L, colour: Blackbird. Canadian made." },
      { title: "Roots Leather Heritage Bag", cat: "fashion", seller: 1, price: 298, condition: "GOOD", desc: "Authentic Roots leather bag, vintage style. Some patina adds character." },
      { title: "Moose Knuckles Parka", cat: "fashion", seller: 1, price: 895, condition: "LIKE_NEW", desc: "Stirling Parka, Size M. Premium Canadian down. Only worn a few times." },
      { title: "Dyson V15 Detect Vacuum", cat: "home-garden", seller: 2, price: 799, condition: "NEW", desc: "Laser reveals microscopic dust. LCD screen shows real-time counts. 2-year Canadian warranty." },
      { title: "KitchenAid Stand Mixer 5qt", cat: "home-garden", seller: 2, price: 479, condition: "LIKE_NEW", desc: "Empire Red, Artisan series. Includes 3 attachments. Only used a handful of times." },
      { title: "Herman Miller Aeron Chair", cat: "home-garden", seller: 2, price: 1195, condition: "GOOD", desc: "Size B, fully loaded. Graphite colour. Some wear on armrests. 10-year warranty remaining." },
      { title: "Cast Iron Dutch Oven 6qt", cat: "home-garden", seller: 2, price: 89, condition: "NEW", desc: "Pre-seasoned, perfect for Canadian winters. Soups, stews, bread." },
      { title: "Bauer Supreme 3S Hockey Stick", cat: "sports", seller: 3, price: 219, condition: "NEW", desc: "Senior, 85 flex, P92 curve. Mid-kick point for powerful shots." },
      { title: "Mizuno Wave Rider 27 Running Shoes", cat: "sports", seller: 3, price: 164, condition: "NEW", desc: "Men's size 10, colour: Black/White. Neutral running shoe with excellent cushioning." },
      { title: "Trek Marlin 7 Mountain Bike", cat: "sports", seller: 3, price: 899, condition: "LIKE_NEW", desc: "2024 model, Size L. RockShox suspension, hydraulic disc brakes. Less than 100km ridden." },
      { title: "Weber Genesis BBQ Grill", cat: "sports", seller: 3, price: 1249, condition: "GOOD", desc: "3-burner propane grill with side burner. Perfect for Canadian summers. Some surface rust." },
      { title: "Margaret Atwood Collection (5 Books)", cat: "books", seller: 4, price: 45, condition: "GOOD", desc: "Includes Handmaid's Tale, Oryx and Crake, MaddAddam, The Testaments, Alias Grace. Paperbacks." },
      { title: "Robert Munsch Storybook Bundle", cat: "books", seller: 4, price: 28, condition: "LIKE_NEW", desc: "10 classic Canadian children's stories. Love You Forever, The Paper Bag Princess, and more." },
      { title: "MSR Hubba Hubba 2P Tent", cat: "outdoor", seller: 5, price: 449, condition: "LIKE_NEW", desc: "Ultralight 2-person tent. 3-season. Used on 2 trips. Includes footprint." },
      { title: "Osprey Atmos 65L Backpack", cat: "outdoor", seller: 5, price: 279, condition: "GOOD", desc: "Men's, colour: Pine Green. Anti-gravity suspension. Perfect for multi-day hikes." },
      { title: 'Big Agnes Sleeping Bag -15°C', cat: "outdoor", seller: 5, price: 389, condition: "NEW", desc: "Rated for Canadian winters. Synthetic insulation, stays warm when damp." },
      { title: "2022 Toyota RAV4 Hybrid XLE", cat: "vehicles", seller: 6, price: 32999, condition: "LIKE_NEW", desc: "48,000 km. One owner. Winter tires included. All maintenance at Toyota dealer." },
      { title: "2023 Hyundai Kona Electric", cat: "vehicles", seller: 6, price: 35999, condition: "NEW", desc: "Zero km. Ultimate trim, 415km range. Home charger included." },
      { title: "Yamaha FG800 Acoustic Guitar", cat: "music", seller: 7, price: 299, condition: "NEW", desc: "Solid spruce top. Perfect beginner to intermediate guitar. Includes gig bag." },
      { title: "Roland FP-30X Digital Piano", cat: "music", seller: 7, price: 749, condition: "LIKE_NEW", desc: "88 weighted keys, Bluetooth MIDI. Includes sustain pedal and headphones." },
      { title: "Fender Player Stratocaster", cat: "music", seller: 7, price: 899, condition: "GOOD", desc: "Made in Mexico, Polar White. Some cosmetic wear. Plays and sounds incredible." },
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
          comparePrice: p.condition === "NEW" ? Math.round(p.price * 1.15) : undefined,
          condition: p.condition,
          categoryId: categories[catIndex].id,
          storeId: seller.store!.id,
          province: seller.province,
          city: seller.city,
          images: JSON.stringify([
            `https://picsum.photos/seed/${p.title.replace(/\s/g, "").toLowerCase()}/600/600`,
            `https://picsum.photos/seed/${p.title.replace(/\s/g, "").toLowerCase()}2/600/600`,
          ]),
          stock: p.condition === "NEW" ? 10 : Math.floor(Math.random() * 5) + 1,
          sold: Math.floor(Math.random() * 20),
          status: "ACTIVE",
          isFeatured: Math.random() > 0.5,
          views: Math.floor(Math.random() * 500),
        },
      })
      products.push(product)
    }

    // Create Product Variants
    const variantData: Record<number, Array<{ name: string; value: string; priceDelta: number; stock: number }>> = {
      0: [{ name: 'Storage', value: '256GB', priceDelta: 0, stock: 5 }, { name: 'Storage', value: '512GB', priceDelta: 200, stock: 3 }, { name: 'Storage', value: '1TB', priceDelta: 500, stock: 2 }],
      1: [{ name: 'Color', value: 'Black', priceDelta: 0, stock: 8 }, { name: 'Color', value: 'Silver', priceDelta: 0, stock: 4 }, { name: 'Color', value: 'Blue', priceDelta: 10, stock: 3 }],
      2: [{ name: 'Storage', value: '128GB', priceDelta: -100, stock: 6 }, { name: 'Storage', value: '256GB', priceDelta: 0, stock: 5 }, { name: 'Storage', value: '512GB', priceDelta: 200, stock: 3 }],
      3: [{ name: 'Storage', value: '256GB', priceDelta: 0, stock: 4 }, { name: 'Storage', value: '512GB', priceDelta: 150, stock: 3 }, { name: 'Storage', value: '1TB', priceDelta: 350, stock: 2 }],
      6: [{ name: 'Size', value: 'S', priceDelta: 0, stock: 3 }, { name: 'Size', value: 'M', priceDelta: 0, stock: 5 }, { name: 'Size', value: 'L', priceDelta: 0, stock: 4 }, { name: 'Size', value: 'XL', priceDelta: 20, stock: 2 }],
      7: [{ name: 'Size', value: '4', priceDelta: 0, stock: 4 }, { name: 'Size', value: '6', priceDelta: 0, stock: 5 }, { name: 'Size', value: '8', priceDelta: 0, stock: 3 }, { name: 'Size', value: '10', priceDelta: 0, stock: 2 }, { name: 'Size', value: '12', priceDelta: 0, stock: 1 }],
      14: [{ name: 'Flex', value: '75', priceDelta: 0, stock: 5 }, { name: 'Flex', value: '85', priceDelta: 0, stock: 5 }, { name: 'Flex', value: '100', priceDelta: 10, stock: 3 }],
      15: [{ name: 'Size', value: '9', priceDelta: 0, stock: 3 }, { name: 'Size', value: '10', priceDelta: 0, stock: 5 }, { name: 'Size', value: '11', priceDelta: 0, stock: 4 }, { name: 'Size', value: '12', priceDelta: 0, stock: 2 }],
      16: [{ name: 'Size', value: 'M', priceDelta: 0, stock: 2 }, { name: 'Size', value: 'L', priceDelta: 0, stock: 3 }, { name: 'Size', value: 'XL', priceDelta: 50, stock: 1 }],
      23: [{ name: 'Color', value: 'Natural', priceDelta: 0, stock: 4 }, { name: 'Color', value: 'Black', priceDelta: 10, stock: 3 }, { name: 'Color', value: 'Sunburst', priceDelta: 20, stock: 2 }],
      25: [{ name: 'Color', value: 'Polar White', priceDelta: 0, stock: 2 }, { name: 'Color', value: 'Olympic White', priceDelta: 0, stock: 1 }, { name: 'Color', value: '3-Color Sunburst', priceDelta: 30, stock: 1 }],
    }

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
      }
    }

    // Create Orders
    const orderStatuses = ["PAID", "SHIPPED", "DELIVERED", "PENDING", "CANCELLED", "DISPUTED"]
    const orders = []
    for (let i = 0; i < 15; i++) {
      const buyer = buyers[Math.floor(Math.random() * buyers.length)]
      const numItems = Math.floor(Math.random() * 3) + 1
      const orderItems: Array<{ productId: string; title: string; price: number; quantity: number; image?: string }> = []
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
          shippingCity: buyer.city || "Toronto",
          shippingProvince: buyer.province || "ON",
          shippingPostalCode: "A1A 1A1",
          paymentStatus: ["PAID", "SHIPPED", "DELIVERED", "DISPUTED"].includes(status) ? "PAID" : "PENDING",
          paidAt: ["PAID", "SHIPPED", "DELIVERED", "DISPUTED"].includes(status) ? new Date(Date.now() - Math.random() * 30 * 86400000) : null,
          shippedAt: ["SHIPPED", "DELIVERED"].includes(status) ? new Date(Date.now() - Math.random() * 14 * 86400000) : null,
          deliveredAt: status === "DELIVERED" ? new Date(Date.now() - Math.random() * 7 * 86400000) : null,
          items: { create: orderItems },
        },
        include: { items: true },
      })
      orders.push(order)
    }

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

    // Create Conversations & Messages
    const sampleConversations = [
      { buyer: buyers[0], seller: sellers[0], messages: [
        { sender: buyers[0], text: "Hi! Is the MacBook Pro still available?", delay: 0 },
        { sender: sellers[0], text: "Yes, it's available! Battery health is 98%.", delay: 1 },
        { sender: buyers[0], text: "Great! Can you do $2000 for it?", delay: 2 },
        { sender: sellers[0], text: "I can do $2100 since it's practically new.", delay: 3 },
      ]},
      { buyer: buyers[1], seller: sellers[1], messages: [
        { sender: buyers[1], text: "Bonjour! J'aimerais savoir si la parka Canada Goose est disponible en taille M?", delay: 0 },
        { sender: sellers[1], text: "Oui! Nous avons la taille M en stock. Couleur Spirit.", delay: 1 },
        { sender: buyers[1], text: "Parfait! Est-ce que vous offrez la livraison gratuite au Québec?", delay: 2 },
      ]},
      { buyer: buyers[2], seller: sellers[3], messages: [
        { sender: buyers[2], text: "Is the Trek Marlin 7 still available?", delay: 0 },
        { sender: sellers[3], text: "Yes! Less than 100km on it. Like new condition.", delay: 1 },
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

    // Create Notifications
    const notificationTemplates = [
      { userId: buyers[0].id, type: "ORDER", title: "Order Shipped", message: "Your order CM-X2K9 has been shipped! Track your package.", link: "orders" },
      { userId: buyers[0].id, type: "MESSAGE", title: "New Message", message: "Sarah Mitchell sent you a message about MacBook Pro.", link: "messages" },
      { userId: buyers[1].id, type: "ORDER", title: "Order Delivered", message: "Your order has been delivered! Leave a review to help other buyers.", link: "orders" },
      { userId: sellers[0].id, type: "ORDER", title: "New Order", message: "You received a new order! Ship within 2 business days.", link: "my-orders" },
      { userId: sellers[0].id, type: "REVIEW", title: "New Review", message: "Someone left a 5-star review on your MacBook Pro listing!", link: "my-products" },
      { userId: sellers[1].id, type: "MESSAGE", title: "New Message", message: "Marie Tremblay sent you a message about Canada Goose Parka.", link: "messages" },
      { userId: sellers[2].id, type: "PAYOUT", title: "Payout Processed", message: "Your payout of $384.50 has been processed to your bank account.", link: "my-payouts" },
      { userId: admin.id, type: "DISPUTE", title: "New Dispute Filed", message: "A buyer has filed a dispute on order CM-XXXX. Review required.", link: "admin-disputes" },
    ]
    for (let i = 0; i < notificationTemplates.length; i++) {
      await db.notification.create({
        data: {
          ...notificationTemplates[i],
          isRead: i > 4,
          createdAt: new Date(Date.now() - i * 7200000),
        },
      })
    }

    // Create Coupons
    const couponData = [
      { code: "WELCOME10", type: "PERCENTAGE", value: 10, minOrderAmount: 25, maxUses: 100, sellerId: null, startsAt: new Date("2024-01-01"), expiresAt: null },
      { code: "SAVE20", type: "FIXED", value: 20, minOrderAmount: 100, maxUses: 50, sellerId: null, startsAt: new Date("2024-01-01"), expiresAt: null },
      { code: "SELLER15", type: "PERCENTAGE", value: 15, minOrderAmount: 50, maxUses: 30, sellerId: sellers[0].id, startsAt: new Date("2024-01-01"), expiresAt: null },
      { code: "FREESHIP", type: "FIXED", value: 15, minOrderAmount: 75, maxUses: null, sellerId: null, startsAt: new Date("2024-01-01"), expiresAt: null },
      { code: "SUMMER25", type: "PERCENTAGE", value: 25, minOrderAmount: 0, maxUses: 200, sellerId: null, startsAt: new Date("2024-06-01"), expiresAt: new Date("2025-09-30") },
      { code: "LOYAL10", type: "PERCENTAGE", value: 10, minOrderAmount: 30, maxUses: null, sellerId: sellers[1].id, startsAt: new Date("2024-01-01"), expiresAt: null },
    ]
    for (const c of couponData) {
      await db.coupon.create({
        data: {
          ...c,
          usedCount: Math.floor(Math.random() * Math.min(c.maxUses || 50, 15)),
          isActive: true,
        },
      })
    }

    console.log("✅ Canada Marketplace auto-seed complete!")
    return { seeded: true, message: "Database seeded successfully with demo data" }
  } catch (error) {
    console.error("❌ Auto-seed failed:", error)
    return { seeded: false, message: `Seed failed: ${error instanceof Error ? error.message : String(error)}` }
  } finally {
    seedRunning = false
  }
}
