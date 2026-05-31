import { Link } from '@tanstack/react-router'
import { useProposals } from '@/features/proposals/hooks'
import { ProposalCard } from '@/features/proposals/components/ProposalCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'

function ProposalSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-1" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  )
}

export function FeaturedProposalsSection() {
  const { data, isPending } = useProposals({ status: 'open', page: 1 })
  const featured = data?.data.slice(0, 3) ?? []

  return (
    <section className="py-20 px-6 bg-secondary/30">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Propostas abertas</p>
            <h2 className="mt-1 text-3xl font-semibold">Em destaque</h2>
          </div>
          <Link
            to={ROUTES.proposals.list}
            className="text-sm font-semibold text-foreground underline-offset-4 hover:underline hidden sm:inline"
          >
            Ver todas
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isPending
            ? Array.from({ length: 3 }).map((_, i) => <ProposalSkeleton key={i} />)
            : featured.length > 0
              ? featured.map((p) => <ProposalCard key={p.id} proposal={p} />)
              : <p className="col-span-3 text-center text-muted-foreground py-8">Nenhuma proposta aberta no momento.</p>
          }
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link to={ROUTES.proposals.list} className="text-sm font-semibold underline-offset-4 hover:underline">
            Ver todas as propostas
          </Link>
        </div>
      </div>
    </section>
  )
}
