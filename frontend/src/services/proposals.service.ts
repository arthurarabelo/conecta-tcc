import { apiClient } from './api-client'
import { API_ENDPOINTS } from '@/constants/api'
import type { PaginatedResponse } from '@/types/api'
import type { Proposal } from '@/types/models'

export interface ProposalFilters {
  area_id?: number
  department_id?: number
  status?: 'open' | 'closed'
  page?: number
}

export interface CreateProposalPayload {
  title: string
  description: string
  prerequisites?: string
  max_slots: number
  department_id: number
  area_id: number
}

export type UpdateProposalPayload = Partial<CreateProposalPayload>

export const proposalsService = {
  async list(filters?: ProposalFilters): Promise<PaginatedResponse<Proposal>> {
    const { data } = await apiClient.get<PaginatedResponse<Proposal>>(
      API_ENDPOINTS.proposals.list,
      { params: filters },
    )
    return data
  },

  async show(id: number): Promise<Proposal> {
    const { data } = await apiClient.get<{ data: Proposal }>(
      API_ENDPOINTS.proposals.show(id),
    )
    return data.data
  },

  async create(payload: CreateProposalPayload): Promise<Proposal> {
    const { data } = await apiClient.post<{ data: Proposal }>(
      API_ENDPOINTS.proposals.store,
      payload,
    )
    return data.data
  },

  async update(id: number, payload: UpdateProposalPayload): Promise<Proposal> {
    const { data } = await apiClient.patch<{ data: Proposal }>(
      API_ENDPOINTS.proposals.update(id),
      payload,
    )
    return data.data
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.proposals.destroy(id))
  },

  async apply(proposalId: number): Promise<import('@/types/models').Application> {
    const { data } = await apiClient.post<{ data: import('@/types/models').Application }>(
      API_ENDPOINTS.proposals.apply(proposalId),
    )
    return data.data
  },
}
