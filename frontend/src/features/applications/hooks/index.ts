import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { applicationsService } from '@/services/applications.service'
import { QUERY_KEYS } from '@/constants/query-keys'
import type { ApplicationFilters, RejectPayload } from '@/services/applications.service'

export function useApplications(filters?: ApplicationFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.applications.list(filters),
    queryFn: () => applicationsService.list(filters),
  })
}

export function useApplication(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.applications.detail(id),
    queryFn: () => applicationsService.show(id),
    enabled: id > 0,
  })
}

export function useApproveApplication() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => applicationsService.approve(id),
    onSuccess(updated) {
      qc.setQueryData(QUERY_KEYS.applications.detail(updated.id), updated)
      qc.invalidateQueries({ queryKey: QUERY_KEYS.applications.all })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.proposals.all })
    },
  })
}

export function useRejectApplication() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload?: RejectPayload }) =>
      applicationsService.reject(id, payload),
    onSuccess(updated) {
      qc.setQueryData(QUERY_KEYS.applications.detail(updated.id), updated)
      qc.invalidateQueries({ queryKey: QUERY_KEYS.applications.all })
    },
  })
}
