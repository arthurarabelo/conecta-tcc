import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { authHandlers, BASE_URL } from './handlers'
import { proposalHandlers } from './handlers/proposals'
import type { PaginatedResponse } from '@/types/api'
import type { Proposal, Application } from '@/types/models'

export const server = setupServer(...authHandlers, ...proposalHandlers)

export function mockProposalsList(
  proposals: Proposal[],
  meta: PaginatedResponse<Proposal>['meta'] = {
    current_page: 1, last_page: 1, per_page: 15,
    total: proposals.length,
    from: proposals.length ? 1 : null,
    to: proposals.length ? proposals.length : null,
  },
) {
  server.use(
    http.get(`${BASE_URL}/proposals`, () =>
      HttpResponse.json({ data: proposals, meta, links: { first: null, last: null, prev: null, next: null } }),
    ),
  )
}

export function mockProposalDetail(proposal: Proposal) {
  server.use(
    http.get(`${BASE_URL}/proposals/${proposal.id}`, () =>
      HttpResponse.json(proposal),
    ),
  )
}

export function mockApplicationsList(applications: Application[]) {
  server.use(
    http.get(`${BASE_URL}/applications`, () =>
      HttpResponse.json({
        data: applications,
        meta: { current_page: 1, last_page: 1, per_page: 15, total: applications.length, from: applications.length ? 1 : null, to: applications.length ? applications.length : null },
        links: { first: null, last: null, prev: null, next: null },
      }),
    ),
  )
}

export function mockApplyToProposal(proposalId: number, result: Application) {
  server.use(
    http.post(`${BASE_URL}/proposals/${proposalId}/apply`, () =>
      HttpResponse.json({ data: result }, { status: 201 }),
    ),
  )
}

export function mockProposalNotFound(id: number) {
  server.use(
    http.get(`${BASE_URL}/proposals/${id}`, () =>
      HttpResponse.json({ message: 'Recurso não encontrado' }, { status: 404 }),
    ),
  )
}

export function mockProposalUpdate(proposalId: number, result: Proposal) {
  server.use(
    http.patch(`${BASE_URL}/proposals/${proposalId}`, () =>
      HttpResponse.json(result),
    ),
  )
}

export function mockProposalDelete(proposalId: number) {
  server.use(
    http.delete(`${BASE_URL}/proposals/${proposalId}`, () =>
      new HttpResponse(null, { status: 204 }),
    ),
  )
}
