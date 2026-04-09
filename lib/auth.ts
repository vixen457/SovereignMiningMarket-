import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { getUserByEmail, verifyPassword } from './authHelpers'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await getUserByEmail(credentials.email as string)
        if (!user) return null
        const isValid = await verifyPassword(credentials.password as string, user.password)
        if (!isValid) return null
        return { id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin, balance: user.balance }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.isAdmin = (user as any).isAdmin; token.balance = (user as any).balance }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.isAdmin = token.isAdmin as boolean
      session.user.balance = token.balance as number
      return session
    }
  },
  pages: { signIn: '/user/login' },
  secret: process.env.NEXTAUTH_SECRET,
})
