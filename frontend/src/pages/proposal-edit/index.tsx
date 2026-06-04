import { useParams, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { ProposalForm } from '@/features/proposals/components/ProposalForm'
import { useProposal } from '@/features/proposals/hooks'
import { useAuthStore } from '@/store/auth.store'
import { ROUTES } from '@/constants/routes'
import { ProposalEditSkeleton } from './ProposalEditSkeleton'

export default function ProposalEditPage() {
  const { id } = useParams({ from: '/propostas/$id/editar' })
  const proposalId = Number(id)
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data: proposal, isLoading } = useProposal(proposalId)

  useEffect(() => {
    if (!isLoading && proposal && user && proposal.professor_id !== user.id) {
      navigate({ to: ROUTES.dashboard })
    }
  }, [isLoading, proposal, user, navigate])

  if (isLoading) {
    return (
      <ProtectedRoute role="professor">
        <ProposalEditSkeleton />
      </ProtectedRoute>
    )
  }

  if (!proposal || (user && proposal.professor_id !== user.id)) return null

  return (
    <ProtectedRoute role="professor">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Editar proposta</h1>
        <ProposalForm
          mode="edit"
          proposal={proposal}
          onSuccess={() => navigate({ to: ROUTES.dashboard })}
          onDeleted={() => navigate({ to: ROUTES.dashboard })}
        />
      </main>
    </ProtectedRoute>
  )
}
