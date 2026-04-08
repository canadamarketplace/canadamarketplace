import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { store: true },
        })
        if (!user || !user.isActive) return null
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatar,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow all sign-in attempts for credentials
      if (account?.provider === "credentials") {
        return true
      }

      // For OAuth providers, link or create user
      if (account && user.email) {
        // Check if user already exists with this email
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
        })

        if (!existingUser) {
          // Create new user from OAuth profile
          const name =
            profile?.name ||
            user.name ||
            user.email.split("@")[0]

          await db.user.create({
            data: {
              email: user.email,
              name,
              password: await bcrypt.hash(
                `oauth_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                12
              ),
              role: "BUYER",
              avatar: user.image || null,
              isVerified: true,
            },
          })
        }
        return true
      }

      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role
        token.userId = user.id
      }
      // For OAuth sign-ins, look up the user's role from DB
      if (account?.provider === "google" || account?.provider === "facebook") {
        if (token.email && !token.userId) {
          const dbUser = await db.user.findUnique({
            where: { email: token.email as string },
            select: { id: true, role: true },
          })
          if (dbUser) {
            token.userId = dbUser.id
            token.role = dbUser.role
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role
        (session.user as any).userId = token.userId
      }
      return session
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "canada-marketplace-secret-key-2024",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
