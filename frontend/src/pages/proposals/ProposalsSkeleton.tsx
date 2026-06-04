import { Skeleton } from '@/components/ui/skeleton'

export function ProposalsSkeleton() {
  return (
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
  )
}
