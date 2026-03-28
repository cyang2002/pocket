import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { CATEGORIES, formatCategory } from '@/lib/constants'
import type { GridFilters } from '@/types/api'

interface GridFiltersProps {
  filters: GridFilters
  onFilterChange: (filters: GridFilters) => void
  issuers: string[]
  sortCol: string | null
  onSortChange: (col: string | null) => void
}

export function GridFilters({ filters, onFilterChange, issuers, sortCol, onSortChange }: GridFiltersProps) {
  const hasActiveFilters = !!(filters.issuer || filters.isBusiness !== undefined || filters.network || filters.maxFee !== undefined || sortCol)

  return (
    <div className="px-8 sm:px-16 py-3 border-b border-border flex flex-wrap gap-2 items-center">
      <Select
        value={filters.issuer ?? ''}
        onValueChange={(v: string | null) => onFilterChange({ ...filters, issuer: v || undefined })}
      >
        <SelectTrigger className="w-36 h-8 text-xs">
          <SelectValue placeholder="All Issuers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Issuers</SelectItem>
          {issuers.map((iss) => (
            <SelectItem key={iss} value={iss}>{iss}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.isBusiness === undefined ? '' : String(filters.isBusiness)}
        onValueChange={(v: string | null) => onFilterChange({ ...filters, isBusiness: !v ? undefined : v === 'true' })}
      >
        <SelectTrigger className="w-32 h-8 text-xs">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Types</SelectItem>
          <SelectItem value="false">Personal</SelectItem>
          <SelectItem value="true">Business</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.network ?? ''}
        onValueChange={(v: string | null) => onFilterChange({ ...filters, network: v || undefined })}
      >
        <SelectTrigger className="w-36 h-8 text-xs">
          <SelectValue placeholder="All Networks" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Networks</SelectItem>
          <SelectItem value="VISA">Visa</SelectItem>
          <SelectItem value="MASTERCARD">Mastercard</SelectItem>
          <SelectItem value="AMERICAN_EXPRESS">Amex</SelectItem>
          <SelectItem value="DISCOVER">Discover</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.maxFee === undefined ? '' : String(filters.maxFee)}
        onValueChange={(v: string | null) => onFilterChange({ ...filters, maxFee: !v ? undefined : Number(v) })}
      >
        <SelectTrigger className="w-32 h-8 text-xs">
          <SelectValue placeholder="Any Fee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Any Fee</SelectItem>
          <SelectItem value="0">$0 (no fee)</SelectItem>
          <SelectItem value="100">Up to $100</SelectItem>
          <SelectItem value="250">Up to $250</SelectItem>
          <SelectItem value="550">Up to $550</SelectItem>
        </SelectContent>
      </Select>

      <div className="w-px h-4 bg-border mx-1" />

      <Select value={sortCol ?? ''} onValueChange={v => onSortChange(v || null)}>
        <SelectTrigger className="w-36 h-8 text-xs">
          <SelectValue placeholder="Default" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Default</SelectItem>
          {CATEGORIES.map(cat => (
            <SelectItem key={cat} value={cat}>{formatCategory(cat)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          className="h-8 px-2 text-xs text-muted-foreground"
          onClick={() => { onFilterChange({}); onSortChange(null) }}
        >
          Clear all
        </Button>
      )}
    </div>
  )
}
