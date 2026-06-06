import { Link } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDateLong } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'
import type { Application } from '@/types/models'

interface ApplicationCardProps {
  application: Application
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const { proposal, status, feedback, applied_at } = application
  const areaName = proposal?.area?.name
  const professorName = proposal?.professor?.name
  const proposalTitle = proposal?.title ?? `Proposta #${application.proposal_id}`

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {areaName && <Badge variant="outline">{areaName}</Badge>}
          </div>
          <StatusBadge status={status} />
        </div>

        <h3 className="mt-3 text-lg font-semibold">{proposalTitle}</h3>

        {professorName && (
          <p className="text-muted-foreground text-sm">Prof. {professorName}</p>
        )}

        <p className="text-muted-foreground mt-1 text-sm">
          Candidatado em {formatDateLong(applied_at)}
        </p>

        {status === 'rejected' && feedback && (
          <div className="bg-muted mt-3 rounded-md p-3 text-sm">
            <span className="font-medium">Feedback:</span> {feedback}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.proposals.detail(application.proposal_id)}>
              Ver proposta →
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
