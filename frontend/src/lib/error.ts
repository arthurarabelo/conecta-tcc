import axios from 'axios'
import type { ApiValidationError } from '@/types/api'

export class AppError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AppError'
    this.status = status
  }
}

export class ValidationError extends AppError {
  readonly errors: Record<string, string[]>

  constructor(data: ApiValidationError) {
    super(data.message, 422)
    this.name = 'ValidationError'
    this.errors = data.errors
  }

  firstError(field: string): string | undefined {
    return this.errors[field]?.[0]
  }
}

export class AuthError extends AppError {
  constructor(message = 'Não autenticado') {
    super(message, 401)
    this.name = 'AuthError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado') {
    super(message, 403)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

export function parseAxiosError(error: unknown): AppError {
  if (!axios.isAxiosError(error)) {
    return new AppError('Erro inesperado', 500)
  }

  const status = error.response?.status ?? 500
  const data = error.response?.data

  if (status === 422 && data?.errors) {
    return new ValidationError(data as ApiValidationError)
  }
  if (status === 401) {
    return new AuthError(data?.message)
  }
  if (status === 403) {
    return new ForbiddenError(data?.message)
  }
  if (status === 404) {
    return new NotFoundError(data?.message)
  }

  return new AppError(data?.message ?? 'Erro no servidor', status)
}
