import { useParams, Link } from 'react-router-dom'
import { useCardDetail } from '@/hooks/useCardDetail'
import { StalenessIndicator } from '@/components/grid/StalenessIndicator'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { CATEGORIES, formatCategory, isStaleDate } from '@/lib/constants'
import type { CardDetailFull, EarnRateDetail } from '@/types/api'

export function CardDetail() {
  const { id } = useParams<{ id: string }>()
  const { card, earnRates } = useCardDetail(id ?? '')

  if (card.isLoading || earnRates.isLoading) {
    return (
      <div className="p-8 space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (card.isError) {
    return (
      <div className="p-8">
        <Alert><AlertDescription>Unable to load card data. Check your connection and try again.</AlertDescription></Alert>
      </div>
    )
  }

  const cardData = card.data as CardDetailFull | undefined
  if (!cardData) return null

  const ratesByCategory = new Map<string, EarnRateDetail>(
    (earnRates.data ?? []).map(r => [r.category, r])
  )

  const mostRecentVerified = earnRates.data
    ?.map(r => r.lastVerified)
    .filter((d): d is string => !!d)
    .sort()
    .at(-1)
  const isStale = isStaleDate(mostRecentVerified)

  const firstOffer = cardData.offers?.[0]?.amount?.[0]

  return (
    <div className="min-h-screen bg-background">
      <div className="px-8 py-4">
        <Link to="/" className="text-sm text-muted-foreground hover:underline">Back to grid</Link>
      </div>

      <div className="px-8 py-4 flex gap-6 items-start">
        {cardData.imageUrl && (
          <img src={cardData.imageUrl} alt={cardData.name} className="w-32 h-20 object-contain rounded border" />
        )}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{cardData.name}</h1>
            {isStale && <StalenessIndicator />}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {cardData.issuer}{cardData.network ? ` · ${cardData.network}` : ''}
          </p>
          <p className="text-sm mt-1">
            Annual Fee: {cardData.annualFee === 0 || cardData.isAnnualFeeWaived
              ? '$0'
              : `$${cardData.annualFee}`}
          </p>
          {firstOffer && (
            <p className="text-sm mt-1">Sign-up bonus: {firstOffer.amount} {firstOffer.currency}</p>
          )}
        </div>
      </div>

      <div className="px-8 py-4">
        <h2 className="text-base font-semibold mb-3">Earn Rates</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Multiplier</TableHead>
                <TableHead>Caveats</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CATEGORIES.map(cat => {
                const rate = ratesByCategory.get(cat)
                return (
                  <TableRow key={cat}>
                    <TableCell className="py-3 px-4 text-sm">{formatCategory(cat)}</TableCell>
                    <TableCell className="py-3 px-4 text-sm">
                      {rate ? `${rate.multiplier}x` : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-muted-foreground">
                      {rate?.caveats ?? ''}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {cardData.credits && cardData.credits.length > 0 && (
        <div className="px-8 py-4">
          <h2 className="text-base font-semibold mb-3">Credits</h2>
          <ul className="space-y-1">
            {cardData.credits.map((credit, i) => (
              <li key={i} className="text-sm">
                {credit.description ?? ''}{credit.value ? ` — $${credit.value}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
