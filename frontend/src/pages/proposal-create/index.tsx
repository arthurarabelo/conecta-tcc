import { useNavigate } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { ProposalForm } from '@/features/proposals/components/ProposalForm'
import { ROUTES } from '@/constants/routes'
import type { Proposal } from '@/types/models'

export default function ProposalCreatePage() {
  const navigate = useNavigate()

  function handleSuccess(created?: Proposal) {
    if (created) {
      navigate({ to: ROUTES.proposals.detail(created.id) })
    }
  }

  return (
    <ProtectedRoute role="professor">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Nova proposta</h1>
        <ProposalForm mode="create" onSuccess={handleSuccess} />
      </main>
    </ProtectedRoute>
  )
}
