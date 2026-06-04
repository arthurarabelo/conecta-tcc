import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'

export function ProposalNotFound() {
  return (
    <main className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">Proposta não encontrada</h1>
      <p className="text-muted-foreground mb-6">Esta proposta não existe ou foi removida.</p>
      <Link
        to={ROUTES.proposals.list}
        search={{ area_id: undefined, department_id: undefined, status: undefined, page: undefined, search: '' }}
      >
        <Button variant="outline">Ver mural de propostas</Button>
      </Link>
    </main>
  )
}
