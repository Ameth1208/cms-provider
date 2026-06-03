'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(email, password)

    if (!result.success) {
      setError(result.error || 'Credenciales inválidas')
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <div className="relative min-h-dvh flex items-center justify-center bg-black px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
            <Icon icon="lucide:store" className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white">
            CMS Web Manager
          </h1>
          <p className="text-sm text-white/50 font-light mt-2">
            Inicia sesión para administrar tu negocio
          </p>
        </div>

        <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium tracking-wider text-white/50">
                Correo electrónico
              </Label>
              <div className="relative">
                <Icon icon="lucide:mail" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 z-10" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ejemplo.com"
                  className="h-11 pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/30 focus:ring-white/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium tracking-wider text-white/50">
                Contraseña
              </Label>
              <div className="relative">
                <Icon icon="lucide:lock" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 z-10" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/30 focus:ring-white/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  tabIndex={-1}
                >
                  <Icon icon={showPassword ? 'lucide:eye-off' : 'lucide:eye'} className="h-4 w-4" />
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-xl px-4 py-3 border border-red-500/20">
                <Icon icon="lucide:alert-circle" className="h-4 w-4 shrink-0" />
                <span className="font-light">{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-sm bg-white text-black hover:bg-white/90" disabled={loading}>
              {loading ? (
                <Icon icon="lucide:loader-circle" className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icon icon="lucide:log-in" className="mr-2 h-4 w-4" />
              )}
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-white/30 font-light mt-8">
          Panel de administración
        </p>
      </div>
    </div>
  )
}
