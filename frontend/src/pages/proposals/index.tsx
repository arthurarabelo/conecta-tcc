import { useMemo, useState } from 'react'
import { useSearch, useNavigate, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProposalCard } from '@/components/shared/ProposalCard'
import { ProposalFilters } from '@/features/proposals/components/ProposalFilters'
import { useProposals } from '@/features/proposals/hooks'
import { useAuth } from '@/hooks/use-auth'
import type { ProposalFiltersValue } from '@/features/proposals/components/ProposalFilters'
import { ProposalsSkeleton } from './ProposalsSkeleton'
import { ProposalsEmpty } from './ProposalsEmpty'
import { ROUTES } from '@/constants/routes'

export default function ProposalsPage() {
  const { isProfessor } = useAuth()
  const search = useSearch({ from: '/propostas' })
  const navigate = useNavigate({ from: '/propostas' })

  const [apiFilters, setApiFilters] = useState<ProposalFiltersValue & { page?: number }>({
    area_id: search.area_id,
    department_id: search.department_id,
    status: search.status,
    page: search.page,
  })
  const [searchText, setSearchText] = useState<string>(search.search ?? '')

  const { data, isLoading } = useProposals(apiFilters)

  const filteredProposals = useMemo(() => {
    if (!data?.data) return []
    const lower = searchText.toLowerCase()
    if (!lower) return data.data
    return data.data.filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        (p.professor?.name ?? '').toLowerCase().includes(lower),
    )
  }, [data, searchText])

  function handleFiltersChange(newFilters: ProposalFiltersValue) {
    const updated = { ...newFilters, page: 1 }
    setApiFilters(updated)
    navigate({
      search: {
        area_id: updated.area_id ?? undefined,
        department_id: updated.department_id ?? undefined,
        status: updated.status ?? undefined,
        page: updated.page ?? undefined,
        search: searchText || '',
      },
    })
  }

  function handleSearchChange(value: string) {
    setSearchText(value)
    navigate({ search: (prev) => ({ ...prev, search: value || '' }) })
  }

  function goToPage(page: number) {
    const updated = { ...apiFilters, page }
    setApiFilters(updated)
    navigate({ search: (prev) => ({ ...prev, page }) })
  }

  const meta = data?.meta
  const currentPage = meta?.current_page ?? 1
  const lastPage = meta?.last_page ?? 1

  return (
    <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Mural de Propostas</h1>
          {isProfessor && (
            <Button asChild>
              <Link to={ROUTES.proposals.create}>
                <Plus className="h-4 w-4 mr-2" />
                Nova proposta
              </Link>
            </Button>
          )}
        </div>

        <div className="mb-6">
          <ProposalFilters
            filters={apiFilters}
            onChange={handleFiltersChange}
            search={searchText}
            onSearchChange={handleSearchChange}
          />
        </div>

        {isLoading ? (
          <ProposalsSkeleton />
        ) : filteredProposals.length === 0 ? (
          <ProposalsEmpty />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredProposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        )}

        {!isLoading && lastPage > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {lastPage}
            </span>
            <Button
              variant="outline"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= lastPage}
            >
              Próximo
            </Button>
          </div>
        )}
    </main>
  )
}
