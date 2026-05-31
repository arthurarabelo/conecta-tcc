import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ProposalCard } from "@/components/proposal-card";
import { proposals, knowledgeAreas, departments } from "@/lib/mock-data";

export const Route = createFileRoute("/propostas/")({
  head: () => ({
    meta: [
      { title: "Mural de Ideias — Conecta TCC" },
      { name: "description", content: "Explore propostas de TCC ofertadas pelos professores e candidate-se." },
    ],
  }),
  component: Mural,
});

function Mural() {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("Todas");
  const [dept, setDept] = useState("Todos");
  const [onlyOpen, setOnlyOpen] = useState(true);

  const filtered = useMemo(() => {
    return proposals.filter((p) => {
      if (onlyOpen && p.status !== "open") return false;
      if (area !== "Todas" && p.area !== area) return false;
      if (dept !== "Todos" && p.department !== dept) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.professor.name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [query, area, dept, onlyOpen]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Mural de Ideias</div>
          <h1 className="mt-2 font-display text-5xl font-semibold text-balance max-w-2xl">
            Encontre seu próximo projeto de pesquisa.
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            {proposals.filter((p) => p.status === "open").length} propostas abertas, prontas para receber candidaturas.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* Filters */}
        <div className="mb-10 grid gap-4 md:grid-cols-[1fr_auto_auto_auto] items-end">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, descrição ou professor…"
              className="w-full rounded-md border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="rounded-md border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {knowledgeAreas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="rounded-md border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm font-medium px-3 py-2.5 rounded-md border border-border bg-card cursor-pointer">
            <input
              type="checkbox"
              checked={onlyOpen}
              onChange={(e) => setOnlyOpen(e.target.checked)}
              className="accent-accent"
            />
            Somente abertas
          </label>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-20 text-center text-muted-foreground">
            Nenhuma proposta encontrada com esses filtros.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProposalCard key={p.id} proposal={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
