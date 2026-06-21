import { CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending: boolean
}

export function ApproveDialog({ open, onOpenChange, onConfirm, isPending }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aprovar candidatura</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja aprovar esta candidatura? O aluno será notificado da decisão.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary/60 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isPending ? 'Aprovando…' : 'Confirmar aprovação'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
