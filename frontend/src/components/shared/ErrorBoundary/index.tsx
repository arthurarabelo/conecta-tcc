import { type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

function DefaultFallback({ error }: FallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle>Algo deu errado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {(error as Error)?.message ?? 'Ocorreu um erro inesperado. Tente recarregar a página.'}
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={() => window.location.reload()}>Recarregar página</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export function ErrorBoundary({ children, fallback }: Props) {
  const handleError = (error: unknown, info: ErrorInfo) => {
    console.error('[ErrorBoundary] Caught error:', error, info)
  }

  if (fallback) {
    return (
      <ReactErrorBoundary fallbackRender={() => <>{fallback}</>} onError={handleError}>
        {children}
      </ReactErrorBoundary>
    )
  }

  return (
    <ReactErrorBoundary FallbackComponent={DefaultFallback} onError={handleError}>
      {children}
    </ReactErrorBoundary>
  )
}
