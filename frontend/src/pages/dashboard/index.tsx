import { useState } from 'react'
import { toast } from 'sonner'
import { useProposals } from '@/features/proposals/hooks'
import { useApplications, useApproveApplication, useRejectApplication } from '@/features/applications/hooks'
import { useAuthStore } from '@/store/auth.store'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { DashboardHeader } from './DashboardHeader'
import { DashboardKPIs } from './DashboardKPIs'
import { ProposalsTable } from './ProposalsTable'
import { PendingApplicationsList } from './PendingApplicationsList'
import { ApproveDialog } from './ApproveDialog'
import { RejectDialog } from './RejectDialog'

type DialogState = { open: boolean; id: number | null }

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const { data: proposals, isLoading: loadingProposals } = useProposals()
  const { data: pendingApplications, isLoading: loadingApps } = useApplications({ status: 'pending' })
  const { mutate: approve, isPending: approvePending } = useApproveApplication()
  const { mutate: reject } = useRejectApplication()

  const [approveDialog, setApproveDialog] = useState<DialogState>({ open: false, id: null })
  const [rejectDialog, setRejectDialog] = useState<DialogState>({ open: false, id: null })
  const [feedback, setFeedback] = useState('')

  const activeProposals = proposals?.data.filter(p => p.status === 'open').length ?? 0
  const totalSlots = proposals?.data.reduce((acc, p) => acc + p.max_slots, 0) ?? 0
  const filledSlots = proposals?.data.reduce((acc, p) => acc + (p.approved_applications_count ?? 0), 0) ?? 0
  const pendingCount = pendingApplications?.data.length ?? 0

  const confirmApprove = () => {
    approve(approveDialog.id!, {
      onSuccess: () => {
        toast.success('Candidatura aprovada!')
        setApproveDialog({ open: false, id: null })
      },
      onError: () => toast.error('Erro ao aprovar candidatura.'),
    })
  }

  const handleReject = () => {
    if (!feedback.trim()) {
      toast.error('Digite um feedback antes de rejeitar.')
      return
    }
    reject({ id: rejectDialog.id!, payload: { feedback } }, {
      onSuccess: () => {
        toast.success('Candidatura rejeitada.')
        setRejectDialog({ open: false, id: null })
        setFeedback('')
      },
    })
  }

  return (
    <ProtectedRoute role="professor">
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <DashboardKPIs
          isLoading={loadingProposals}
          activeProposals={activeProposals}
          totalSlots={totalSlots}
          filledSlots={filledSlots}
          pendingCount={pendingCount}
        />
        <ProposalsTable isLoading={loadingProposals} proposals={proposals?.data} />
        <PendingApplicationsList
          isLoading={loadingApps}
          applications={pendingApplications?.data}
          onApprove={(id) => setApproveDialog({ open: true, id })}
          onReject={(id) => setRejectDialog({ open: true, id })}
        />
      </div>

      <ApproveDialog
        open={approveDialog.open}
        onOpenChange={(open) => setApproveDialog({ open, id: null })}
        onConfirm={confirmApprove}
        isPending={approvePending}
      />
      <RejectDialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog({ open, id: null })}
        feedback={feedback}
        onFeedbackChange={setFeedback}
        onConfirm={handleReject}
      />
    </div>
    </ProtectedRoute>
  )
}
