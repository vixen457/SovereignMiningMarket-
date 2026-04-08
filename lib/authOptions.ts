import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getUserByEmail, verifyPassword } from './auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await getUserByEmail(credentials.email)
        if (!user) return null
        const isValid = await verifyPassword(credentials.password, user.password)
        if (!isValid) return null
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.is_admin,
          balance: user.balance,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isAdmin = (user as any).isAdmin
        token.balance = (user as any).balance
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.isAdmin = token.isAdmin as boolean
        session.user.balance = token.balance as number
      }
      return session
    }
  },
  pages: {
    signIn: '/user/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
