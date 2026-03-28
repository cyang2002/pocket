import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { GridFilters } from '@/types/api'

interface GridFiltersProps {
  filters: GridFilters
  onFilterChange: (filters: GridFilters) => void
  issuers: string[]
}

export function GridFilters({ filters, onFilterChange, issuers }: GridFiltersProps) {
  const hasActiveFilters = !!(filters.issuer || filters.isBusiness !== undefined || filters.network || filters.maxFee !== undefined)

  return (
    <div className="bg-secondary p-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold">Issuer</label>
          <Select
            value={filters.issuer ?? ''}
            onValueChange={(v: string | null) => onFilterChange({ ...filters, issuer: v || undefined })}
          >
            <SelectTrigger className="w-40 min-h-11">
              <SelectValue placeholder="All Issuers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Issuers</SelectItem>
              {issuers.map((iss) => (
                <SelectItem key={iss} value={iss}>{iss}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold">Type</label>
          <Select
            value={filters.isBusiness === undefined ? '' : String(filters.isBusiness)}
            onValueChange={(v: string | null) => onFilterChange({ ...filters, isBusiness: !v ? undefined : v === 'true' })}
          >
            <SelectTrigger className="w-36 min-h-11">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="false">Personal</SelectItem>
              <SelectItem value="true">Business</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold">Network</label>
          <Select
            value={filters.network ?? ''}
            onValueChange={(v: string | null) => onFilterChange({ ...filters, network: v || undefined })}
          >
            <SelectTrigger className="w-44 min-h-11">
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
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold">Annual Fee</label>
          <Select
            value={filters.maxFee === undefined ? '' : String(filters.maxFee)}
            onValueChange={(v: string | null) => onFilterChange({ ...filters, maxFee: !v ? undefined : Number(v) })}
          >
            <SelectTrigger className="w-36 min-h-11">
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
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            className="min-h-11 self-end text-sm"
            onClick={() => onFilterChange({})}
          >
            Clear all filters
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.issuer && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-600 text-white text-xs">
              {filters.issuer}
              <button onClick={() => onFilterChange({ ...filters, issuer: undefined })} className="ml-1">×</button>
            </span>
          )}
          {filters.isBusiness !== undefined && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-600 text-white text-xs">
              {filters.isBusiness ? 'Business' : 'Personal'}
              <button onClick={() => onFilterChange({ ...filters, isBusiness: undefined })} className="ml-1">×</button>
            </span>
          )}
          {filters.network && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-600 text-white text-xs">
              {filters.network}
              <button onClick={() => onFilterChange({ ...filters, network: undefined })} className="ml-1">×</button>
            </span>
          )}
          {filters.maxFee !== undefined && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-600 text-white text-xs">
              Max ${filters.maxFee}
              <button onClick={() => onFilterChange({ ...filters, maxFee: undefined })} className="ml-1">×</button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
