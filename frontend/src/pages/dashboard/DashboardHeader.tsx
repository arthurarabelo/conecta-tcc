import { Plus } from 'lucide-react'
import { OverlineLabel } from '@/components/shared/OverlineLabel'
import type { User } from '@/types/models'

interface Props {
  user: User | null
}

export function DashboardHeader({ user }: Props) {
  return (
    <section className="border-b border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 py-14 flex flex-wrap items-end justify-between gap-6">
        <div>
          <OverlineLabel>Professor · {user?.department?.name ?? 'Departamento'}</OverlineLabel>
          <h1 className="mt-2 font-display text-5xl font-semibold">{user?.name}</h1>
          <p className="mt-3 text-muted-foreground">Gerencie suas propostas e candidaturas.</p>
        </div>
        <a href="/propostas/nova">
          <button className="inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-background hover:opacity-90">
            <Plus className="h-4 w-4" /> Nova proposta
          </button>
        </a>
      </div>
    </section>
  )
}
