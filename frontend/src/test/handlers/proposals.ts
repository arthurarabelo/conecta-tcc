import { http, HttpResponse } from 'msw'
import { BASE_URL } from '@/test/handlers'

export const MOCK_PROPOSALS = [
  {
    id: 1,
    professor_id: 10,
    title: 'Redes Neurais para Reconhecimento de Imagens',
    description: 'Estudo aprofundado de arquiteturas de redes neurais convolucionais aplicadas ao reconhecimento de padrões visuais em conjuntos de dados médicos.',
    prerequisites: 'Python, álgebra linear',
    max_slots: 2,
    department_id: 1,
    area_id: 1,
    status: 'open',
    professor: { id: 10, name: 'Prof. Carlos Lima', email: 'carlos@univ.br', role: 'professor', department_id: 1, profile_link: null },
    department: { id: 1, name: 'Ciência da Computação', code: 'CC' },
    area: { id: 1, name: 'Inteligência Artificial', code: 'IA' },
    applications_count: 0,
    approved_applications_count: 0,
  },
  {
    id: 2,
    professor_id: 11,
    title: 'Blockchain para Certificação Acadêmica',
    description: 'Desenvolvimento de um sistema descentralizado baseado em blockchain para emissão e verificação de certificados acadêmicos.',
    prerequisites: null,
    max_slots: 1,
    department_id: 2,
    area_id: 2,
    status: 'open',
    professor: { id: 11, name: 'Prof. Maria Oliveira', email: 'maria@univ.br', role: 'professor', department_id: 2, profile_link: null },
    department: { id: 2, name: 'Sistemas de Informação', code: 'SI' },
    area: { id: 2, name: 'Sistemas Distribuídos', code: 'SD' },
    applications_count: 1,
    approved_applications_count: 0,
  },
]

export const MOCK_CLOSED_PROPOSAL = {
  id: 5,
  professor_id: 10,
  title: 'Proposta Fechada de Teste',
  description: 'Uma proposta fechada para cenários de teste.',
  prerequisites: null,
  max_slots: 1,
  department_id: 1,
  area_id: 1,
  status: 'closed',
  applications_count: 1,
  approved_applications_count: 1,
}

export const proposalHandlers = [
  http.get(`${BASE_URL}/proposals`, ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const filtered = status ? MOCK_PROPOSALS.filter((p) => p.status === status) : MOCK_PROPOSALS
    return HttpResponse.json({
      data: filtered,
      meta: { current_page: 1, last_page: 1, per_page: 15, total: filtered.length, from: filtered.length > 0 ? 1 : null, to: filtered.length > 0 ? filtered.length : null },
      links: { first: null, last: null, prev: null, next: null },
    })
  }),

  http.get(`${BASE_URL}/proposals/:id`, ({ params }) => {
    const id = Number(params.id)
    const proposal = MOCK_PROPOSALS.find((p) => p.id === id)
    if (!proposal) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(proposal)
  }),

  http.post(`${BASE_URL}/proposals`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    const created = { id: 99, professor_id: 10, ...body, status: 'open', applications_count: 0, approved_applications_count: 0 }
    return HttpResponse.json(created, { status: 201 })
  }),

  http.patch(`${BASE_URL}/proposals/:id`, async ({ params, request }) => {
    const id = Number(params.id)
    const body = await request.json() as Record<string, unknown>
    const proposal = MOCK_PROPOSALS.find((p) => p.id === id)
    if (!proposal) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json({ ...proposal, ...body })
  }),

  http.delete(`${BASE_URL}/proposals/:id`, ({ params }) => {
    const id = Number(params.id)
    const exists = MOCK_PROPOSALS.some((p) => p.id === id)
    if (!exists) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${BASE_URL}/departments`, () => {
    return HttpResponse.json([
      { id: 1, name: 'Ciência da Computação', code: 'CC' },
      { id: 2, name: 'Engenharia de Software', code: 'ES' },
      { id: 3, name: 'Sistemas de Informação', code: 'SI' },
      { id: 4, name: 'Engenharia Elétrica', code: 'EE' },
      { id: 5, name: 'Matemática', code: 'MAT' },
    ])
  }),

  http.get(`${BASE_URL}/knowledge-areas`, () => {
    return HttpResponse.json([
      { id: 1, name: 'Inteligência Artificial', code: 'IA' },
      { id: 2, name: 'Banco de Dados', code: 'BD' },
      { id: 3, name: 'Redes de Computadores', code: 'RC' },
      { id: 4, name: 'Engenharia de Software', code: 'ES' },
      { id: 5, name: 'IHC', code: 'IHC' },
    ])
  }),

  http.post(`${BASE_URL}/proposals/:id/apply`, ({ params }) => {
    const proposalId = Number(params.id)
    if (proposalId === MOCK_CLOSED_PROPOSAL.id) {
      return HttpResponse.json({ message: 'Esta proposta está fechada' }, { status: 422 })
    }
    return HttpResponse.json({
      data: { id: 200, student_id: 50, proposal_id: proposalId, status: 'pending', feedback: null, applied_at: '2025-05-08T00:00:00.000Z', reviewed_at: null },
    })
  }),
]
