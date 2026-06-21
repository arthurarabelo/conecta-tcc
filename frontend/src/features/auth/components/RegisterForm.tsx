import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas'
import { useRegister } from '@/features/auth/hooks'
import { useDepartments } from '@/features/proposals/hooks'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowRight, AlertCircle } from 'lucide-react'

const inputClass = 'mt-1 w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
const labelClass = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground'

interface RegisterFormProps {
  initialRole?: 'professor' | 'student'
}

export function RegisterForm({ initialRole }: RegisterFormProps) {
  const { mutate, isPending, isError, error } = useRegister()
  const { data: departments = [] } = useDepartments()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: initialRole ?? 'student',
      department_id: 0,
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
          {(['student', 'professor'] as const).map((r) => (
            <button
              key={r}
              type="button"
              aria-label={r === 'student' ? 'Aluno' : 'Professor'}
              onClick={() => form.setValue('role', r)}
              className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                selectedRole === r ? 'bg-card shadow-soft' : 'text-muted-foreground'
              }`}
            >
              {r === 'student' ? 'Aluno' : 'Professor'}
            </button>
          ))}
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>Nome completo</FormLabel>
              <FormControl>
                <input
                  placeholder="Seu nome completo"
                  autoComplete="name"
                  className={inputClass}
                  {...field}
                />
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
              <FormLabel className={labelClass}>E-mail</FormLabel>
              <FormControl>
                <input
                  type="email"
                  placeholder="seu.nome@ufmg.br"
                  autoComplete="email"
                  className={inputClass}
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
              <FormLabel className={labelClass}>Senha</FormLabel>
              <FormControl>
                <input
                  type="password"
                  autoComplete="new-password"
                  className={inputClass}
                  {...field}
                />
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
              <FormLabel className={labelClass}>Confirmar senha</FormLabel>
              <FormControl>
                <input
                  type="password"
                  autoComplete="new-password"
                  className={inputClass}
                  {...field}
                />
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
              <FormLabel className={labelClass}>Departamento</FormLabel>
              <FormControl>
                <select
                  className={inputClass}
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                >
                  <option value={0} disabled>Selecione um departamento</option>
                  {departments.map((dept) => (
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
              <FormLabel className={labelClass}>Link do perfil (opcional)</FormLabel>
              <FormControl>
                <input
                  type="url"
                  placeholder="https://lattes.cnpq.br/..."
                  className={inputClass}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <button
          type="submit"
          disabled={isPending}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-3 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none transition-opacity"
        >
          {isPending ? (
            'Cadastrando...'
          ) : (
            <>
              Criar conta
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </Form>
  )
}
