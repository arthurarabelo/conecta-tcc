import { Link } from "@tanstack/react-router";
import { Users, BookOpen, Clock, CheckCircle2 } from "lucide-react";
import type { Proposal } from "@/lib/mock-data";

const statusStyles: Record<string, string> = {
  open: "bg-success/15 text-success border-success/30",
  closed: "bg-muted text-muted-foreground border-border",
};

export function ProposalCard({ proposal }: { proposal: Proposal }) {
  const remaining = proposal.maxSlots - proposal.filledSlots;
  return (
    <Link
      to="/propostas/$id"
      params={{ id: String(proposal.id) }}
      className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-all hover:border-foreground/30 hover:shadow-elegant"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <BookOpen className="h-3 w-3" />
          {proposal.area}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${statusStyles[proposal.status]}`}
        >
          {proposal.status === "open" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          {proposal.status === "open" ? "Aberta" : "Fechada"}
        </span>
      </div>

      <h3 className="font-display text-xl font-semibold leading-snug text-balance group-hover:text-primary transition-colors">
        {proposal.title}
      </h3>

      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
        {proposal.description}
      </p>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {proposal.prerequisites.slice(0, 3).map((p) => (
          <span key={p} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-foreground/80">
            {p}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-accent text-xs font-bold text-accent-foreground">
            {proposal.professor.avatar}
          </div>
          <div className="leading-tight">
            <div className="text-xs font-medium">{proposal.professor.name}</div>
            <div className="text-[10px] text-muted-foreground">{proposal.department}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className={remaining > 0 ? "text-foreground" : "text-muted-foreground"}>
            {remaining}/{proposal.maxSlots} vagas
          </span>
        </div>
      </div>
    </Link>
  );
}
