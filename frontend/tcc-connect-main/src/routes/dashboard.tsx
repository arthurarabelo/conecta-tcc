import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Users, BookMarked, CheckCircle2, XCircle, Clock, Mail, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { proposals as initialProposals, applications as initialApps, professors } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard do Professor — Conecta TCC" }] }),
  component: Dashboard,
});

function Dashboard() {
  const me = professors[0]; // simulate logged in professor
  const [apps, setApps] = useState(initialApps);
  const myProposals = initialProposals.filter((p) => p.professor.id === me.id);

  const totalSlots = myProposals.reduce((s, p) => s + p.maxSlots, 0);
  const filled = myProposals.reduce((s, p) => s + p.filledSlots, 0);
  const pendingCount = apps.filter(
    (a) => a.status === "pending" && myProposals.some((p) => p.id === a.proposalId),
  ).length;

  function decide(id: number, status: "approved" | "rejected") {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Professor · {me.department}</div>
            <h1 className="mt-2 font-display text-5xl font-semibold">{me.name}</h1>
            <p className="mt-3 text-muted-foreground">Gerencie suas propostas e candidaturas.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-background hover:opacity-90">
            <Plus className="h-4 w-4" /> Nova proposta
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { icon: BookMarked, label: "Propostas ativas", value: myProposals.filter((p) => p.status === "open").length },
            { icon: Users, label: "Vagas totais", value: totalSlots },
            { icon: CheckCircle2, label: "Orientandos confirmados", value: filled },
            { icon: Clock, label: "Candidaturas pendentes", value: pendingCount },
          ].map((k) => (
            <div key={k.label} className="rounded-2xl border border-border bg-card p-5">
              <k.icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
              <div className="mt-3 font-display text-3xl font-semibold">{k.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{k.label}</div>
            </div>
          ))}
        </div>

        {/* My proposals */}
        <h2 className="mt-14 mb-5 font-display text-2xl font-semibold">Minhas propostas</h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Título</th>
                <th className="text-left px-5 py-3 font-semibold">Área</th>
                <th className="text-left px-5 py-3 font-semibold">Vagas</th>
                <th className="text-left px-5 py-3 font-semibold">Candidaturas</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {myProposals.map((p) => {
                const ca = apps.filter((a) => a.proposalId === p.id).length;
                return (
                  <tr key={p.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-5 py-4 font-medium max-w-md truncate">{p.title}</td>
                    <td className="px-5 py-4 text-muted-foreground">{p.area}</td>
                    <td className="px-5 py-4">{p.filledSlots}/{p.maxSlots}</td>
                    <td className="px-5 py-4">{ca}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold uppercase tracking-wider ${p.status === "open" ? "text-success" : "text-muted-foreground"}`}>
                        {p.status === "open" ? "Aberta" : "Fechada"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pending applications */}
        <h2 className="mt-14 mb-5 font-display text-2xl font-semibold">Candidaturas para revisar</h2>
        <div className="space-y-4">
          {apps
            .filter((a) => myProposals.some((p) => p.id === a.proposalId))
            .map((app) => {
              const proposal = myProposals.find((p) => p.id === app.proposalId)!;
              return (
                <div key={app.id} className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-accent font-bold text-accent-foreground flex-none">
                      {app.studentName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">{app.studentName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Aplicou para <span className="font-medium text-foreground">{proposal.title}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {app.studentEmail}</span>
                        <span className="inline-flex items-center gap-1"><ExternalLink className="h-3 w-3" /> {app.studentPortfolio}</span>
                      </div>
                    </div>

                    {app.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => decide(app.id, "rejected")}
                          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                        >
                          <XCircle className="h-4 w-4" /> Recusar
                        </button>
                        <button
                          onClick={() => decide(app.id, "approved")}
                          className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-sm font-semibold text-background hover:opacity-90"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Aprovar
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                          app.status === "approved"
                            ? "bg-success/15 text-success border border-success/30"
                            : "bg-destructive/10 text-destructive border border-destructive/30"
                        }`}
                      >
                        {app.status === "approved" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {app.status === "approved" ? "Aprovado" : "Recusado"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </section>
    </div>
  );
}
