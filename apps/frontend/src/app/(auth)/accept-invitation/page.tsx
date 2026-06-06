'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Store, User, Lock, Eye, EyeOff, CheckCircle, Loader2, AlertCircle, Mail } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api-client'

function AcceptInvitationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { setAuth } = useAuth()

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [invitation, setInvitation] = useState<{
    email: string
    organizationName: string
    organizationSlug: string
  } | null>(null)

  useEffect(() => {
    if (!token) {
      setError('Token de invitación no válido')
      setValidating(false)
      return
    }

    api.get(`/auth/validate-invitation?token=${token}`)
      .then((data) => {
        setInvitation(data)
        setValidating(false)
      })
      .catch(() => {
        setError('La invitación ha expirado o no es válida')
        setValidating(false)
      })
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const result = await api.post('/auth/accept-invitation', {
        token,
        name,
        password,
      })

      // Auto-login after accepting invitation
      setAuth({
        token: result.accessToken,
        user: result.user,
      })

      router.push('/')
    } catch (err: any) {
      setError(err.message || 'No se pudo aceptar la invitación')
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="relative min-h-dvh flex items-center justify-center bg-black px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white/50 mx-auto mb-4" />
          <p className="text-white/50 font-light">Verificando invitación...</p>
        </div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="relative min-h-dvh flex items-center justify-center bg-black px-4">
        <div className="relative w-full max-w-sm text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white mb-2">Invitación no válida</h1>
          <p className="text-sm text-white/50 font-light">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh flex items-center justify-center bg-black px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
            <Store className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white">Únete al equipo</h1>
          <p className="text-sm text-white/50 font-light mt-2">
            Has sido invitado a {invitation?.organizationName}
          </p>
        </div>

        <div className="bg-[#0a0a0a] rounded-2xl border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium tracking-wider text-white/50">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 z-10" />
                <Input
                  id="email"
                  type="email"
                  value={invitation?.email || ''}
                  disabled
                  className="h-11 pl-10 bg-white/5 border-border text-white/70 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-medium tracking-wider text-white/50">
                Tu nombre
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 z-10" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan Pérez"
                  className="h-11 pl-10 bg-white/5 border-border text-white placeholder:text-white/30 focus:border-white/30 focus:ring-white/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium tracking-wider text-white/50">
                Crea una contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 z-10" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={8}
                  className="h-11 pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/30 focus:ring-white/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-white/30">Mínimo 8 caracteres</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-xl px-4 py-3 border border-red-500/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="font-light">{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-sm bg-white text-black hover:bg-white/90" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {loading ? 'Creando cuenta...' : 'Aceptar invitación'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-white/30 font-light mt-8">
          Al aceptar, crearás tu cuenta y accederás al panel
        </p>
      </div>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-dvh flex items-center justify-center bg-black px-4">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    }>
      <AcceptInvitationForm />
    </Suspense>
  )
}
