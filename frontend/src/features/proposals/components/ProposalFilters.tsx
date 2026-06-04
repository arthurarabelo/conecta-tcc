import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useDepartments, useKnowledgeAreas } from '@/features/proposals/hooks'

export interface ProposalFiltersValue {
  area_id?: number
  department_id?: number
  status?: 'open' | 'closed'
}

interface ProposalFiltersProps {
  filters: ProposalFiltersValue
  onChange: (filters: ProposalFiltersValue) => void
  search: string
  onSearchChange: (value: string) => void
}

export function ProposalFilters({
  filters,
  onChange,
  search,
  onSearchChange,
}: ProposalFiltersProps) {
  const { data: areas = [] } = useKnowledgeAreas()
  const { data: departments = [] } = useDepartments()

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex flex-col gap-1.5 flex-1 min-w-48">
        <Label htmlFor="search">Busca</Label>
        <Input
          id="search"
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5 min-w-40">
        <Label htmlFor="area-select">Área</Label>
        <Select
          value={filters.area_id?.toString() ?? 'all'}
          onValueChange={(val) =>
            onChange({ ...filters, area_id: val === 'all' ? undefined : Number(val) })
          }
        >
          <SelectTrigger id="area-select" aria-label="Área">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as áreas</SelectItem>
            {areas.map((a) => (
              <SelectItem key={a.id} value={a.id.toString()}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5 min-w-40">
        <Label htmlFor="dept-select">Departamento</Label>
        <Select
          value={filters.department_id?.toString() ?? 'all'}
          onValueChange={(val) =>
            onChange({ ...filters, department_id: val === 'all' ? undefined : Number(val) })
          }
        >
          <SelectTrigger id="dept-select" aria-label="Departamento">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os departamentos</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id.toString()}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="invisible text-sm leading-none">_</span>
        <div className="flex h-10 items-center gap-2">
          <Checkbox
            id="only-open"
            checked={filters.status === 'open'}
            onCheckedChange={(checked) =>
              onChange({ ...filters, status: checked ? 'open' : undefined })
            }
          />
          <Label htmlFor="only-open">Só abertas</Label>
        </div>
      </div>
    </div>
  )
}
