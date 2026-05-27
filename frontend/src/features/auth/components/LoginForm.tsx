import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas'
import { useLogin } from '@/features/auth/hooks'
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

export function LoginForm() {
  const { mutate, isPending, isError, error } = useLogin()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  function onSubmit(values: LoginFormValues) {
    mutate(values)
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

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                E-mail
              </FormLabel>
              <FormControl>
                <input
                  type="email"
                  placeholder="seu.nome@ufmg.br"
                  autoComplete="email"
                  className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Senha
              </FormLabel>
              <FormControl>
                <input
                  type="password"
                  autoComplete="current-password"
                  className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
            'Entrando...'
          ) : (
            <>
              Entrar
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </Form>
  )
}
