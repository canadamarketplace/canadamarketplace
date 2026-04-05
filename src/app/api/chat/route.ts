import { NextRequest, NextResponse } from "next/server"
import ZAI from "z-ai-web-dev-sdk"

export async function POST(req: NextRequest) {
  try {
    const { messages, cartItems, currentPage, user, locale } = await req.json()
    const isFrench = locale === "fr"

    // Build user context
    let userContext = ""
    if (user) {
      userContext = `Current user: ${user.name} (${user.role})`
    } else {
      userContext = "Current user: Not logged in (guest)"
    }

    let cartContext = "Cart is empty"
    if (cartItems && cartItems.length > 0) {
      const cartTotal = cartItems.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0)
      cartContext = `Cart has ${cartItems.length} item(s), total: $${cartTotal.toFixed(2)} CAD. Items: ${cartItems.map((i: any) => `${i.title} ($${i.price} x${i.quantity})`).join(", ")}`
    }

    const languageContext = isFrench ? "French (Quebec)" : "English"

    // Build system prompt
    const systemPrompt = `You are Maple, the friendly AI shopping assistant for Canada Marketplace (canadamarketplace.ca). You guide customers through their entire shopping journey in a warm, helpful, and distinctly Canadian way.

CONTEXT:
- ${userContext}
- ${cartContext}
- Current page: ${currentPage}
- Language: ${languageContext}

GUIDELINES:
- Be warm, friendly, and distinctly Canadian (use "eh" occasionally, reference maple syrup, hockey, etc.)
- All prices are in Canadian Dollars (CAD)
- The marketplace has 8 categories: Electronics, Fashion, Home & Garden, Sports, Vehicles, Books, Music, Outdoor
- Sellers are verified and payments are protected by escrow
- Marketplace fee is 8% for sellers (5% for Gold sellers)
- Disputes can be filed within 14 days of delivery
- Buyers pay no fees
- The marketplace serves all 13 Canadian provinces and territories
- Data stays in Canada (PIPEDA compliant)

${isFrench ? "IMPORTANT: Respond entirely in Quebec French. Use proper terminology: 'courriel' not 'email', 'panier' not 'cart', 'magasiner' not 'shop', 'séquestre' not 'escrow'." : "IMPORTANT: Respond in English."}

When suggesting actions, format them as:
[NAVIGATE:page] or [NAVIGATE:page?param=value]
Example: [NAVIGATE:browse] or [NAVIGATE:browse?category=electronics]

Available pages: browse, cart, checkout, orders, profile, register, login, become-seller, safety, seller-locator, messaging, notifications, wishlist, faq, shipping, escrow, seller-guide
Category params: electronics, fashion, home-garden, sports, vehicles, books, music, outdoor`

    // Build conversation messages for LLM
    const chatMessages = [
      { role: "system", content: systemPrompt },
    ]

    // Add conversation history (last 10 messages to stay within context)
    const recentMessages = (messages || []).slice(-10)
    for (const msg of recentMessages) {
      chatMessages.push({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      })
    }

    // Call LLM
    let aiResponse: string
    try {
      const zai = await ZAI.create()
      const completion = await zai.chat.completions.create({
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 500,
      })

      aiResponse = completion.choices[0]?.message?.content || ""
    } catch (llmError: any) {
      console.error("LLM call failed:", llmError?.message || llmError)
      // Fallback response
      if (isFrench) {
        aiResponse = "Désolé, je rencontre des difficultés en ce moment. Veuillez réessayer dans un instant! 🍁"
      } else {
        aiResponse = "Sorry, I'm having trouble right now. Please try again in a moment! 🍁"
      }
    }

    // Parse actions from response
    const actions: Array<{ label: string; action: string; params?: Record<string, string> }> = []
    const actionRegex = /\[NAVIGATE:(\w+)(?:\?(\w+)=(\w+))?\]/g
    let match

    const actionLabels: Record<string, string> = {
      browse: isFrench ? "Explorer les produits" : "Browse Products",
      cart: isFrench ? "Voir mon panier" : "View My Cart",
      checkout: isFrench ? "Passer la commande" : "Checkout",
      orders: isFrench ? "Voir mes commandes" : "View My Orders",
      register: isFrench ? "S'inscrire" : "Register Now",
      login: isFrench ? "Se connecter" : "Sign In",
      "become-seller": isFrench ? "Devenir vendeur" : "Become a Seller",
      safety: isFrench ? "Comment ça marche" : "How It Works",
      "seller-locator": isFrench ? "Localisateur de vendeurs" : "Seller Locator",
      messaging: isFrench ? "Messages" : "Messages",
      notifications: isFrench ? "Notifications" : "Notifications",
      wishlist: isFrench ? "Favoris" : "Wishlist",
      faq: isFrench ? "FAQ" : "FAQ",
      shipping: isFrench ? "Livraison" : "Shipping",
      escrow: isFrench ? "Séquestre" : "Escrow Protection",
      "seller-guide": isFrench ? "Guide vendeur" : "Seller Guide",
      profile: isFrench ? "Mon profil" : "My Profile",
    }

    while ((match = actionRegex.exec(aiResponse)) !== null) {
      const page = match[1]
      const paramName = match[2]
      const paramValue = match[3]
      const label = actionLabels[page] || page
      actions.push({
        label,
        action: page,
        ...(paramName && paramValue ? { params: { [paramName]: paramValue } } : {}),
      })
    }

    // Clean up navigation tags from the message
    const cleanMessage = aiResponse.replace(/\[NAVIGATE:\w+(?:\?\w+=\w+)?\]/g, "").trim()

    // If no actions detected but message mentions browsing/categories, add browse action
    if (actions.length === 0) {
      const lowerMsg = cleanMessage.toLowerCase()
      if (lowerMsg.includes("browse") || lowerMsg.includes("explor") || lowerMsg.includes("shop") || lowerMsg.includes("magasin") || lowerMsg.includes("product") || lowerMsg.includes("produit")) {
        actions.push({
          label: isFrench ? "Explorer tous les produits" : "Browse All Products",
          action: "browse",
        })
      }
    }

    return NextResponse.json({
      message: cleanMessage,
      actions,
    })
  } catch (error: any) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      {
        message: "Sorry, I'm having trouble right now. Please try again in a moment! 🍁",
        actions: [],
      },
      { status: 500 }
    )
  }
}
