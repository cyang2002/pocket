import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCardGrid } from '@/hooks/useCardGrid'
import { GridFilters } from './GridFilters'
import { StalenessIndicator } from './StalenessIndicator'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import type { GridFilters as GridFiltersType } from '@/types/api'

const CATEGORIES = [
  'business', 'dining', 'drugstore', 'entertainment', 'gas', 'groceries',
  'home_improvement', 'online_shopping', 'other', 'streaming', 'transit', 'travel'
]

function formatCategory(cat: string): string {
  return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function EarnRateGrid() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<GridFiltersType>({})
  const [staged, setStaged] = useState<string[]>([])

  const { data, isLoading, isError } = useCardGrid({})

  const issuers = useMemo(() => {
    if (!data) return []
    return [...new Set(data.map(c => c.issuer))].sort()
  }, [data])

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter(card => {
      if (filters.issuer && card.issuer !== filters.issuer) return false
      if (filters.isBusiness !== undefined && card.isBusiness !== filters.isBusiness) return false
      if (filters.network && card.network !== filters.network) return false
      if (filters.maxFee !== undefined && card.annualFee > filters.maxFee) return false
      return true
    })
  }, [data, filters])

  function handleStageToggle(cardId: string, checked: boolean) {
    if (checked) {
      if (staged.length >= 3) return
      setStaged(prev => [...prev, cardId])
    } else {
      setStaged(prev => prev.filter(id => id !== cardId))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-8 py-6">
        <h1 className="text-xl font-semibold">Credit Cards</h1>
      </div>

      <GridFilters filters={filters} onFilterChange={setFilters} issuers={issuers} />

      {isLoading && (
        <div className="px-8 py-4 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <div className="px-8 py-4">
          <Alert>
            <AlertDescription>Unable to load card data. Check your connection and try again.</AlertDescription>
          </Alert>
        </div>
      )}

      {!isLoading && !isError && filteredData.length === 0 && data && data.length > 0 && (
        <div className="px-8 py-16 text-center">
          <h2 className="text-base font-semibold">No cards match your filters</h2>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting issuer, type, or annual fee range.</p>
        </div>
      )}

      {!isLoading && !isError && filteredData.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-11 sticky left-0 bg-background z-10"></TableHead>
                <TableHead className="sticky left-11 bg-background z-10 min-w-[180px]">Card</TableHead>
                {CATEGORIES.map(cat => (
                  <TableHead key={cat} className="text-xs font-semibold py-3 px-4 min-w-[80px]">
                    {formatCategory(cat)}
                  </TableHead>
                ))}
                <TableHead className="text-xs font-semibold py-3 px-4">Annual Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map(card => (
                <TableRow key={card.cardId}>
                  <TableCell className="w-11 sticky left-0 bg-background z-10">
                    <Checkbox
                      checked={staged.includes(card.cardId)}
                      onCheckedChange={(checked) => handleStageToggle(card.cardId, !!checked)}
                      disabled={!staged.includes(card.cardId) && staged.length >= 3}
                    />
                  </TableCell>
                  <TableCell className="sticky left-11 bg-background z-10 min-w-[180px] py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <Link to={"/cards/" + card.cardId} className="font-medium hover:underline">{card.name}</Link>
                      <span className="text-xs text-muted-foreground">{card.issuer}</span>
                      {card.isStale && <StalenessIndicator abbreviated />}
                    </div>
                  </TableCell>
                  {CATEGORIES.map(cat => (
                    <TableCell key={cat} className="py-3 px-4">
                      {card.earnRates[cat] != null
                        ? `${card.earnRates[cat]}x`
                        : <span className="text-muted-foreground">&#x2014;</span>
                      }
                    </TableCell>
                  ))}
                  <TableCell className="py-3 px-4">
                    ${card.annualFee}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {staged.length >= 2 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg p-4 flex items-center justify-between">
          <div className="flex gap-3">
            {staged.map(id => {
              const card = data?.find(c => c.cardId === id)
              return card ? <span key={id} className="text-sm font-semibold">{card.name}</span> : null
            })}
          </div>
          <button
            onClick={() => navigate(`/compare?ids=${staged.join(',')}`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-semibold min-h-11"
          >
            Compare Cards
          </button>
        </div>
      )}
    </div>
  )
}
