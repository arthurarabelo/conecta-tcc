import { apiClient } from './api-client'
import { API_ENDPOINTS } from '@/constants/api'
import type { Department, KnowledgeArea } from '@/types/models'

export const referenceDataService = {
  async listDepartments(): Promise<Department[]> {
    const { data } = await apiClient.get<Department[]>(API_ENDPOINTS.departments.list)
    return data
  },

  async listKnowledgeAreas(): Promise<KnowledgeArea[]> {
    const { data } = await apiClient.get<KnowledgeArea[]>(API_ENDPOINTS.knowledgeAreas.list)
    return data
  },
}
