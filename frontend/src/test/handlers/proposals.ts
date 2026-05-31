import { http, HttpResponse } from 'msw'

const BASE_URL = 'http://localhost:8000/api'

export const mockProposals = [
  {
    id: 1,
    professor_id: 10,
    title: 'Redes Neurais para Reconhecimento de Imagens',
    description: 'Estudo e implementação de redes neurais convolucionais para reconhecimento de imagens médicas.',
    prerequisites: 'Python, Machine Learning básico',
    max_slots: 2,
    department_id: 1,
    area_id: 1,
    status: 'open' as const,
    professor: { id: 10, name: 'Prof. Silva', email: 'silva@ufmg.br', role: 'professor' as const, department_id: 1, profile_link: null },
    department: { id: 1, name: 'Ciência da Computação', code: 'CC' },
    area: { id: 1, name: 'Inteligência Artificial', code: 'IA' },
    applications_count: 1,
    approved_applications_count: 0,
  },
  {
    id: 2,
    professor_id: 11,
    title: 'Sistemas Distribuídos com Kubernetes',
    description: 'Implementação e análise de sistemas distribuídos usando containers e orquestração com Kubernetes.',
    prerequisites: 'Docker, Linux',
    max_slots: 1,
    department_id: 2,
    area_id: 2,
    status: 'open' as const,
    professor: { id: 11, name: 'Prof. Costa', email: 'costa@ufmg.br', role: 'professor' as const, department_id: 2, profile_link: null },
    department: { id: 2, name: 'Engenharia de Software', code: 'ES' },
    area: { id: 2, name: 'Sistemas Distribuídos', code: 'SD' },
    applications_count: 0,
    approved_applications_count: 0,
  },
  {
    id: 3,
    professor_id: 10,
    title: 'Análise de Segurança em APIs REST',
    description: 'Estudo de vulnerabilidades e técnicas de proteção em APIs REST modernas.',
    prerequisites: null,
    max_slots: 3,
    department_id: 1,
    area_id: 3,
    status: 'closed' as const,
    professor: { id: 10, name: 'Prof. Silva', email: 'silva@ufmg.br', role: 'professor' as const, department_id: 1, profile_link: null },
    department: { id: 1, name: 'Ciência da Computação', code: 'CC' },
    area: { id: 3, name: 'Segurança', code: 'SEG' },
    applications_count: 3,
    approved_applications_count: 3,
  },
]

export const mockMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 3,
}

export const proposalHandlers = [
  http.get(`${BASE_URL}/proposals`, ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    const filtered = status
      ? mockProposals.filter((p) => p.status === status)
      : mockProposals

    return HttpResponse.json({ data: filtered, meta: mockMeta })
  }),

  http.get(`${BASE_URL}/proposals/:id`, ({ params }) => {
    const proposal = mockProposals.find((p) => p.id === Number(params.id))
    if (!proposal) {
      return HttpResponse.json({ message: 'Proposta não encontrada.' }, { status: 404 })
    }
    return HttpResponse.json({ data: proposal })
  }),

  http.post(`${BASE_URL}/proposals`, async ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }
    const body = await request.json() as Record<string, unknown>
    const newProposal = {
      id: 99,
      professor_id: 10,
      ...body,
      status: 'open' as const,
      applications_count: 0,
      approved_applications_count: 0,
    }
    return HttpResponse.json({ data: newProposal }, { status: 201 })
  }),

  http.post(`${BASE_URL}/proposals/:id/apply`, async ({ params, request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }
    const proposal = mockProposals.find((p) => p.id === Number(params.id))
    if (!proposal || proposal.status === 'closed') {
      return HttpResponse.json({ message: 'Proposta não disponível.' }, { status: 422 })
    }
    return HttpResponse.json(
      { data: { id: 50, student_id: 2, proposal_id: Number(params.id), status: 'pending', feedback: null, applied_at: new Date().toISOString(), reviewed_at: null } },
      { status: 201 },
    )
  }),
]
