import { useQuery } from '@tanstack/react-query'
import { referenceDataService } from '@/services/reference-data.service'
import { QUERY_KEYS } from '@/constants/query-keys'

export function useDepartments() {
  return useQuery({
    queryKey: QUERY_KEYS.departments.all,
    queryFn: () => referenceDataService.listDepartments(),
    staleTime: 10 * 60 * 1000, // 10 min — reference data rarely changes
  })
}

export function useKnowledgeAreas() {
  return useQuery({
    queryKey: QUERY_KEYS.knowledgeAreas.all,
    queryFn: () => referenceDataService.listKnowledgeAreas(),
    staleTime: 10 * 60 * 1000,
  })
}
