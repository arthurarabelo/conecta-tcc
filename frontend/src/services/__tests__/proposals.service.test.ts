import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { proposalsService } from '../proposals.service'

describe('proposalsService', () => {
  describe('list', () => {
    it('returns paginated proposals with data and meta', async () => {
      const result = await proposalsService.list()
      expect(result.data).toHaveLength(2)
      expect(result.meta).toBeDefined()
      expect(result.meta.current_page).toBe(1)
    })

    it('filters proposals by status=open', async () => {
      const result = await proposalsService.list({ status: 'open' })
      expect(result.data.every((p) => p.status === 'open')).toBe(true)
    })

    it('filters proposals by status=closed returns empty', async () => {
      const result = await proposalsService.list({ status: 'closed' })
      expect(result.data).toHaveLength(0)
    })

    it('includes filters in query params', async () => {
      let capturedUrl: string | null = null
      server.use(
        http.get('http://localhost:8000/api/proposals', ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json({
            data: [],
            meta: { current_page: 2, last_page: 3, per_page: 15, total: 30, from: 16, to: 30 },
            links: { first: null, last: null, prev: null, next: null },
          })
        }),
      )
      await proposalsService.list({ page: 2, area_id: 5 })
      expect(capturedUrl).toContain('page=2')
      expect(capturedUrl).toContain('area_id=5')
    })
  })

  describe('show', () => {
    it('returns a single proposal by id', async () => {
      const proposal = await proposalsService.show(1)
      expect(proposal.id).toBe(1)
      expect(proposal.title).toBe('Redes Neurais para Reconhecimento de Imagens')
    })

    it('throws for a non-existent id', async () => {
      await expect(proposalsService.show(9999)).rejects.toMatchObject({ status: 404 })
    })
  })

  describe('create', () => {
    it('creates a proposal and returns the new resource', async () => {
      const payload = {
        title: 'Nova Proposta de TCC',
        description: 'Descrição detalhada da nova proposta de TCC para fins de teste.',
        max_slots: 2,
        department_id: 1,
        area_id: 1,
      }
      const created = await proposalsService.create(payload)
      expect(created.id).toBe(99)
      expect(created.title).toBe(payload.title)
    })
  })

  describe('update', () => {
    it('patches a proposal and returns the updated resource', async () => {
      const updated = await proposalsService.update(1, { max_slots: 5 })
      expect(updated.id).toBe(1)
      expect(updated.max_slots).toBe(5)
    })

    it('throws for a non-existent proposal', async () => {
      await expect(proposalsService.update(9999, { title: 'X' })).rejects.toMatchObject({ status: 404 })
    })
  })

  describe('remove', () => {
    it('deletes a proposal without throwing', async () => {
      await expect(proposalsService.remove(1)).resolves.toBeUndefined()
    })

    it('throws for a non-existent proposal', async () => {
      await expect(proposalsService.remove(9999)).rejects.toMatchObject({ status: 404 })
    })
  })

  describe('apply', () => {
    it('creates an application and returns it', async () => {
      const application = await proposalsService.apply(1)
      expect(application.id).toBe(200)
      expect(application.proposal_id).toBe(1)
      expect(application.status).toBe('pending')
    })

    it('throws with 422 when proposal is closed (id=5)', async () => {
      await expect(proposalsService.apply(5)).rejects.toMatchObject({ status: 422 })
    })
  })
})
