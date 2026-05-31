import { Link } from '@tanstack/react-router'
import { BookOpen, Search, CheckCircle, GraduationCap, ArrowRight } from 'lucide-react'
import { useProposals } from '@/features/proposals/hooks'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'

function ProposalCard({ proposal }: { proposal: { id: number; title: string; description: string; professor?: { name: string }; department?: { name: string }; status: string } }) {
  return (
    <Link to={ROUTES.proposals.detail(proposal.id)} className="group block">
      <Card className="h-full transition-shadow hover:shadow-elegant">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {proposal.title}
            </CardTitle>
            <span className="shrink-0 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent-foreground">
              {proposal.status === 'open' ? 'Aberta' : 'Fechada'}
            </span>
          </div>
          {proposal.department && (
            <CardDescription>{proposal.department.name}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">{proposal.description}</p>
          {proposal.professor && (
            <p className="mt-3 text-xs text-muted-foreground">Prof. {proposal.professor.name}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

function ProposalSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-1" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  const { data, isPending } = useProposals({ status: 'open', page: 1 })
  const featured = data?.data.slice(0, 3) ?? []

  return (
    <div className="min-h-screen flex flex-col">
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
              className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-foreground hover:bg-white/90 transition-colors"
            >
              Explorar mural
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={ROUTES.login}
              className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Entrar como professor
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-background">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Como funciona</p>
            <h2 className="mt-2 text-3xl font-semibold">Três passos simples</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, step: '01', title: 'Professor publica', desc: 'O professor cadastra uma proposta de TCC com tema, requisitos e número de vagas disponíveis.' },
              { icon: Search, step: '02', title: 'Aluno se candidata', desc: 'O aluno navega pelo mural de propostas e se candidata àquelas que combinam com seu perfil.' },
              { icon: CheckCircle, step: '03', title: 'Professor aprova', desc: 'O professor avalia os candidatos e aprova o aluno mais adequado para orientar.' },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/15 mb-4">
                  <Icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <span className="text-xs font-bold tracking-widest text-muted-foreground mb-1">{step}</span>
                <h3 className="text-base font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-secondary/30">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Propostas abertas</p>
              <h2 className="mt-1 text-3xl font-semibold">Em destaque</h2>
            </div>
            <Link
              to={ROUTES.proposals.list}
              className="text-sm font-semibold text-foreground underline-offset-4 hover:underline hidden sm:inline"
            >
              Ver todas
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isPending
              ? Array.from({ length: 3 }).map((_, i) => <ProposalSkeleton key={i} />)
              : featured.length > 0
                ? featured.map((p) => <ProposalCard key={p.id} proposal={p} />)
                : <p className="col-span-3 text-center text-muted-foreground py-8">Nenhuma proposta aberta no momento.</p>
            }
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link to={ROUTES.proposals.list} className="text-sm font-semibold underline-offset-4 hover:underline">
              Ver todas as propostas
            </Link>
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t py-10 px-6 bg-background">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <GraduationCap className="h-4 w-4" />
            Conecta TCC
          </div>
          <p>Projeto de TCC — DCC/UFMG · 2026</p>
        </div>
      </footer>
    </div>
  )
}
