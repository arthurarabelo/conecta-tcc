import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { proposalsService } from '@/services/proposals.service'
import { QUERY_KEYS } from '@/constants/query-keys'
import type { ProposalFilters, CreateProposalPayload, UpdateProposalPayload } from '@/services/proposals.service'

export function useProposals(filters?: ProposalFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.proposals.list(filters),
    queryFn: () => proposalsService.list(filters),
  })
}

export function useProposal(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.proposals.detail(id),
    queryFn: () => proposalsService.show(id),
    enabled: id > 0,
  })
}

export function useCreateProposal() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateProposalPayload) => proposalsService.create(payload),
    onSuccess() {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.proposals.all })
    },
  })
}

export function useUpdateProposal(id: number) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateProposalPayload) => proposalsService.update(id, payload),
    onSuccess(updated) {
      qc.setQueryData(QUERY_KEYS.proposals.detail(id), updated)
      qc.invalidateQueries({ queryKey: QUERY_KEYS.proposals.all })
    },
  })
}

export function useDeleteProposal() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => proposalsService.remove(id),
    onSuccess() {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.proposals.all })
    },
  })
}

export function useApplyToProposal() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (proposalId: number) => proposalsService.apply(proposalId),
    onSuccess() {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.applications.all })
    },
  })
}
