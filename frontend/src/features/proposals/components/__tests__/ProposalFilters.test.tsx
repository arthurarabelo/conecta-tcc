import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProposalFilters } from '../ProposalFilters'
import type { ProposalFiltersValue } from '../ProposalFilters'

const defaultFilters: ProposalFiltersValue = {
  area_id: undefined,
  department_id: undefined,
  status: undefined,
}

describe('ProposalFilters', () => {
  it('renders search input and all selects', () => {
    render(
      <ProposalFilters
        filters={defaultFilters}
        onChange={vi.fn()}
        search=""
        onSearchChange={vi.fn()}
      />,
    )
    expect(screen.getByPlaceholderText('Buscar por título...')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /área/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /departamento/i })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /só abertas/i })).toBeInTheDocument()
  })

  it('calls onSearchChange when user types in the search box', async () => {
    const onSearchChange = vi.fn()
    render(
      <ProposalFilters
        filters={defaultFilters}
        onChange={vi.fn()}
        search=""
        onSearchChange={onSearchChange}
      />,
    )
    await userEvent.type(screen.getByPlaceholderText('Buscar por título...'), 'ia')
    expect(onSearchChange).toHaveBeenCalledWith('i')
    expect(onSearchChange).toHaveBeenCalledWith('a')
    expect(onSearchChange).toHaveBeenCalledTimes(2)
  })

  it('calls onChange with status=open when "Só abertas" is checked', async () => {
    const onChange = vi.fn()
    render(
      <ProposalFilters
        filters={defaultFilters}
        onChange={onChange}
        search=""
        onSearchChange={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('checkbox', { name: /só abertas/i }))
    expect(onChange).toHaveBeenCalledWith({ ...defaultFilters, status: 'open' })
  })

  it('calls onChange with status=undefined when "Só abertas" is unchecked', async () => {
    const onChange = vi.fn()
    render(
      <ProposalFilters
        filters={{ ...defaultFilters, status: 'open' }}
        onChange={onChange}
        search=""
        onSearchChange={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('checkbox', { name: /só abertas/i }))
    expect(onChange).toHaveBeenCalledWith({ ...defaultFilters, status: undefined })
  })
})
