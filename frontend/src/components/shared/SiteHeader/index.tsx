import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { GraduationCap, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/hooks/use-auth'
import { ROUTES } from '@/constants/routes'
import { NavLink } from './NavLink'
import { UserMenu } from './UserMenu'
import { AuthButtons } from './AuthButtons'

export function SiteHeader() {
  const { isAuthenticated, isStudent, isProfessor } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = (
    <>
      <NavLink to={ROUTES.home} onClick={() => setMobileOpen(false)}>
        Home
      </NavLink>
      <NavLink to={ROUTES.proposals.list} onClick={() => setMobileOpen(false)}>
        Mural
      </NavLink>
      {isStudent && (
        <NavLink to={ROUTES.myApplications} onClick={() => setMobileOpen(false)}>
          Minhas Candidaturas
        </NavLink>
      )}
      {isProfessor && (
        <NavLink to={ROUTES.dashboard} onClick={() => setMobileOpen(false)}>
          Dashboard
        </NavLink>
      )}
    </>
  )

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to={ROUTES.home} className="flex items-center gap-2 font-bold text-foreground">
          <GraduationCap className="h-5 w-5 text-primary" />
          <span>Conecta TCC</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">{navLinks}</nav>

        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? <UserMenu variant="desktop" /> : <AuthButtons variant="desktop" />}
        </div>

        <div className="flex md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 pt-6">
                <nav className="flex flex-col gap-3">{navLinks}</nav>
                <div className="border-t pt-4">
                  {isAuthenticated ? (
                    <UserMenu variant="mobile" />
                  ) : (
                    <AuthButtons variant="mobile" onNavigate={() => setMobileOpen(false)} />
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
