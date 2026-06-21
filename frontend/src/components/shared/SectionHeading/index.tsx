import { cn } from '@/lib/utils'

interface Props {
  children: React.ReactNode
  className?: string
}

export function SectionHeading({ children, className }: Props) {
  return (
    <h2 className={cn('font-display text-2xl font-semibold', className)}>
      {children}
    </h2>
  )
}
