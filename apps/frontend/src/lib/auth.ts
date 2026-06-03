import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api'

function decodeJwt(token: string): { exp?: number } | null {
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'cms-web-manager-default-secret-key-for-dev-only-change-in-production',
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null

          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!res.ok) return null

          const data = await res.json()
          const decoded = decodeJwt(data.accessToken)

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            accessToken: data.accessToken,
            accessTokenExpires: decoded?.exp ? decoded.exp * 1000 : Date.now() + 24 * 60 * 60 * 1000,
            refreshToken: data.refreshToken,
            organizationId: data.user.organizationId,
            organizationName: data.user.organizationName,
            permissions: data.user.permissions,
          }
        } catch (e) {
          console.error('[NextAuth] authorize error:', e)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken
        token.accessTokenExpires = (user as any).accessTokenExpires
        token.refreshToken = (user as any).refreshToken
        token.organizationId = (user as any).organizationId
        token.organizationName = (user as any).organizationName
        token.permissions = (user as any).permissions
      }
      return token
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        accessToken: token.accessToken,
        accessTokenExpires: token.accessTokenExpires,
        refreshToken: token.refreshToken,
        organizationId: token.organizationId,
        organizationName: token.organizationName,
        permissions: token.permissions,
      } as any
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
}
