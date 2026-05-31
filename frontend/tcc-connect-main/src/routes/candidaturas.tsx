import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, XCircle, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { applications, proposals } from "@/lib/mock-data";

export const Route = createFileRoute("/candidaturas")({
  head: () => ({ meta: [{ title: "Minhas Candidaturas — Conecta TCC" }] }),
  component: Candidaturas,
});

const statusConfig = {
  pending: { icon: Clock, label: "Pendente", color: "text-warning", bg: "bg-warning/15", border: "border-warning/30" },
  approved: { icon: CheckCircle2, label: "Aprovada", color: "text-success", bg: "bg-success/15", border: "border-success/30" },
  rejected: { icon: XCircle, label: "Recusada", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
};

function Candidaturas() {
  // Simulate "current student" view
  const myApps = applications.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Aluno · Ana Beatriz</div>
          <h1 className="mt-2 font-display text-5xl font-semibold">Minhas Candidaturas</h1>
          <p className="mt-3 text-muted-foreground">Acompanhe o status das suas inscrições em tempo real.</p>

          <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg">
            {(["pending", "approved", "rejected"] as const).map((s) => {
              const c = statusConfig[s];
              const count = myApps.filter((a) => a.status === s).length;
              return (
                <div key={s} className={`rounded-xl border ${c.border} ${c.bg} px-4 py-3`}>
                  <c.icon className={`h-4 w-4 ${c.color}`} />
                  <div className="mt-2 font-display text-2xl font-semibold">{count}</div>
                  <div className="text-xs text-muted-foreground">{c.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="space-y-4">
          {myApps.map((app) => {
            const proposal = proposals.find((p) => p.id === app.proposalId)!;
            const c = statusConfig[app.status];
            return (
              <div
                key={app.id}
                className="group flex flex-col md:flex-row md:items-center gap-6 rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-soft"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="uppercase tracking-wider">{proposal.area}</span>
                    <span>·</span>
                    <span>{proposal.professor.name}</span>
                  </div>
                  <h3 className="mt-1.5 font-display text-xl font-semibold">{proposal.title}</h3>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Aplicado em {new Date(app.appliedAt).toLocaleDateString("pt-BR")}
                  </div>
                  {app.feedback && (
                    <div className={`mt-3 rounded-md border ${c.border} ${c.bg} px-3 py-2 text-sm`}>
                      <span className={`font-semibold ${c.color}`}>Feedback: </span>
                      {app.feedback}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border ${c.border} ${c.bg} px-3 py-1.5 text-xs font-semibold ${c.color}`}>
                    <c.icon className="h-3.5 w-3.5" />
                    {c.label}
                  </span>
                  <Link
                    to="/propostas/$id"
                    params={{ id: String(proposal.id) }}
                    className="inline-flex items-center gap-1 text-sm font-medium hover:text-accent"
                  >
                    Ver <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
