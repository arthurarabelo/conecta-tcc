import { http, HttpResponse } from 'msw'

const BASE_URL = 'http://localhost:8000'

export const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@ufmg.br',
  role: 'student' as const,
  department_id: 1,
  profile_link: null,
}

export const mockToken = 'test-bearer-token-abc123'

export const authHandlers = [
  http.post(`${BASE_URL}/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string }

    if (body.email === 'test@ufmg.br' && body.password === 'password123') {
      return HttpResponse.json({ user: mockUser, token: mockToken }, { status: 200 })
    }

    return HttpResponse.json(
      { message: 'Credenciais inválidas.' },
      { status: 401 },
    )
  }),

  http.post(`${BASE_URL}/register`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>

    if (!body.email || !body.password) {
      return HttpResponse.json(
        {
          message: 'Os dados fornecidos são inválidos.',
          errors: {
            email: ['O campo e-mail é obrigatório.'],
            password: ['O campo senha é obrigatório.'],
          },
        },
        { status: 422 },
      )
    }

    const newUser = {
      id: 2,
      name: body.name as string,
      email: body.email as string,
      role: body.role as 'professor' | 'student',
      department_id: body.department_id as number,
      profile_link: (body.profile_link as string) || null,
    }

    return HttpResponse.json({ user: newUser, token: mockToken }, { status: 201 })
  }),

  http.post(`${BASE_URL}/logout`, () => {
    return new HttpResponse(null, { status: 200 })
  }),

  http.get(`${BASE_URL}/me`, ({ request }) => {
    const auth = request.headers.get('Authorization')

    if (!auth || !auth.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }

    return HttpResponse.json({ data: mockUser }, { status: 200 })
  }),
]
