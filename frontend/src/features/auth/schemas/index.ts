import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
    password_confirmation: z.string(),
    role: z.enum(['professor', 'student'], { message: 'Papel obrigatório' }),
    department_id: z.coerce.number({ message: 'Departamento obrigatório' }).positive(),
    profile_link: z.string().url('URL inválida').optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'As senhas não coincidem',
    path: ['password_confirmation'],
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
