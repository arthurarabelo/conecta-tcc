import { useState, useEffect } from 'react'
import { useNavigate, useSearch, Link } from '@tanstack/react-router'
import { GraduationCap } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { ROUTES } from '@/constants/routes'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const search = useSearch({ from: '/entrar' })
  const [mode, setMode] = useState<Mode>(search.mode ?? 'login')
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: ROUTES.home })
    }
  }, [isAuthenticated, navigate])

  if (isAuthenticated) return null

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="relative hidden md:flex flex-col justify-between p-12 bg-gradient-hero text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <Link to={ROUTES.home} className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="text-lg font-semibold">Conecta TCC</div>
        </Link>
        <div className="relative">
          <h2 className="text-4xl font-semibold leading-tight text-balance">
            "Boas perguntas merecem bons orientadores."
          </h2>
          <p className="mt-4 text-white/70 text-sm">— Diretoria de Graduação, 2026</p>
        </div>
        <div className="relative text-xs text-white/50">© 2026 Portal Conecta TCC</div>
      </div>

      <div className="flex flex-col justify-center px-6 md:px-16 py-16 bg-background">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {mode === 'login' ? 'Acesso' : 'Cadastro'}
          </div>
          <h1 className="mt-2 text-4xl font-semibold">
            {mode === 'login' ? 'Bem-vindo de volta.' : 'Crie sua conta.'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === 'login'
              ? 'Entre com seu e-mail institucional.'
              : 'Cadastre-se para publicar ou candidatar-se.'}
          </p>

          <div className="mt-8">
            {mode === 'login' ? <LoginForm /> : <RegisterForm initialRole={search.role} />}
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>
                Ainda não tem conta?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="font-semibold text-foreground underline-offset-4 hover:underline"
                >
                  Cadastre-se
                </button>
              </>
            ) : (
              <>
                Já tem conta?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="font-semibold text-foreground underline-offset-4 hover:underline"
                >
                  Entrar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
