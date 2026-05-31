import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users } from 'lucide-react'
import { getInitials, remainingSlots } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'
import type { Proposal } from '@/types/models'

interface ProposalCardProps {
  proposal: Proposal
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const slots = remainingSlots(proposal.max_slots, proposal.approved_applications_count ?? 0)

  return (
    <Link to={ROUTES.proposals.detail(proposal.id)} className="block focus:outline-none">
      <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {proposal.area && (
              <Badge variant="secondary">{proposal.area.name}</Badge>
            )}
            <Badge
              variant="outline"
              className={
                proposal.status === 'open'
                  ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-50'
                  : 'border-zinc-300 bg-zinc-50 text-zinc-600 hover:bg-zinc-50'
              }
            >
              {proposal.status === 'open' ? 'Aberta' : 'Fechada'}
            </Badge>
          </div>
          <h3 className="font-semibold text-base leading-snug line-clamp-2">
            {proposal.title}
          </h3>
        </CardHeader>

        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {proposal.description}
          </p>
        </CardContent>

        <CardFooter className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs">
                {proposal.professor ? getInitials(proposal.professor.name) : '?'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {proposal.professor?.name ?? 'Professor'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {slots} de {proposal.max_slots} vagas
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}