import { useProposals } from "@/features/proposals/hooks";
import { useApplications, useApproveApplication, useRejectApplication } from "@/features/applications/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner"; // ou o toast que o projeto usa

export default function Dashboard() {
  const { data: proposals, isLoading: loadingProposals } = useProposals();
  const { data: pendingApplications, isLoading: loadingApps } = useApplications({ status: "pending" });
  const { mutate: approve } = useApproveApplication();
  const { mutate: reject } = useRejectApplication();

  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [feedback, setFeedback] = useState("");

  // KPIs calculados a partir das proposals
  const activeProposals = proposals?.filter(p => p.status === "open").length ?? 0;
  const totalSlots = proposals?.reduce((acc, p) => acc + p.max_slots, 0) ?? 0;
  const filledSlots = proposals?.reduce((acc, p) => acc + (p.approved_count ?? 0), 0) ?? 0;
  const pendingCount = pendingApplications?.length ?? 0;

  const handleApprove = (id: number) => {
    approve(id, {
      onSuccess: () => toast.success("Candidatura aprovada!"),
    });
  };

  const handleReject = () => {
    if (!feedback.trim()) {
      toast.error("Digite um feedback antes de rejeitar.");
      return;
    }
    reject({ id: rejectDialog.id!, payload: { feedback } }, {
      onSuccess: () => {
        toast.success("Candidatura rejeitada.");
        setRejectDialog({ open: false, id: null });
        setFeedback("");
      },
    });
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <a href="/propostas/nova">
          <button className="bg-primary text-white px-4 py-2 rounded">+ Nova proposta</button>
        </a>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {loadingProposals ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded" />)
        ) : (
          <>
            <KPICard label="Propostas ativas" value={activeProposals} />
            <KPICard label="Vagas totais" value={totalSlots} />
            <KPICard label="Vagas preenchidas" value={filledSlots} />
            <KPICard label="Candidatos pendentes" value={pendingCount} />
          </>
        )}
      </div>

      {/* Tabela de Propostas */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Minhas Propostas</h2>
        {loadingProposals ? <Skeleton className="h-40 w-full" /> : (
          <table className="w-full border text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-2 text-left">Título</th>
                <th className="p-2">Área</th>
                <th className="p-2">Vagas</th>
                <th className="p-2">Candidatos</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {proposals?.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">
                    <a href={`/propostas/${p.id}/editar`} className="underline text-primary">{p.title}</a>
                  </td>
                  <td className="p-2 text-center">{p.area?.name}</td>
                  <td className="p-2 text-center">{p.approved_count}/{p.max_slots}</td>
                  <td className="p-2 text-center">{p.applications_count}</td>
                  <td className="p-2 text-center">{p.status === "open" ? "Aberta" : "Fechada"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Candidaturas pendentes */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Candidaturas para revisar</h2>
        {loadingApps ? <Skeleton className="h-40 w-full" /> : (
          pendingApplications?.map(app => (
            <div key={app.id} className="border rounded p-4 mb-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{app.student.name}</p>
                <p className="text-sm text-muted-foreground">
                  {app.student.email}
                  {app.student.portfolio && (
                    <a href={app.student.portfolio} target="_blank" className="ml-2 underline">Portfólio ↗</a>
                  )}
                </p>
                <p className="text-sm">Proposta: {app.proposal.title}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleApprove(app.id)} className="bg-green-600 text-white px-3 py-1 rounded">Aprovar</button>
                <button onClick={() => setRejectDialog({ open: true, id: app.id })} className="bg-red-500 text-white px-3 py-1 rounded">Rejeitar</button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Dialog de rejeição */}
      <Dialog open={rejectDialog.open} onOpenChange={open => setRejectDialog({ open, id: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar candidatura</DialogTitle>
          </DialogHeader>
          <textarea
            className="w-full border rounded p-2 mt-2"
            placeholder="Escreva um feedback para o aluno..."
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
          />
          <button onClick={handleReject} className="mt-3 bg-red-500 text-white px-4 py-2 rounded w-full">
            Confirmar rejeição
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KPICard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded p-4 text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}