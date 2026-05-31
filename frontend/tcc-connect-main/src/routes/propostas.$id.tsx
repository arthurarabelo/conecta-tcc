import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Users, Calendar, BookOpen, CheckCircle2, Send } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { proposals } from "@/lib/mock-data";

export const Route = createFileRoute("/propostas/$id")({
  component: ProposalDetail,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <p>Proposta não encontrada.</p>
    </div>
  ),
});

function ProposalDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const proposal = proposals.find((p) => p.id === Number(id));
  const [applied, setApplied] = useState(false);

  if (!proposal) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="font-display text-3xl">Proposta não encontrada</h1>
          <button
            onClick={() => navigate({ to: "/propostas" })}
            className="mt-6 inline-flex items-center gap-2 text-sm text-accent"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao mural
          </button>
        </div>
      </div>
    );
  }

  const remaining = proposal.maxSlots - proposal.filledSlots;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <article className="mx-auto max-w-4xl px-6 py-12">
        <Link
          to="/propostas"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Mural de Ideias
        </Link>

        <header className="mt-8 border-b border-border pb-10">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-wider">
              <BookOpen className="h-3 w-3" /> {proposal.area}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-wider">
              {proposal.department}
            </span>
            {proposal.status === "open" ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-success">
                <CheckCircle2 className="h-3 w-3" /> Aberta
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Fechada
              </span>
            )}
          </div>

          <h1 className="mt-6 font-display text-4xl md:text-5xl font-semibold leading-tight text-balance">
            {proposal.title}
          </h1>

          <div className="mt-8 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-accent text-sm font-bold text-accent-foreground">
                {proposal.professor.avatar}
              </div>
              <div>
                <div className="text-sm font-semibold">{proposal.professor.name}</div>
                <div className="text-xs text-muted-foreground">{proposal.professor.lattes}</div>
              </div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{remaining}/{proposal.maxSlots}</span>
              <span className="text-muted-foreground">vagas restantes</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(proposal.createdAt).toLocaleDateString("pt-BR")}
            </div>
          </div>
        </header>

        <section className="mt-10 grid gap-10 md:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="font-display text-2xl font-semibold">Sobre o projeto</h2>
            <p className="mt-4 text-base leading-relaxed text-foreground/85">
              {proposal.description}
            </p>

            <h2 className="mt-12 font-display text-2xl font-semibold">Pré-requisitos</h2>
            <ul className="mt-4 space-y-2">
              {proposal.prerequisites.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent flex-none" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <aside className="md:sticky md:top-24 h-fit rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Candidatura</div>
            <div className="mt-2 font-display text-2xl font-semibold">
              {proposal.status === "open" && remaining > 0 ? "Inscrições abertas" : "Vagas preenchidas"}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Ao candidatar-se, o orientador receberá seu perfil e portfólio para análise.
            </p>

            {applied ? (
              <div className="mt-6 rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
                <CheckCircle2 className="inline h-4 w-4 mr-1.5" />
                Candidatura enviada! Acompanhe em <Link to="/candidaturas" className="underline">Minhas Candidaturas</Link>.
              </div>
            ) : (
              <button
                onClick={() => setApplied(true)}
                disabled={proposal.status !== "open" || remaining === 0}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                Candidatar-me
              </button>
            )}

            <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
              <div className="flex justify-between py-1">
                <span>Vagas totais</span>
                <span className="font-medium text-foreground">{proposal.maxSlots}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Preenchidas</span>
                <span className="font-medium text-foreground">{proposal.filledSlots}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Departamento</span>
                <span className="font-medium text-foreground">{proposal.department}</span>
              </div>
            </div>
          </aside>
        </section>
      </article>
    </div>
  );
}
