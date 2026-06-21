import { Skeleton } from '@/components/ui/skeleton'
import { SectionHeading } from '@/components/shared/SectionHeading'
import type { Proposal } from '@/types/models'

interface Props {
  isLoading: boolean
  proposals: Proposal[] | undefined
}

export function ProposalsTable({ isLoading, proposals }: Props) {
  return (
    <section>
      <SectionHeading className="mt-14 mb-5">Minhas propostas</SectionHeading>
      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-2xl" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Título</th>
                <th className="text-left px-5 py-3 font-semibold">Área</th>
                <th className="text-left px-5 py-3 font-semibold">Vagas</th>
                <th className="text-left px-5 py-3 font-semibold">Candidaturas</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {proposals?.map(p => (
                <tr key={p.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-5 py-4 font-medium max-w-md truncate">
                    <a href={`/propostas/${p.id}/editar`} className="hover:underline">{p.title}</a>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{p.area?.name}</td>
                  <td className="px-5 py-4">{p.approved_applications_count ?? 0}/{p.max_slots}</td>
                  <td className="px-5 py-4">{p.applications_count ?? 0}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${p.status === 'open' ? 'text-success' : 'text-muted-foreground'}`}>
                      {p.status === 'open' ? 'Aberta' : 'Fechada'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
