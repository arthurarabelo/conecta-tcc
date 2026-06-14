import { http, HttpResponse } from 'msw'

export const BASE_URL = 'http://localhost:8000/api'

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

export const mockProfessor = {
  id: 2,
  name: 'Prof. Silva',
  email: 'professor@ufmg.br',
  role: 'professor' as const,
  department_id: 1,
  profile_link: null,
}

export const mockProposal = {
  id: 1,
  professor_id: 2,
  title: 'ML em Biomedicina',
  description: 'Pesquisa em IA aplicada à saúde',
  prerequisites: null,
  max_slots: 2,
  department_id: 1,
  area_id: 1,
  status: 'open' as const,
}

export const mockApplication = {
  id: 1,
  student_id: 1,
  proposal_id: 1,
  status: 'pending' as const,
  feedback: null,
  applied_at: '2026-05-01T00:00:00Z',
  reviewed_at: null,
  student: mockUser,
  proposal: mockProposal,
}

export const applicationHandlers = [
  // Lista candidaturas (comportamento varia por role, mas o backend já filtra)
  http.get(`${BASE_URL}/applications`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }
    return HttpResponse.json({
      data: [mockApplication],
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
    }, { status: 200 })
  }),

  // Detalhe de candidatura
  http.get(`${BASE_URL}/applications/:id`, ({ request, params }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }
    if (Number(params.id) !== mockApplication.id) {
      return HttpResponse.json({ message: 'Não encontrado.' }, { status: 404 })
    }
    return HttpResponse.json({ data: mockApplication }, { status: 200 })
  }),

  // Aprovar candidatura (apenas professor dono da proposta)
  http.patch(`${BASE_URL}/applications/:id/approve`, ({ request, params }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }
    // Simula 403 para token de aluno
    if (auth === 'Bearer student-token') {
      return HttpResponse.json({ message: 'Ação não permitida.' }, { status: 403 })
    }
    return HttpResponse.json({
      data: { ...mockApplication, id: Number(params.id), status: 'approved', reviewed_at: '2026-05-10T00:00:00Z' },
    }, { status: 200 })
  }),

  // Rejeitar candidatura
  http.patch(`${BASE_URL}/applications/:id/reject`, async ({ request, params }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }
    if (auth === 'Bearer student-token') {
      return HttpResponse.json({ message: 'Ação não permitida.' }, { status: 403 })
    }
    const body = await request.json() as { feedback?: string }
    return HttpResponse.json({
      data: {
        ...mockApplication,
        id: Number(params.id),
        status: 'rejected',
        feedback: body?.feedback ?? null,
        reviewed_at: '2026-05-10T00:00:00Z',
      },
    }, { status: 200 })
  }),
]