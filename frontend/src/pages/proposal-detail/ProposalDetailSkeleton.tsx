import { Skeleton } from '@/components/ui/skeleton'

export function ProposalDetailSkeleton() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} data-testid="detail-skeleton" className="h-6 w-24 rounded-full" />
        ))}
      </div>
      <Skeleton data-testid="detail-skeleton" className="h-10 w-3/4 mb-4" />
      <Skeleton data-testid="detail-skeleton" className="h-5 w-1/3 mb-8" />
      <Skeleton data-testid="detail-skeleton" className="h-40 w-full mb-4" />
      <Skeleton data-testid="detail-skeleton" className="h-20 w-full" />
    </main>
  )
}
