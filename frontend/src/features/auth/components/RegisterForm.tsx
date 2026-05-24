import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas'
import { useRegister } from '@/features/auth/hooks'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowRight, AlertCircle } from 'lucide-react'

const DEPARTMENTS = [
  { id: 1, name: 'Ciência da Computação' },
  { id: 2, name: 'Engenharia de Software' },
  { id: 3, name: 'Sistemas de Informação' },
  { id: 4, name: 'Engenharia Elétrica' },
  { id: 5, name: 'Matemática' },
] as const

export function RegisterForm() {
  const { mutate, isPending, isError, error } = useRegister()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'student',
      department_id: 1,
      profile_link: '',
    },
  })

  const selectedRole = form.watch('role')

  function onSubmit(values: RegisterFormValues) {
    mutate({
      ...values,
      profile_link: values.profile_link || undefined,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {isError && error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-secondary">
          <button
            type="button"
            aria-label="Aluno"
            onClick={() => form.setValue('role', 'student')}
            className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
              selectedRole === 'student' ? 'bg-card shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Aluno
          </button>
          <button
            type="button"
            aria-label="Professor"
            onClick={() => form.setValue('role', 'professor')}
            className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
              selectedRole === 'professor' ? 'bg-card shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Professor
          </button>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome completo" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="seu.nome@ufmg.br"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password_confirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar senha</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
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
              <FormControl>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="profile_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link do perfil (opcional)</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://lattes.cnpq.br/..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            'Cadastrando...'
          ) : (
            <>
              Criar conta
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
