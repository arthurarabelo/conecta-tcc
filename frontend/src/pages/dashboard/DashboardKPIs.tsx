import { BookMarked, Users, CheckCircle2, Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  isLoading: boolean
  activeProposals: number
  totalSlots: number
  filledSlots: number
  pendingCount: number
}

export function DashboardKPIs({ isLoading, activeProposals, totalSlots, filledSlots, pendingCount }: Props) {
  const kpis = [
    { icon: BookMarked, label: 'Propostas ativas', value: activeProposals },
    { icon: Users, label: 'Vagas totais', value: totalSlots },
    { icon: CheckCircle2, label: 'Orientandos confirmados', value: filledSlots },
    { icon: Clock, label: 'Candidaturas pendentes', value: pendingCount },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {isLoading
        ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
        : kpis.map((k) => (
            <div key={k.label} className="rounded-2xl border border-border bg-card p-5">
              <k.icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
              <div className="mt-3 font-display text-3xl font-semibold">{k.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{k.label}</div>
            </div>
          ))}
    </div>
  )
}
