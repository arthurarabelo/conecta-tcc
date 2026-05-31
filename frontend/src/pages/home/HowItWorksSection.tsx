import { BookOpen, Search, CheckCircle } from 'lucide-react'

const STEPS = [
  {
    icon: BookOpen,
    step: '01',
    title: 'Professor publica',
    desc: 'O professor cadastra uma proposta de TCC com tema, requisitos e número de vagas disponíveis.',
  },
  {
    icon: Search,
    step: '02',
    title: 'Aluno se candidata',
    desc: 'O aluno navega pelo mural de propostas e se candidata àquelas que combinam com seu perfil.',
  },
  {
    icon: CheckCircle,
    step: '03',
    title: 'Professor aprova',
    desc: 'O professor avalia os candidatos e aprova o aluno mais adequado para orientar.',
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Como funciona</p>
          <h2 className="mt-2 text-3xl font-semibold">Três passos simples</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {STEPS.map(({ icon: Icon, step, title, desc }) => (
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
  )
}
