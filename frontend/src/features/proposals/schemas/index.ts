import { z } from 'zod'

export const proposalSchema = z.object({
  title: z.string().min(5, 'Título deve ter ao menos 5 caracteres').max(255),
  description: z.string().min(20, 'Descrição deve ter ao menos 20 caracteres'),
  prerequisites: z.string().optional(),
  max_slots: z.coerce
    .number({ message: 'Vagas obrigatórias' })
    .int()
    .min(1, 'Deve haver ao menos 1 vaga'),
  department_id: z.coerce.number({ message: 'Departamento obrigatório' }).positive(),
  area_id: z.coerce.number({ message: 'Área obrigatória' }).positive(),
})

export type ProposalFormValues = z.infer<typeof proposalSchema>
