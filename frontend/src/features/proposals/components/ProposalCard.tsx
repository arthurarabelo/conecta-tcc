import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import type { Proposal } from '@/types/models'

interface ProposalCardProps {
  proposal: Proposal
}

export function ProposalCard({ proposal }: ProposalCardProps) {
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
