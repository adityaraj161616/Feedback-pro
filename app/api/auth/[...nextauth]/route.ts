import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb"

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("SignIn callback - User:", user.email)
      return true
    },
    async session({ session, user }) {
      console.log("Session callback - Building session for:", user.email)

      if (session?.user && user) {
        session.user.id = user.id
        session.user.role = user.role || "user"
        session.user.emailVerified = user.emailVerified
      }

      return session
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback - URL:", url, "BaseURL:", baseUrl)

      // If it's a relative URL, make it absolute
      if (url.startsWith("/")) {
        const fullUrl = `${baseUrl}${url}`
        console.log("Redirecting to:", fullUrl)
        return fullUrl
      }

      // If it's the same origin, allow it
      try {
        const urlObj = new URL(url)
        if (urlObj.origin === baseUrl) {
          console.log("Same origin redirect to:", url)
          return url
        }
      } catch (e) {
        console.log("Invalid URL, redirecting to dashboard")
      }

      // Default to dashboard
      const dashboardUrl = `${baseUrl}/dashboard`
      console.log("Default redirect to:", dashboardUrl)
      return dashboardUrl
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      console.log(`User ${isNewUser ? "created" : "signed in"}:`, user.email)
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
