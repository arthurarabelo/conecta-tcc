import { ProtectedRoute } from '@/components/shared/ProtectedRoute'

function DashboardContent() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold">Dashboard do Professor</h1>
      <p className="text-muted-foreground mt-2">
        Gerencie suas propostas de TCC e candidaturas recebidas.
      </p>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute role="professor">
      <DashboardContent />
    </ProtectedRoute>
  )
}
