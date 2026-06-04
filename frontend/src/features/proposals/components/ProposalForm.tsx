import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { proposalSchema, type ProposalFormValues } from '@/features/proposals/schemas'
import { useCreateProposal, useUpdateProposal, useDeleteProposal, useDepartments, useKnowledgeAreas } from '@/features/proposals/hooks'
import type { Proposal } from '@/types/models'

interface ProposalFormProps {
  mode: 'create' | 'edit'
  proposal?: Proposal
  onSuccess: (proposal?: Proposal) => void
  onDeleted?: () => void
}

export function ProposalForm({ mode, proposal, onSuccess, onDeleted }: ProposalFormProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { data: departments = [] } = useDepartments()
  const { data: areas = [] } = useKnowledgeAreas()

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: proposal?.title ?? '',
      description: proposal?.description ?? '',
      prerequisites: proposal?.prerequisites ?? '',
      max_slots: proposal?.max_slots ?? 1,
      department_id: proposal?.department_id ?? 0,
      area_id: proposal?.area_id ?? 0,
    },
  })

  const createMutation = useCreateProposal()
  const updateMutation = useUpdateProposal(proposal?.id ?? 0)
  const deleteMutation = useDeleteProposal()

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  function onSubmit(values: ProposalFormValues) {
    if (mode === 'create') {
      createMutation.mutate(values, { onSuccess: (created) => onSuccess(created) })
    } else {
      updateMutation.mutate(values, { onSuccess: (updated) => onSuccess(updated) })
    }
  }

  function handleDelete() {
    if (!proposal) return
    deleteMutation.mutate(proposal.id, {
      onSuccess() {
        setDeleteDialogOpen(false)
        onDeleted?.()
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ex: IA aplicada ao diagnóstico médico" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Descreva o projeto, objetivos e metodologia" rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prerequisites"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pré-requisitos</FormLabel>
              <FormControl>
                <Textarea placeholder="Ex: Cálculo, Álgebra Linear (opcional)" rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="max_slots"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de vagas</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="department_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departamento</FormLabel>
              <Select
                value={field.value > 0 ? field.value.toString() : ''}
                onValueChange={(val) => field.onChange(Number(val))}
              >
                <FormControl>
                  <SelectTrigger aria-label="Departamento">
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="area_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área do conhecimento</FormLabel>
              <Select
                value={field.value > 0 ? field.value.toString() : ''}
                onValueChange={(val) => field.onChange(Number(val))}
              >
                <FormControl>
                  <SelectTrigger aria-label="Área">
                    <SelectValue placeholder="Selecione a área" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {areas.map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between gap-4">
          <Button type="submit" disabled={isPending}>
            {mode === 'create'
              ? isPending ? 'Criando...' : 'Criar proposta'
              : isPending ? 'Salvando...' : 'Salvar alterações'}
          </Button>

          {mode === 'edit' && (
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="destructive">
                  Excluir proposta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Excluir proposta</DialogTitle>
                  <DialogDescription>
                    Esta ação não pode ser desfeita. A proposta será removida permanentemente.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleteMutation.isPending}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                    {deleteMutation.isPending ? 'Excluindo...' : 'Confirmar exclusão'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </form>
    </Form>
  )
}
