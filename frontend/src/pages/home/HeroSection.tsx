import { Link } from '@tanstack/react-router'
import { GraduationCap, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { ROUTES } from '@/constants/routes'

export function HeroSection() {
  const { isAuthenticated } = useAuth()

  return (
    <section className="bg-gradient-hero text-white py-24 px-6">
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm backdrop-blur mb-6">
          <GraduationCap className="h-4 w-4" />
          Portal de TCCs — UFMG
        </div>
        <h1 className="text-5xl font-semibold leading-tight text-balance">
          Conecte sua pesquisa ao seu futuro
        </h1>
        <p className="mt-4 text-lg text-white/70 text-balance">
          Encontre o orientador ideal, candidate-se a propostas de TCC e acompanhe sua jornada acadêmica em um só lugar.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={ROUTES.proposals.list}
            search={{ area_id: undefined, department_id: undefined, status: undefined, page: undefined, search: '' }}
            className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-foreground hover:bg-white/90 transition-colors"
          >
            Explorar mural
            <ArrowRight className="h-4 w-4" />
          </Link>
          {!isAuthenticated && (
            <Link
              to={ROUTES.login}
              search={{ mode: 'register', role: 'professor' }}
              className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Entrar como professor
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
