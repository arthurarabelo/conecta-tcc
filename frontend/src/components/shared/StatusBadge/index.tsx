import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ApplicationStatus } from '@/types/models'

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'Em análise',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
  },
  approved: {
    label: 'Aprovado',
    className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
  },
  rejected: {
    label: 'Rejeitado',
    className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
  },
}

interface StatusBadgeProps {
  status: ApplicationStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = STATUS_CONFIG[status]
  return (
    <Badge variant="outline" className={cn(className)}>
      {label}
    </Badge>
  )
}