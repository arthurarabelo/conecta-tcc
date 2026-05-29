// frontend/src/components/shared/SiteHeader/NavLink.tsx
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

interface NavLinkProps {
  to: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function NavLink({ to, children, className, onClick }: NavLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
        className,
      )}
      activeProps={{ className: 'text-foreground' }}
    >
      {children}
    </Link>
  )
}