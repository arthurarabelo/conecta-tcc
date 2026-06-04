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

const AREAS = [
  { id: 1, name: 'Inteligência Artificial' },
  { id: 2, name: 'Banco de Dados' },
  { id: 3, name: 'Redes' },
  { id: 4, name: 'Compiladores' },
  { id: 5, name: 'IHC' },
]

const DEPARTMENTS = [
  { id: 1, name: 'DCC' },
  { id: 2, name: 'DEE' },
]

export function ProposalFilters({
  filters,
  onChange,
  search,
  onSearchChange,
}: ProposalFiltersProps) {
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
          value={filters.area_id?.toString() ?? ''}
          onValueChange={(val) =>
            onChange({ ...filters, area_id: val ? Number(val) : undefined })
          }
        >
          <SelectTrigger id="area-select" aria-label="Área">
            <SelectValue placeholder="Todas as áreas" />
          </SelectTrigger>
          <SelectContent>
            {AREAS.map((a) => (
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
          value={filters.department_id?.toString() ?? ''}
          onValueChange={(val) =>
            onChange({ ...filters, department_id: val ? Number(val) : undefined })
          }
        >
          <SelectTrigger id="dept-select" aria-label="Departamento">
            <SelectValue placeholder="Todos os departamentos" />
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d.id} value={d.id.toString()}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 pb-0.5">
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
  )
}
