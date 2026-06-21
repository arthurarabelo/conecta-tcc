import { CheckCircle2, XCircle, Mail, ExternalLink } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { SectionHeading } from '@/components/shared/SectionHeading'
import type { Application } from '@/types/models'

interface Props {
  isLoading: boolean
  applications: Application[] | undefined
  onApprove: (id: number) => void
  onReject: (id: number) => void
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

export function PendingApplicationsList({ isLoading, applications, onApprove, onReject }: Props) {
  return (
    <section>
      <SectionHeading className="mt-14 mb-5">Candidaturas para revisar</SectionHeading>
      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-2xl" />
      ) : (
        <div className="space-y-4">
          {applications?.map(app => (
            <div key={app.id} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 font-bold text-accent-foreground flex-none">
                  {app.student?.name ? initials(app.student.name) : '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{app.student?.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Aplicou para <span className="font-medium text-foreground">{app.proposal?.title}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {app.student?.email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {app.student.email}
                      </span>
                    )}
                    {app.student?.profile_link && (
                      <a
                        href={app.student.profile_link}
                        target="_blank"
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        <ExternalLink className="h-3 w-3" /> Portfólio
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-none">
                  <button
                    onClick={() => onReject(app.id)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  >
                    <XCircle className="h-4 w-4" /> Recusar
                  </button>
                  <button
                    onClick={() => onApprove(app.id)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-sm font-semibold text-background hover:opacity-90"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Aprovar
                  </button>
                </div>
              </div>
            </div>
          ))}
          {applications?.length === 0 && (
            <p className="text-muted-foreground text-sm py-6 text-center">Nenhuma candidatura pendente.</p>
          )}
        </div>
      )}
    </section>
  )
}
