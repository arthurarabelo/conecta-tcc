import { useParams, Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { ExternalLink, ArrowLeft, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useProposal, useApplyToProposal } from '@/features/proposals/hooks'
import { useApplications } from '@/features/applications/hooks'
import { ApplicationCard } from '@/features/proposals/components/ApplicationCard'
import { useAuthStore } from '@/store/auth.store'
import { NotFoundError } from '@/lib/error'
import { ROUTES } from '@/constants/routes'
import { ProposalDetailSkeleton } from './ProposalDetailSkeleton'
import { ProposalNotFound } from './ProposalNotFound'

export default function ProposalDetailPage() {
  const { id } = useParams({ from: '/propostas/$id' })
  const proposalId = Number(id)
  const { user } = useAuthStore()

  const { data: proposal, isLoading: loadingProposal, error } = useProposal(proposalId)
  const { data: applicationsData, isLoading: loadingApplications } = useApplications()

  const userApplication = useMemo(() => {
    if (!user || user.role !== 'student') return null
    return applicationsData?.data.find((a) => a.proposal_id === proposalId) ?? null
  }, [applicationsData, user, proposalId])

  const applyMutation = useApplyToProposal()

  function handleApply() {
    applyMutation.mutate(proposalId, {
      onSuccess() {
        toast.success('Candidatura enviada! Sua candidatura está em análise.')
      },
      onError() {
        toast.error('Não foi possível enviar sua candidatura.')
      },
    })
  }

  const isLoading = loadingProposal || loadingApplications

  if (isLoading) return <ProposalDetailSkeleton />

  if (error instanceof NotFoundError || !proposal) return <ProposalNotFound />

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          to={ROUTES.proposals.list}
          search={{ area_id: undefined, department_id: undefined, status: undefined, page: undefined, search: '' }}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Mural de Propostas
        </Link>
        {user && proposal.professor_id === user.id && (
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.proposals.edit(proposal.id)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-2 mb-4">
            {proposal.area && <Badge variant="secondary">{proposal.area.name}</Badge>}
            {proposal.department && <Badge variant="outline">{proposal.department.code}</Badge>}
            <Badge variant={proposal.status === 'open' ? 'default' : 'secondary'}>
              {proposal.status === 'open' ? 'Aberta' : 'Fechada'}
            </Badge>
          </div>

          <h1 className="text-3xl font-bold mb-4">{proposal.title}</h1>

          {proposal.professor && (
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center font-semibold text-sm">
                {proposal.professor.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{proposal.professor.name}</p>
                {proposal.department && (
                  <p className="text-sm text-muted-foreground">{proposal.department.name}</p>
                )}
              </div>
              {proposal.professor.profile_link && (
                <a
                  href={proposal.professor.profile_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary underline ml-2"
                >
                  Lattes <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          <Separator className="my-6" />

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Sobre o projeto</h2>
            <p className="text-muted-foreground whitespace-pre-line">{proposal.description}</p>
          </section>

          {proposal.prerequisites && (
            <section>
              <h2 className="text-xl font-semibold mb-2">Pré-requisitos</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                {proposal.prerequisites.split('\n').map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="lg:col-span-1">
          <ApplicationCard
            proposal={proposal}
            user={user}
            userApplication={userApplication}
            onApply={handleApply}
            isApplying={applyMutation.isPending}
          />
        </div>
      </div>
    </main>
  )
}
