import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { Clock, CheckCircle, XCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { ApplicationCard } from '@/features/applications/components/ApplicationCard'
import { OverlineLabel } from '@/components/shared/OverlineLabel'
import { useApplications } from '@/features/applications/hooks'
import { useAuthStore } from '@/store/auth.store'
import { ROUTES } from '@/constants/routes'

function ApplicationSkeleton() {
  return (
    <Card data-testid="application-skeleton">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="mt-3 h-6 w-3/4" />
        <Skeleton className="mt-2 h-4 w-1/2" />
        <Skeleton className="mt-1 h-4 w-1/3" />
        <div className="mt-4 flex justify-end">
          <Skeleton className="h-8 w-28" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function MyApplicationsPage() {
  const { data, isLoading } = useApplications()
  const user = useAuthStore((s) => s.user)

  const applications = useMemo(() => {
    if (!data?.data) return []
    return [...data.data].sort(
      (a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime(),
    )
  }, [data])

  const counts = useMemo(
    () => ({
      pending: applications.filter((a) => a.status === 'pending').length,
      approved: applications.filter((a) => a.status === 'approved').length,
      rejected: applications.filter((a) => a.status === 'rejected').length,
    }),
    [applications],
  )

  return (
    <ProtectedRoute role="student">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <OverlineLabel>Aluno · {user?.name}</OverlineLabel>
        <h1 className="text-4xl font-bold">Minhas Candidaturas</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe o status das suas inscrições em tempo real.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-amber-50 p-4">
            <Clock className="text-amber-500 mb-2 h-5 w-5" />
            <p className="text-3xl font-bold">{counts.pending}</p>
            <p className="text-muted-foreground text-sm">Pendente</p>
          </div>
          <div className="rounded-xl bg-green-50 p-4">
            <CheckCircle className="mb-2 h-5 w-5 text-green-500" />
            <p className="text-3xl font-bold">{counts.approved}</p>
            <p className="text-muted-foreground text-sm">Aprovada</p>
          </div>
          <div className="rounded-xl bg-red-50 p-4">
            <XCircle className="mb-2 h-5 w-5 text-red-500" />
            <p className="text-3xl font-bold">{counts.rejected}</p>
            <p className="text-muted-foreground text-sm">Recusada</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          {isLoading && (
            <>
              <ApplicationSkeleton />
              <ApplicationSkeleton />
              <ApplicationSkeleton />
            </>
          )}

          {!isLoading && applications.length === 0 && (
            <div className="text-muted-foreground py-12 text-center">
              <p>Você ainda não se candidatou a nenhuma proposta.</p>
              <Link
                to={ROUTES.proposals.list}
                search={{ area_id: undefined, department_id: undefined, status: undefined, page: undefined, search: '' }}
                className="text-primary mt-2 inline-block underline"
              >
                Explorar mural →
              </Link>
            </div>
          )}

          {!isLoading &&
            applications.map((app) => (
              <ApplicationCard key={app.id} application={app} />
            ))}
        </div>
      </div>
    </ProtectedRoute>
  )
}
