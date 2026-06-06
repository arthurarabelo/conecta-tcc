import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { ApplicationCard } from '@/features/applications/components/ApplicationCard'
import { useApplications } from '@/features/applications/hooks'
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
        <h1 className="text-3xl font-bold">Minhas Candidaturas</h1>

        <div className="mt-4 flex flex-wrap gap-3">
          <span className="bg-secondary text-secondary-foreground rounded-full px-4 py-1 text-sm font-medium">
            Em análise {counts.pending}
          </span>
          <span className="bg-secondary text-secondary-foreground rounded-full px-4 py-1 text-sm font-medium">
            Aprovadas {counts.approved}
          </span>
          <span className="bg-secondary text-secondary-foreground rounded-full px-4 py-1 text-sm font-medium">
            Rejeitadas {counts.rejected}
          </span>
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
