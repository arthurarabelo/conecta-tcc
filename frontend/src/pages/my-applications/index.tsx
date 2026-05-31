import { ProtectedRoute } from '@/components/shared/ProtectedRoute'

function MyApplicationsContent() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold">Minhas Candidaturas</h1>
      <p className="text-muted-foreground mt-2">
        Acompanhe o status das suas candidaturas a propostas de TCC.
      </p>
    </div>
  )
}

export default function MyApplicationsPage() {
  return (
    <ProtectedRoute role="student">
      <MyApplicationsContent />
    </ProtectedRoute>
  )
}
