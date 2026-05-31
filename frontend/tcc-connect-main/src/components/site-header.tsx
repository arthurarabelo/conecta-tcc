import { Link, useRouterState } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

const navItems = [
  { to: "/", label: "Início" },
  { to: "/propostas", label: "Mural de Ideias" },
  { to: "/candidaturas", label: "Minhas Candidaturas" },
  { to: "/dashboard", label: "Dashboard" },
];

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:rotate-6">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold tracking-tight">Conecta TCC</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Portal Acadêmico</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  active
                    ? "text-foreground bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          to="/login"
          className="inline-flex items-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Entrar
        </Link>
      </div>
    </header>
  );
}
