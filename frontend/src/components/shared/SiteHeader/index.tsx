import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { GraduationCap, Menu, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { useLogout } from '@/features/auth/hooks'
import { ROUTES } from '@/constants/routes'
import { getInitials } from '@/lib/utils'
import { NavLink } from './NavLink'

export function SiteHeader() {
  const { user, isAuthenticated, isStudent, isProfessor } = useAuth()
  const logout = useLogout()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    logout.mutate()
  }

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
          {!isAuthenticated ? (
            <Button asChild size="sm">
              <Link to={ROUTES.login}>Entrar</Link>
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">
                      {user ? getInitials(user.name) : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
                  {!isAuthenticated ? (
                    <Button asChild className="w-full" size="sm">
                      <Link to={ROUTES.login} onClick={() => setMobileOpen(false)}>
                        Entrar
                      </Link>
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                        disabled={logout.isPending}
                        className="w-full justify-start text-destructive border-destructive hover:text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                      </Button>
                    </div>
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