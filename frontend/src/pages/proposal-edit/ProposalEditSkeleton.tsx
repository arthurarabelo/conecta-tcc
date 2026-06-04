import { Skeleton } from '@/components/ui/skeleton'

export function ProposalEditSkeleton() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <Skeleton className="h-10 w-1/2 mb-6" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </main>
  )
}
