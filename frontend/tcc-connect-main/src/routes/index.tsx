import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Users, Target, MessagesSquare } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ProposalCard } from "@/components/proposal-card";
import { proposals } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Conecta TCC — O encontro entre ideias e pesquisadores" },
      {
        name: "description",
        content:
          "Plataforma acadêmica que conecta professores e alunos para a alocação transparente de Trabalhos de Conclusão de Curso.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = proposals.filter((p) => p.status === "open").slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              <Sparkles className="h-3 w-3" />
              Edição 2026/2 — Inscrições abertas
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl font-semibold leading-[1.05] text-white text-balance">
              Onde <em className="text-accent not-italic">ideias</em> encontram
              <br /> pesquisadores.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
              O Portal Conecta TCC centraliza propostas de orientação e candidaturas — acabe com
              o boca a boca e descubra projetos alinhados ao seu perfil técnico.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/propostas"
                className="group inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
              >
                Explorar mural de ideias
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
              >
                Sou professor
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-8 max-w-xl">
              {[
                { v: "120+", l: "Propostas ativas" },
                { v: "47", l: "Professores" },
                { v: "98%", l: "Match em 14 dias" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-3xl font-semibold text-white">{s.v}</div>
                  <div className="text-xs uppercase tracking-wider text-white/60">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Como funciona</div>
            <h2 className="mt-2 font-display text-4xl font-semibold text-balance max-w-xl">
              Três passos para um TCC bem orientado.
            </h2>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Target,
              n: "01",
              t: "Professores publicam",
              d: "Cadastre ideias com escopo, pré-requisitos e número de vagas. Defina o ritmo da sua linha de pesquisa.",
            },
            {
              icon: Users,
              n: "02",
              t: "Alunos se candidatam",
              d: "Filtre por área, departamento ou orientador. Aplique para as propostas que combinam com seu perfil.",
            },
            {
              icon: MessagesSquare,
              n: "03",
              t: "Match formalizado",
              d: "Aprove os melhores candidatos com feedback. Vagas são gerenciadas automaticamente pelo sistema.",
            },
          ].map((step) => (
            <div
              key={step.n}
              className="relative rounded-2xl border border-border bg-card p-8 transition-shadow hover:shadow-soft"
            >
              <div className="absolute -top-3 right-6 rounded-full bg-foreground px-3 py-1 text-[11px] font-mono font-semibold text-background">
                {step.n}
              </div>
              <step.icon className="h-7 w-7 text-accent" strokeWidth={1.5} />
              <h3 className="mt-5 font-display text-xl font-semibold">{step.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured proposals */}
      <section className="border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Destaques</div>
              <h2 className="mt-2 font-display text-4xl font-semibold text-balance max-w-xl">
                Propostas em destaque desta semana.
              </h2>
            </div>
            <Link
              to="/propostas"
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-accent transition-colors"
            >
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProposalCard key={p.id} proposal={p} />
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-7xl px-6 text-xs text-muted-foreground flex flex-wrap justify-between gap-4">
          <div>© 2026 Portal Conecta TCC — Trabalho Prático de Testes de Software</div>
          <div>Arthur Rabelo · Clara Tavares · Davi Araujo · Thiago Magalhães</div>
        </div>
      </footer>
    </div>
  );
}
