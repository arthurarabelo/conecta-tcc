import { useMemo, useState } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ProposalCard } from '@/components/shared/ProposalCard'
import { ProposalFilters } from '@/features/proposals/components/ProposalFilters'
import { useProposals } from '@/features/proposals/hooks'
import type { ProposalFiltersValue } from '@/features/proposals/components/ProposalFilters'

export default function ProposalsPage() {
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
    return data.data.filter((p) => p.title.toLowerCase().includes(lower))
  }, [data, searchText])

  function handleFiltersChange(newFilters: ProposalFiltersValue) {
    const updated = { ...newFilters, page: 1 }
    setApiFilters(updated)
    navigate({ search: { ...updated, search: searchText || undefined } })
  }

  function handleSearchChange(value: string) {
    setSearchText(value)
    navigate({ search: (prev) => ({ ...prev, search: value || undefined }) })
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
        <h1 className="text-3xl font-bold mb-6">Mural de Propostas</h1>

        <div className="mb-6">
          <ProposalFilters
            filters={apiFilters}
            onChange={handleFiltersChange}
            search={searchText}
            onSearchChange={handleSearchChange}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} data-testid="proposal-card-skeleton" className="rounded-lg border p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-20 w-full mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredProposals.length === 0 ? (
          <p className="text-muted-foreground text-center py-16">Nenhuma proposta encontrada.</p>
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
