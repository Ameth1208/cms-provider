'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: '/',
    })

    if (result?.error) {
      setError('Credenciales inválidas')
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <div className="relative min-h-dvh flex items-center justify-center bg-muted px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-secondary/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20">
            <Icon icon="lucide:store" className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-light tracking-tight text-foreground">
            CMS Web Manager
          </h1>
          <p className="text-sm text-muted-foreground font-light mt-2">
            Inicia sesión para administrar tu negocio
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border/80 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium tracking-wider text-muted-foreground">
                Correo electrónico
              </Label>
              <div className="relative">
                <Icon icon="lucide:mail" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ejemplo.com"
                  className="h-11 pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium tracking-wider text-muted-foreground">
                Contraseña
              </Label>
              <div className="relative">
                <Icon icon="lucide:lock" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  <Icon icon={showPassword ? 'lucide:eye-off' : 'lucide:eye'} className="h-4 w-4" />
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3 border border-destructive/20">
                <Icon icon="lucide:alert-circle" className="h-4 w-4 shrink-0" />
                <span className="font-light">{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-sm" disabled={loading}>
              {loading ? (
                <Icon icon="lucide:loader-circle" className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icon icon="lucide:log-in" className="mr-2 h-4 w-4" />
              )}
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground/60 font-light mt-8">
          Panel de administración
        </p>
      </div>
    </div>
  )
}
