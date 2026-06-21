import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  feedback: string
  onFeedbackChange: (value: string) => void
  onConfirm: () => void
}

export function RejectDialog({ open, onOpenChange, feedback, onFeedbackChange, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rejeitar candidatura</DialogTitle>
        </DialogHeader>
        <textarea
          className="w-full border rounded p-2 mt-2"
          placeholder="Escreva um feedback para o aluno..."
          value={feedback}
          onChange={e => onFeedbackChange(e.target.value)}
        />
        <button onClick={onConfirm} className="mt-3 bg-red-500 text-white px-4 py-2 rounded w-full">
          Confirmar rejeição
        </button>
      </DialogContent>
    </Dialog>
  )
}
