import { describe, it, expect } from 'vitest'
import { proposalSchema } from '../index'

describe('proposalSchema', () => {
  const valid = {
    title: 'Redes Neurais para Reconhecimento de Imagens',
    description: 'Estudo e implementação de redes neurais convolucionais para reconhecimento de imagens médicas.',
    max_slots: 2,
    department_id: 1,
    area_id: 1,
  }

  it('accepts a valid proposal', () => {
    expect(proposalSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts optional prerequisites', () => {
    expect(proposalSchema.safeParse({ ...valid, prerequisites: 'Python' }).success).toBe(true)
  })

  describe('title', () => {
    it('rejects title shorter than 5 chars', () => {
      const r = proposalSchema.safeParse({ ...valid, title: 'IA' })
      expect(r.success).toBe(false)
      expect(r.error?.issues[0].message).toMatch(/5/)
    })

    it('rejects title longer than 255 chars', () => {
      const r = proposalSchema.safeParse({ ...valid, title: 'a'.repeat(256) })
      expect(r.success).toBe(false)
    })
  })

  describe('description', () => {
    it('rejects description shorter than 20 chars', () => {
      const r = proposalSchema.safeParse({ ...valid, description: 'Curta demais' })
      expect(r.success).toBe(false)
      expect(r.error?.issues[0].message).toMatch(/20/)
    })
  })

  describe('max_slots', () => {
    it('rejects zero slots', () => {
      const r = proposalSchema.safeParse({ ...valid, max_slots: 0 })
      expect(r.success).toBe(false)
      expect(r.error?.issues[0].message).toMatch(/1/)
    })

    it('rejects negative slots', () => {
      const r = proposalSchema.safeParse({ ...valid, max_slots: -1 })
      expect(r.success).toBe(false)
    })

    it('rejects non-integer slots', () => {
      const r = proposalSchema.safeParse({ ...valid, max_slots: 1.5 })
      expect(r.success).toBe(false)
    })

    it('accepts positive integer slots', () => {
      expect(proposalSchema.safeParse({ ...valid, max_slots: 5 }).success).toBe(true)
    })

    it('coerces string number to integer', () => {
      const r = proposalSchema.safeParse({ ...valid, max_slots: '3' })
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.max_slots).toBe(3)
    })
  })

  describe('department_id and area_id', () => {
    it('rejects zero department_id', () => {
      const r = proposalSchema.safeParse({ ...valid, department_id: 0 })
      expect(r.success).toBe(false)
    })

    it('rejects zero area_id', () => {
      const r = proposalSchema.safeParse({ ...valid, area_id: 0 })
      expect(r.success).toBe(false)
    })
  })
})
