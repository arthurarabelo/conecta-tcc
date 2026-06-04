import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ROUTES } from '@/constants/routes'
import type { Application, Proposal, User } from '@/types/models'

interface ApplicationCardProps {
  proposal: Proposal
  user: User | null
  userApplication: Application | null
  onApply: () => void
  isApplying: boolean
}

export function ApplicationCard({
  proposal,
  user,
  userApplication,
  onApply,
  isApplying,
}: ApplicationCardProps) {
  if (user?.role === 'professor') return null

  const approved = proposal.approved_applications_count ?? 0
  const max = proposal.max_slots
  const progressPct = max > 0 ? Math.round((approved / max) * 100) : 0
  const isClosed = proposal.status === 'closed'
  const isFull = approved >= max

  function renderAction() {
    if (!user) {
      return (
        <Link to={ROUTES.login} className="w-full">
          <Button className="w-full" variant="outline">
            Entrar para se candidatar
          </Button>
        </Link>
      )
    }

    if (isClosed) {
      return (
        <Button className="w-full" disabled>
          Proposta encerrada
        </Button>
      )
    }

    if (isFull && !userApplication) {
      return (
        <Button className="w-full" disabled>
          Sem vagas disponíveis
        </Button>
      )
    }

    if (userApplication?.status === 'pending') {
      return (
        <Badge variant="secondary" className="text-sm px-4 py-1.5">
          Em análise
        </Badge>
      )
    }

    if (userApplication?.status === 'approved') {
      return (
        <div className="flex flex-col items-center gap-2">
          <Badge variant="default" className="bg-green-600 text-sm px-4 py-1.5">
            Aprovado
          </Badge>
          <Link to={ROUTES.myApplications} className="text-sm underline text-primary">
            Minhas candidaturas
          </Link>
        </div>
      )
    }

    if (userApplication?.status === 'rejected') {
      return (
        <Badge variant="destructive" className="text-sm px-4 py-1.5">
          Rejeitado
        </Badge>
      )
    }

    return (
      <Button className="w-full" onClick={onApply} disabled={isApplying}>
        {isApplying ? 'Enviando...' : 'Candidatar-se'}
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Candidatura</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 items-center">
        <div className="w-full">
          <p className="text-sm text-muted-foreground mb-1">
            {approved} de {max} vagas aprovadas
          </p>
          <Progress value={progressPct} className="h-2" />
        </div>
        {renderAction()}
      </CardContent>
    </Card>
  )
}
