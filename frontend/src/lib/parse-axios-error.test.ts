import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import {
  parseAxiosError,
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  AppError,
} from '@/lib/error'

vi.mock('axios')

// Helper to create a mock Axios error
function makeAxiosError(status: number, data: unknown) {
  const err = new Error('Request failed') as Error & {
    isAxiosError: boolean
    response: { status: number; data: unknown }
  }
  err.isAxiosError = true
  err.response = { status, data }
  return err
}

describe('parseAxiosError', () => {
  beforeEach(() => {
    vi.mocked(axios.isAxiosError).mockImplementation(
      (err): err is ReturnType<typeof makeAxiosError> =>
        (err as { isAxiosError?: boolean }).isAxiosError === true,
    )
  })

  it('returns AppError with status 500 for non-Axios errors', () => {
    vi.mocked(axios.isAxiosError).mockReturnValue(false)
    const result = parseAxiosError(new Error('generic'))
    expect(result).toBeInstanceOf(AppError)
    expect(result.status).toBe(500)
    expect(result.message).toBe('Erro inesperado')
  })

  it('returns ValidationError for 422 with errors object', () => {
    const axiosErr = makeAxiosError(422, {
      message: 'Os dados fornecidos são inválidos.',
      errors: { email: ['E-mail já utilizado.'] },
    })
    const result = parseAxiosError(axiosErr)
    expect(result).toBeInstanceOf(ValidationError)
    expect(result.status).toBe(422)
    const validationErr = result as ValidationError
    expect(validationErr.firstError('email')).toBe('E-mail já utilizado.')
  })

  it('returns AuthError for 401', () => {
    const axiosErr = makeAxiosError(401, { message: 'Unauthenticated.' })
    const result = parseAxiosError(axiosErr)
    expect(result).toBeInstanceOf(AuthError)
    expect(result.status).toBe(401)
    expect(result.message).toBe('Unauthenticated.')
  })

  it('returns AuthError with default message when 401 has no message', () => {
    const axiosErr = makeAxiosError(401, {})
    const result = parseAxiosError(axiosErr)
    expect(result).toBeInstanceOf(AuthError)
    expect(result.message).toBe('Não autenticado')
  })

  it('returns ForbiddenError for 403', () => {
    const axiosErr = makeAxiosError(403, { message: 'Esta ação não é autorizada.' })
    const result = parseAxiosError(axiosErr)
    expect(result).toBeInstanceOf(ForbiddenError)
    expect(result.status).toBe(403)
    expect(result.message).toBe('Esta ação não é autorizada.')
  })

  it('returns ForbiddenError with default message when 403 has no message', () => {
    const axiosErr = makeAxiosError(403, {})
    const result = parseAxiosError(axiosErr)
    expect(result).toBeInstanceOf(ForbiddenError)
    expect(result.message).toBe('Acesso negado')
  })

  it('returns NotFoundError for 404', () => {
    const axiosErr = makeAxiosError(404, { message: 'Proposta não encontrada.' })
    const result = parseAxiosError(axiosErr)
    expect(result).toBeInstanceOf(NotFoundError)
    expect(result.status).toBe(404)
    expect(result.message).toBe('Proposta não encontrada.')
  })

  it('returns NotFoundError with default message when 404 has no message', () => {
    const axiosErr = makeAxiosError(404, {})
    const result = parseAxiosError(axiosErr)
    expect(result).toBeInstanceOf(NotFoundError)
    expect(result.message).toBe('Recurso não encontrado')
  })

  it('returns generic AppError for 500', () => {
    const axiosErr = makeAxiosError(500, { message: 'Internal Server Error' })
    const result = parseAxiosError(axiosErr)
    expect(result).toBeInstanceOf(AppError)
    expect(result).not.toBeInstanceOf(ValidationError)
    expect(result).not.toBeInstanceOf(AuthError)
    expect(result.status).toBe(500)
    expect(result.message).toBe('Internal Server Error')
  })

  it('returns generic AppError with fallback message when 500 has no message', () => {
    const axiosErr = makeAxiosError(500, {})
    const result = parseAxiosError(axiosErr)
    expect(result.message).toBe('Erro no servidor')
  })

  it('does NOT return ValidationError for 422 when errors field is missing', () => {
    // Edge case: 422 but malformed response without errors object
    const axiosErr = makeAxiosError(422, { message: 'Unprocessable' })
    const result = parseAxiosError(axiosErr)
    // Without errors field it falls through to generic AppError
    expect(result).not.toBeInstanceOf(ValidationError)
    expect(result.status).toBe(422)
  })
})