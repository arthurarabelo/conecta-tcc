import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'

interface AuthButtonsProps {
  variant: 'desktop' | 'mobile'
  onNavigate?: () => void
}

export function AuthButtons({ variant, onNavigate }: AuthButtonsProps) {
  const isMobile = variant === 'mobile'

  return (
    <Button asChild size="sm" className={isMobile ? 'w-full' : undefined}>
      <Link to={ROUTES.login} onClick={onNavigate}>
        Entrar
      </Link>
    </Button>
  )
}
