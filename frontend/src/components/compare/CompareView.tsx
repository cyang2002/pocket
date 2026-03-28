import { useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useCompare } from '@/hooks/useCompare'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SectionHeader } from '@/components/ui/section-header'
import { CATEGORIES, formatCategory, rateColorClass } from '@/lib/constants'
import type { CardGridItem } from '@/types/api'

export function CompareView() {
  const [searchParams] = useSearchParams()
  const ids = (searchParams.get('ids') ?? '').split(',').filter(Boolean)
  const { data, isLoading, isError } = useCompare(ids)

  if (ids.length < 2) {
    return (
      <div className="px-8 sm:px-16 py-8">
        <Link to="/browse" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">← Browse</Link>
        <p className="mt-4 text-sm text-muted-foreground">Select 2 or 3 cards from the grid to compare.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-3">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="p-8">
        <Alert><AlertDescription>Unable to load card data. Check your connection and try again.</AlertDescription></Alert>
      </div>
    )
  }

  const cards: CardGridItem[] = data

  const maxByCategory = useMemo(() => {
    const map = new Map<string, number>()
    CATEGORIES.forEach(cat => {
      const values = cards.map(c => c.earnRates[cat]).filter((v): v is number => v != null)
      if (values.length > 0) map.set(cat, Math.max(...values))
    })
    return map
  }, [cards])

  return (
    <div className="min-h-screen bg-background">
      <div className="px-8 sm:px-16 pt-7 pb-4">
        <Link to="/browse" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">← Browse</Link>
        <div className="mt-6">
          <SectionHeader title={`Comparing ${cards.length} Card${cards.length !== 1 ? 's' : ''}`} />
        </div>
      </div>

      <div className="px-8 sm:px-16 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-xs font-semibold py-3 px-4 w-40 sticky left-0 bg-background"></th>
              {cards.map(card => (
                <th key={card.cardId} className="text-left text-sm font-semibold py-3 px-4 min-w-[200px] border-l border-border">
                  <Link to={`/cards/${card.cardId}`} className="hover:underline">{card.name}</Link>
                  <div className="text-xs font-normal text-muted-foreground">{card.issuer}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <td className="text-xs font-semibold py-3 px-4 sticky left-0 bg-background">Annual Fee</td>
              {cards.map(card => (
                <td key={card.cardId} className="text-sm py-3 px-4 border-l border-border">
                  {card.annualFee === 0 ? '$0' : `$${card.annualFee}`}
                </td>
              ))}
            </tr>
            <tr className="border-t border-border">
              <td className="text-xs font-semibold py-3 px-4 sticky left-0 bg-background">Network</td>
              {cards.map(card => (
                <td key={card.cardId} className="text-sm py-3 px-4 border-l border-border">
                  {card.network ?? <span className="text-muted-foreground">—</span>}
                </td>
              ))}
            </tr>
            <tr>
              <td colSpan={cards.length + 1} className="py-2 px-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide border-t border-border pt-2">Earn Rates</div>
              </td>
            </tr>
            {CATEGORIES.map(cat => {
              const maxVal = maxByCategory.get(cat)
              return (
                <tr key={cat} className="border-t border-border">
                  <td className="text-xs font-semibold py-3 px-4 sticky left-0 bg-background">{formatCategory(cat)}</td>
                  {cards.map(card => {
                    const val = card.earnRates[cat]
                    const isBest = val != null && maxVal != null && val === maxVal && maxVal > 0
                    return (
                      <td
                        key={card.cardId}
                        className={`py-3 px-4 border-l border-border`}
                      >
                        {val != null
                          ? <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-sm leading-none ${isBest ? rateColorClass(val) : 'text-foreground'}`}>{val}×</span>
                          : <span className="text-muted-foreground text-sm">—</span>}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
