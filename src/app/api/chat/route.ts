import { NextRequest, NextResponse } from "next/server"

const SYSTEM_PROMPT = `You are Maple, the friendly AI shopping assistant for Canada Marketplace (canadamarketplace.ca). You guide customers through their entire shopping journey in a warm, helpful, and distinctly Canadian way.`

export async function POST(req: NextRequest) {
  try {
    const { messages, cartItems, currentPage, user, locale } = await req.json()
    const lastMsg = messages?.[messages.length - 1]?.content?.toLowerCase() || ""
    const isFrench = locale === 'fr'

    // Build context for smarter responses
    let contextStr = ""
    if (user) {
      contextStr += `\nCurrent user: ${user.name} (${user.role})`
    } else {
      contextStr += `\nCurrent user: Not logged in (guest)`
    }
    if (cartItems && cartItems.length > 0) {
      const cartTotal = cartItems.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0)
      contextStr += `\nCart has ${cartItems.length} item(s), total: $${cartTotal.toFixed(2)} CAD`
      contextStr += `\nCart items: ${cartItems.map((i: any) => `${i.title} ($${i.price} x${i.quantity})`).join(", ")}`
    } else {
      contextStr += `\nCart is empty`
    }
    contextStr += `\nCurrent page: ${currentPage}`
    contextStr += `\nLanguage: ${isFrench ? 'French (Quebec)' : 'English'}`

    const response = generateResponse(lastMsg, contextStr, isFrench)
    return NextResponse.json(response)
  } catch (error: any) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { message: "Sorry, I'm having trouble right now. Please try again in a moment! 🍁", actions: [] },
      { status: 500 }
    )
  }
}

function generateResponse(lastMsg: string, context: string, isFrench: boolean) {
  // French responses
  if (isFrench) {
    return generateFrenchResponse(lastMsg, context)
  }

  // English responses (default)
  if (lastMsg.includes("laptop") || lastMsg.includes("computer") || lastMsg.includes("pc")) {
    return {
      message: "Great choice! We've got some awesome electronics from verified Canadian sellers. Let me show you our full electronics collection — you'll find laptops, desktops, and accessories at competitive prices. All purchases are protected by our escrow system! 💻",
      actions: [{ label: "Browse Electronics", action: "browse", params: { category: "electronics" } }],
    }
  }

  if (lastMsg.includes("phone") || lastMsg.includes("iphone") || lastMsg.includes("samsung") || lastMsg.includes("android")) {
    return {
      message: "Looking for a new phone? We have a great selection from verified Canadian sellers! Check out our electronics section for the latest smartphones, cases, and accessories. All in Canadian dollars with free returns within 14 days! 📱",
      actions: [{ label: "Browse Electronics", action: "browse", params: { category: "electronics" } }],
    }
  }

  if (lastMsg.includes("clothes") || lastMsg.includes("fashion") || lastMsg.includes("shirt") || lastMsg.includes("dress") || lastMsg.includes("shoes")) {
    return {
      message: "You'll love our fashion section! We've got clothing, shoes, and accessories from Canadian brands and sellers. From everyday wear to premium fashion — all in CAD with buyer protection! 👗",
      actions: [{ label: "Browse Fashion", action: "browse", params: { category: "fashion" } }],
    }
  }

  if (lastMsg.includes("home") || lastMsg.includes("garden") || lastMsg.includes("furniture") || lastMsg.includes("kitchen") || lastMsg.includes("decor")) {
    return {
      message: "Make your home shine! Our Home & Garden section has everything from furniture to kitchen essentials, garden tools, and decor. All from verified Canadian sellers! 🏠",
      actions: [{ label: "Browse Home & Garden", action: "browse", params: { category: "home-garden" } }],
    }
  }

  if (lastMsg.includes("sport") || lastMsg.includes("hockey") || lastMsg.includes("exercise") || lastMsg.includes("gym") || lastMsg.includes("fitness")) {
    return {
      message: "Hockey gear, workout equipment, outdoor adventure gear — we've got it all! Check out our sports section for everything an active Canadian needs. Go Jets go! 🏒",
      actions: [{ label: "Browse Sports", action: "browse", params: { category: "sports" } }],
    }
  }

  // Browse and shop
  if (lastMsg.includes("browse") || lastMsg.includes("shop") || lastMsg.includes("product") || lastMsg.includes("catalog") || lastMsg.includes("look")) {
    return {
      message: "I'd love to help you browse our marketplace! We have thousands of products across Electronics, Fashion, Home & Garden, Sports, Vehicles, Books, Music, and Outdoor categories. Everything in Canadian dollars with buyer protection! 🍁",
      actions: [
        { label: "Browse All Products", action: "browse" },
        { label: "Browse Electronics", action: "browse", params: { category: "electronics" } },
        { label: "Browse Fashion", action: "browse", params: { category: "fashion" } },
      ],
    }
  }

  // Cart and checkout
  if (lastMsg.includes("cart") || lastMsg.includes("checkout") || lastMsg.includes("pay") || lastMsg.includes("buy now")) {
    return {
      message: "Head over to your cart to review your items and checkout when you're ready. Here's how it works:\n\n1. Review your cart items\n2. Enter your shipping info (address, city, province, postal code)\n3. Place your order — payment goes into escrow\n4. Seller ships your item\n5. Confirm delivery → seller gets paid\n\nAll payments are protected by our escrow system! 🛡️",
      actions: [{ label: "View My Cart", action: "cart" }],
    }
  }

  // Selling
  if (lastMsg.includes("sell") || lastMsg.includes("seller") || lastMsg.includes("start selling") || lastMsg.includes("open store")) {
    return {
      message: "Becoming a seller on Canada Marketplace is easy! Here's what you get:\n\n✅ Your own customizable storefront\n✅ Sales analytics and dashboard\n✅ Secure payout system (direct to your bank)\n✅ Marketplace fee: only 8% (5% for Gold sellers)\n✅ Access to millions of Canadian buyers\n\nAll sellers are verified to keep the marketplace safe. Sign up today!",
      actions: [
        { label: "Become a Seller", action: "become-seller" },
        { label: "Register Now", action: "register" },
      ],
    }
  }

  // Registration
  if (lastMsg.includes("register") || lastMsg.includes("sign up") || lastMsg.includes("create account") || lastMsg.includes("join")) {
    return {
      message: "Welcome! Joining Canada Marketplace is free and takes just a minute. You can sign up as a buyer to start shopping, or as a seller to start selling. All accounts come with escrow protection and PIPEDA-compliant data handling! 🍁",
      actions: [
        { label: "Register Now", action: "register" },
        { label: "Become a Seller", action: "become-seller" },
      ],
    }
  }

  // Safety and escrow
  if (lastMsg.includes("escrow") || lastMsg.includes("safe") || lastMsg.includes("protect") || lastMsg.includes("security") || lastMsg.includes("scam") || lastMsg.includes("trust")) {
    return {
      message: "Your safety is our #1 priority! Here's how we protect you:\n\n🔒 **Escrow Payments** — Your money is held securely until you confirm delivery\n✅ **Verified Sellers** — All sellers go through identity verification\n🛡️ **Dispute Resolution** — File a dispute within 14 days if anything goes wrong\n🇨🇦 **Data in Canada** — PIPEDA compliant, your data stays in Canada\n💳 **Secure Payments** — PCI DSS compliant payment processing\n\nYour money is ALWAYS safe with us!",
      actions: [
        { label: "Browse Products", action: "browse" },
        { label: "How It Works", action: "safety" },
      ],
    }
  }

  // Shipping
  if (lastMsg.includes("ship") || lastMsg.includes("delivery") || lastMsg.includes("track") || lastMsg.includes("canada post")) {
    return {
      message: "We work with Canada Post and other trusted carriers for shipping across all 13 provinces and territories. Here's what you need to know:\n\n📦 Most orders ship within 1-3 business days\n📍 Track your package in real-time from your orders page\n🔄 Free returns within 14 days of delivery\n❄️ Yes, we ship to the territories too!\n\nAll shipping costs are shown at checkout — no hidden fees!",
      actions: [{ label: "View My Orders", action: "orders" }],
    }
  }

  // Order tracking
  if (lastMsg.includes("order") || lastMsg.includes("status") || lastMsg.includes("where")) {
    return {
      message: "To check your order status, head to the Orders page where you can see real-time tracking for all your purchases. Each order shows its current status: Processing → Shipped → Delivered. You'll also get email notifications at each step! 📦",
      actions: [{ label: "View My Orders", action: "orders" }],
    }
  }

  // Disputes
  if (lastMsg.includes("dispute") || lastMsg.includes("refund") || lastMsg.includes("return") || lastMsg.includes("complaint") || lastMsg.includes("wrong") || lastMsg.includes("broken") || lastMsg.includes("damaged")) {
    return {
      message: "We're sorry to hear that! Here's how our dispute process works:\n\n1. Go to your order and click \"File Dispute\"\n2. Describe the issue and optionally upload photos\n3. Our admin team reviews within 48 hours\n4. If approved, you get a full refund from escrow\n\nYou have 14 days from delivery to file a dispute. We're here to make it right! 🤝",
      actions: [{ label: "View My Orders", action: "orders" }],
    }
  }

  // Fees
  if (lastMsg.includes("fee") || lastMsg.includes("cost") || lastMsg.includes("charge") || lastMsg.includes("commission")) {
    return {
      message: "Here's our transparent fee structure:\n\n🛒 **For Buyers**: No fees! The price you see is what you pay\n🏪 **For Sellers**: 8% marketplace fee (5% for Gold sellers)\n💳 **Payment Processing**: Standard Stripe fees apply\n💰 **Payouts**: Direct to your bank account, processed weekly\n\nNo hidden fees, ever!",
      actions: [{ label: "Become a Seller", action: "become-seller" }],
    }
  }

  // Greetings
  if (lastMsg.includes("hi") || lastMsg.includes("hello") || lastMsg.includes("hey") || lastMsg.includes("greetings") || lastMsg === "") {
    return {
      message: "Hey there! Welcome to Canada Marketplace! 🍁 I'm Maple, your AI shopping assistant. I'm here to help you find exactly what you're looking for, safely and securely.\n\nEverything on our platform is in Canadian dollars, your payments are protected by escrow, and all sellers are verified. Pretty sweet, eh?\n\nWhat are you shopping for today?",
      actions: [
        { label: "Browse All Products", action: "browse" },
        { label: "Register Now", action: "register" },
        { label: "How It Works", action: "safety" },
      ],
    }
  }

  // Thanks
  if (lastMsg.includes("thank") || lastMsg.includes("thanks") || lastMsg.includes("cheers")) {
    return {
      message: "You're welcome! That's what I'm here for, eh? If you need anything else, just ask. Happy shopping! 🍁",
      actions: [{ label: "Browse Products", action: "browse" }],
    }
  }

  // Default response
  return {
    message: "I'd love to help you with that! I can assist with:\n\n🛍️ Finding products across all categories\n🛒 Cart and checkout questions\n🏪 Becoming a seller\n🔒 Escrow and safety info\n📦 Shipping and tracking\n🤝 Disputes and returns\n\nWhat would you like to know more about?",
    actions: [
      { label: "Browse All Products", action: "browse" },
      { label: "How It Works", action: "safety" },
      { label: "Register Now", action: "register" },
    ],
  }
}

function generateFrenchResponse(lastMsg: string, context: string) {
  if (lastMsg.includes("ordinateur") || lastMsg.includes("portable") || lastMsg.includes("pc")) {
    return {
      message: "Excellent choix! Nous avons de superbes articles électroniques de vendeurs canadiens vérifiés. Laissez-moi vous montrer notre collection d'électronique — vous y trouverez des ordinateurs portables, des ordinateurs de bureau et des accessoires à des prix compétitifs. Tous les achats sont protégés par notre système de séquestre! 💻",
      actions: [{ label: "Explorer l'électronique", action: "browse", params: { category: "electronics" } }],
    }
  }

  if (lastMsg.includes("téléphone") || lastMsg.includes("iphone") || lastMsg.includes("samsung") || lastMsg.includes("android")) {
    return {
      message: "Vous cherchez un nouveau téléphone? Nous avons une belle sélection de vendeurs canadiens vérifiés! Consultez notre section électronique pour les derniers téléphones intelligents, coques et accessoires. Le tout en dollars canadiens avec retours gratuits dans les 14 jours! 📱",
      actions: [{ label: "Explorer l'électronique", action: "browse", params: { category: "electronics" } }],
    }
  }

  if (lastMsg.includes("vêtement") || lastMsg.includes("mode") || lastMsg.includes("chemise") || lastMsg.includes("robe") || lastMsg.includes("soulier") || lastMsg.includes("chaussure")) {
    return {
      message: "Vous allez adorer notre section mode! Nous avons des vêtements, chaussures et accessoires de marques et vendeurs canadiens. Du quotidien à la mode haut de gamme — le tout en CAD avec protection des acheteurs! 👗",
      actions: [{ label: "Explorer la mode", action: "browse", params: { category: "fashion" } }],
    }
  }

  if (lastMsg.includes("maison") || lastMsg.includes("jardin") || lastMsg.includes("meuble") || lastMsg.includes("cuisine") || lastMsg.includes("décor")) {
    return {
      message: "Faites briller votre maison! Notre section Maison et jardin a tout ce dont vous avez besoin, des meubles aux essentiels de cuisine, en passant par les outils de jardinage et la décoration. Le tout de vendeurs canadiens vérifiés! 🏠",
      actions: [{ label: "Explorer Maison et jardin", action: "browse", params: { category: "home-garden" } }],
    }
  }

  if (lastMsg.includes("sport") || lastMsg.includes("hockey") || lastMsg.includes("exercice") || lastMsg.includes("gym") || lastMsg.includes("conditionnement")) {
    return {
      message: "Équipement de hockey, matériel d'entraînement, équipement d'aventure en plein air — nous avons tout! Consultez notre section sports pour tout ce dont un Canadien actif a besoin. Go Jets go! 🏒",
      actions: [{ label: "Explorer les sports", action: "browse", params: { category: "sports" } }],
    }
  }

  // Browse/shop in French
  if (lastMsg.includes("explor") || lastMsg.includes("magasin") || lastMsg.includes("produit") || lastMsg.includes("cherch") || lastMsg.includes("regard")) {
    return {
      message: "Je serais ravi de vous aider à explorer notre place de marché! Nous avons des milliers de produits dans les catégories Électronique, Mode, Maison et jardin, Sports, Véhicules, Livres, Musique et Plein air. Le tout en dollars canadiens avec protection des acheteurs! 🍁",
      actions: [
        { label: "Explorer tous les produits", action: "browse" },
        { label: "Explorer l'électronique", action: "browse", params: { category: "electronics" } },
        { label: "Explorer la mode", action: "browse", params: { category: "fashion" } },
      ],
    }
  }

  // Cart/checkout in French
  if (lastMsg.includes("panier") || lastMsg.includes("commande") || lastMsg.includes("payer") || lastMsg.includes("achat")) {
    return {
      message: "Rendez-vous à votre panier pour examiner vos articles et passer la commande quand vous êtes prêt. Voici comment ça fonctionne:\n\n1. Examinez les articles de votre panier\n2. Entrez vos informations de livraison (adresse, ville, province, code postal)\n3. Passez votre commande — le paiement est conservé en séquestre\n4. Le vendeur expédie votre article\n5. Confirmez la réception → le vendeur est payé\n\nTous les paiements sont protégés par notre système de séquestre! 🛡️",
      actions: [{ label: "Voir mon panier", action: "cart" }],
    }
  }

  // Selling in French
  if (lastMsg.includes("vendre") || lastMsg.includes("vendeur") || lastMsg.includes("boutique") || lastMsg.includes("commenc") || lastMsg.includes("créer")) {
    return {
      message: "Devenir vendeur sur Canada Marketplace est facile! Voici ce que vous obtenez:\n\n✅ Votre propre boutique personnalisable\n✅ Analyses de ventes et tableau de bord\n✅ Système de versement sécurisé (direct à votre banque)\n✅ Frais de plateforme: seulement 8% (5% pour les vendeurs Gold)\n✅ Accès à des millions d'acheteurs canadiens\n\nTous les vendeurs sont vérifiés pour garder la plateforme sécurisée. Inscrivez-vous dès aujourd'hui!",
      actions: [
        { label: "Devenir vendeur", action: "become-seller" },
        { label: "S'inscrire", action: "register" },
      ],
    }
  }

  // Registration in French
  if (lastMsg.includes("inscr") || lastMsg.includes("compte") || lastMsg.includes("rejoindr") || lastMsg.includes("enregistr")) {
    return {
      message: "Bienvenue! Rejoindre Canada Marketplace est gratuit et ne prend qu'une minute. Vous pouvez vous inscrire comme acheteur pour commencer à magasiner, ou comme vendeur pour commencer à vendre. Tous les comptes incluent la protection par séquestre et la conformité à la LPRPDE! 🍁",
      actions: [
        { label: "S'inscrire", action: "register" },
        { label: "Devenir vendeur", action: "become-seller" },
      ],
    }
  }

  // Safety in French
  if (lastMsg.includes("sécur") || lastMsg.includes("séquestre") || lastMsg.includes("protég") || lastMsg.includes("escroq") || lastMsg.includes("confiance")) {
    return {
      message: "Votre sécurité est notre priorité numéro 1! Voici comment nous vous protégeons:\n\n🔒 **Paiements par séquestre** — Votre argent est conservé en toute sécurité jusqu'à ce que vous confirmiez la réception\n✅ **Vendeurs vérifiés** — Tous les vendeurs passent par une vérification d'identité\n🛡️ **Résolution des litiges** — Signalez un litige dans les 14 jours si quelque chose ne va pas\n🇨🇦 **Données au Canada** — Conforme à la LPRPDE, vos données restent au Canada\n💳 **Paiements sécurisés** — Traitement conforme PCI DSS\n\nVotre argent est TOUJOURS en sécurité avec nous!",
      actions: [
        { label: "Explorer les produits", action: "browse" },
        { label: "Comment ça marche", action: "safety" },
      ],
    }
  }

  // Shipping in French
  if (lastMsg.includes("livrais") || lastMsg.includes("expédi") || lastMsg.includes("suivi") || lastMsg.includes("postes canada")) {
    return {
      message: "Nous travaillons avec Postes Canada et d'autres transporteurs de confiance pour la livraison dans les 13 provinces et territoires. Voici ce que vous devez savoir:\n\n📦 La plupart des commandes sont expédiées sous 1-3 jours ouvrables\n📍 Suivez votre colis en temps réel depuis votre page de commandes\n🔄 Retours gratuits dans les 14 jours suivant la livraison\n❄️ Oui, nous livrons aussi dans les territoires!\n\nTous les frais de livraison sont affichés à la commande — pas de frais cachés!",
      actions: [{ label: "Voir mes commandes", action: "orders" }],
    }
  }

  // Orders in French
  if (lastMsg.includes("commande") || lastMsg.includes("statut") || lastMsg.includes("où")) {
    return {
      message: "Pour vérifier le statut de votre commande, rendez-vous à la page Commandes où vous pouvez voir le suivi en temps réel de tous vos achats. Chaque commande affiche son statut actuel: En traitement → Expédiée → Livrée. Vous recevrez aussi des notifications par courriel à chaque étape! 📦",
      actions: [{ label: "Voir mes commandes", action: "orders" }],
    }
  }

  // Disputes in French
  if (lastMsg.includes("litige") || lastMsg.includes("rembours") || lastMsg.includes("retour") || lastMsg.includes("plainte") || lastMsg.includes("cassé") || lastMsg.includes("endommagé") || lastMsg.includes("mauvais")) {
    return {
      message: "Nous sommes désolés d'apprendre cela! Voici comment fonctionne notre processus de litige:\n\n1. Allez à votre commande et cliquez « Signaler un litige »\n2. Décrivez le problème et téléversez des photos au besoin\n3. Notre équipe admin examine sous 48 heures\n4. Si approuvé, vous recevez un remboursement intégral du séquestre\n\nVous avez 14 jours après la livraison pour signaler un litige. Nous sommes là pour arranger les choses! 🤝",
      actions: [{ label: "Voir mes commandes", action: "orders" }],
    }
  }

  // Fees in French
  if (lastMsg.includes("frais") || lastMsg.includes("coût") || lastMsg.includes("commission") || lastMsg.includes("prix")) {
    return {
      message: "Voici notre structure de frais transparente:\n\n🛒 **Pour les acheteurs**: Aucuns frais! Le prix affiché est le prix payé\n🏪 **Pour les vendeurs**: Frais de plateforme de 8% (5% pour les vendeurs Gold)\n💳 **Traitement des paiements**: Frais Stripe standard applicables\n💰 **Versements**: Direct à votre compte bancaire, traité chaque semaine\n\nAucuns frais cachés, jamais!",
      actions: [{ label: "Devenir vendeur", action: "become-seller" }],
    }
  }

  // Greetings in French
  if (lastMsg.includes("bonjour") || lastMsg.includes("salut") || lastMsg.includes("hello") || lastMsg.includes("hi") || lastMsg.includes("allo") || lastMsg === "") {
    return {
      message: "Bonjour! Bienvenue sur Canada Marketplace! 🍁 Je suis Érable, votre assistant d'achat IA. Je suis ici pour vous aider à trouver exactement ce que vous cherchez, de manière sécuritaire.\n\nTout sur notre plateforme est en dollars canadiens, vos paiements sont protégés par séquestre, et tous les vendeurs sont vérifiés. Pas mal, hein?\n\nQue cherchez-vous aujourd'hui?",
      actions: [
        { label: "Explorer tous les produits", action: "browse" },
        { label: "S'inscrire", action: "register" },
        { label: "Comment ça marche", action: "safety" },
      ],
    }
  }

  // Thanks in French
  if (lastMsg.includes("merci") || lastMsg.includes("thank") || lastMsg.includes("remerci")) {
    return {
      message: "De rien! C'est ça que je suis ici, hein? Si vous avez besoin d'autre chose, n'hésitez pas à demander. Bonnes achats! 🍁",
      actions: [{ label: "Explorer les produits", action: "browse" }],
    }
  }

  // Default French response
  return {
    message: "Je serais ravi de vous aider avec ça! Je peux vous aider avec:\n\n🛍️ Trouver des produits dans toutes les catégories\n🛒 Questions sur le panier et la commande\n🏪 Devenir vendeur\n🔒 Séquestre et sécurité\n📦 Livraison et suivi\n🤝 Litiges et retours\n\nQue souhaitez-vous savoir de plus?",
    actions: [
      { label: "Explorer tous les produits", action: "browse" },
      { label: "Comment ça marche", action: "safety" },
      { label: "S'inscrire", action: "register" },
    ],
  }
}
