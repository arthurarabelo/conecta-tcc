import { apiClient } from './api-client'
import { API_ENDPOINTS } from '@/constants/api'
import type { PaginatedResponse } from '@/types/api'
import type { Application, ApplicationStatus } from '@/types/models'

export interface ApplicationFilters {
  status?: ApplicationStatus
  page?: number
}

export interface RejectPayload {
  feedback?: string
}

export const applicationsService = {
  async list(filters?: ApplicationFilters): Promise<PaginatedResponse<Application>> {
    const { data } = await apiClient.get<PaginatedResponse<Application>>(
      API_ENDPOINTS.applications.list,
      { params: filters },
    )
    return data
  },

  async show(id: number): Promise<Application> {
    const { data } = await apiClient.get<{ data: Application }>(
      API_ENDPOINTS.applications.show(id),
    )
    return data.data
  },

  async approve(id: number): Promise<Application> {
    const { data } = await apiClient.patch<{ data: Application }>(
      API_ENDPOINTS.applications.approve(id),
    )
    return data.data
  },

  async reject(id: number, payload?: RejectPayload): Promise<Application> {
    const { data } = await apiClient.patch<{ data: Application }>(
      API_ENDPOINTS.applications.reject(id),
      payload,
    )
    return data.data
  },
}
