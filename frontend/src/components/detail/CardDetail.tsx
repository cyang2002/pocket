import { useParams, Link } from 'react-router-dom'
import { useCardDetail } from '@/hooks/useCardDetail'
import { StalenessIndicator } from '@/components/grid/StalenessIndicator'
import { Skeleton } from '@/components/ui/skeleton'
import { CATEGORIES, formatCategory, formatIssuer, isStaleDate, rateTileBg, rateNumColor } from '@/lib/constants'
import type { CardDetailFull, EarnRateDetail } from '@/types/api'

function formatNetwork(network: string): string {
  const map: Record<string, string> = {
    VISA: 'Visa', MASTERCARD: 'Mastercard',
    AMERICAN_EXPRESS: 'Amex', DISCOVER: 'Discover',
  }
  return map[network] ?? formatIssuer(network)
}

function formatBonus(offer: { amount: number; currency: string }): string | null {
  if (!offer.currency || offer.currency === 'null') return null
  if (offer.currency === 'USD') return `$${offer.amount.toLocaleString()} bonus`
  return `${offer.amount.toLocaleString()} ${offer.currency} bonus`
}

export function CardDetail() {
  const { id } = useParams<{ id: string }>()
  const { card, earnRates } = useCardDetail(id ?? '')

  if (card.isLoading || earnRates.isLoading) {
    return (
      <div className="px-8 sm:px-16 pt-8 pb-16 min-h-[260px] flex flex-col gap-4 border-b border-border">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-80 mt-4" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    )
  }

  if (card.isError) {
    return (
      <div className="px-8 sm:px-16 py-16 text-center">
        <p className="text-sm text-muted-foreground">Unable to load card. Check your connection.</p>
        <Link to="/browse" className="text-sm text-primary hover:underline mt-2 inline-block">← Back to Browse</Link>
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
  const bonusText = firstOffer ? formatBonus(firstOffer) : null

  const coveredCategories = [...CATEGORIES]
    .filter(cat => ratesByCategory.has(cat) && (ratesByCategory.get(cat)?.multiplier ?? 0) > 0)
    .sort((a, b) => (ratesByCategory.get(b)?.multiplier ?? 0) - (ratesByCategory.get(a)?.multiplier ?? 0))

  const uncoveredCategories = CATEGORIES.filter(cat => !coveredCategories.includes(cat))

  const annualFeeLabel = cardData.annualFee === 0 || cardData.isAnnualFeeWaived
    ? 'No annual fee'
    : `$${cardData.annualFee}/yr`

  const hasAnnualFee = cardData.annualFee !== 0 && !cardData.isAnnualFeeWaived
  const showNetwork = cardData.network && cardData.network !== cardData.issuer

  return (
    <div>
      {/* ── Header ── */}
      <div className="px-8 sm:px-16 pt-7 pb-10 border-b border-border">
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Browse
        </Link>

        <div className="mt-6 flex items-start justify-between gap-8">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-3">
              {formatIssuer(cardData.issuer)}
            </p>
            <h1
              className="text-[clamp(1.75rem,4vw,3rem)] font-normal leading-[1.1] tracking-tight text-foreground"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {cardData.name}
            </h1>

            {/* Inline metadata — plain text, color only for signal */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-4 text-sm text-muted-foreground">
              <span className={hasAnnualFee ? 'font-semibold text-foreground tabular-nums' : ''}>
                {annualFeeLabel}
              </span>
              {showNetwork && (
                <>
                  <span className="text-border select-none">·</span>
                  <span>{formatNetwork(cardData.network!)}</span>
                </>
              )}
              {cardData.isBusiness && (
                <>
                  <span className="text-border select-none">·</span>
                  <span>Business</span>
                </>
              )}
              {bonusText && (
                <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-sm bg-amber-50 text-amber-700 ml-1">
                  {bonusText}
                </span>
              )}
            </div>
          </div>

          {cardData.imageUrl && (
            <img
              src={cardData.imageUrl}
              alt={cardData.name}
              className="w-40 rounded-xl shadow-md flex-shrink-0 mt-1 hidden sm:block"
            />
          )}
        </div>
      </div>

      {/* ── Earn Rates ── */}
      <div className="px-8 sm:px-16 py-10">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-[3px] h-5 rounded-full bg-primary" />
          <h2 className="text-base font-semibold">Earn Rates</h2>
          {isStale && earnRates.data && earnRates.data.length > 0 && (
            <StalenessIndicator abbreviated />
          )}
        </div>

        {coveredCategories.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {coveredCategories.map(cat => {
                const rate = ratesByCategory.get(cat)
                const val = rate?.multiplier ?? null
                return (
                  <div
                    key={cat}
                    className={`rounded border p-4 flex flex-col gap-2 transition-colors ${rateTileBg(val)}`}
                  >
                    <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground leading-none">
                      {formatCategory(cat)}
                    </p>
                    <p className={`text-[2.2rem] font-semibold tabular-nums leading-none ${rateNumColor(val)}`}>
                      {val != null ? `${val}×` : '—'}
                    </p>
                    {rate?.caveats && (
                      <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">
                        {rate.caveats}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
            {uncoveredCategories.length > 0 && (
              <p className="mt-4 text-xs text-muted-foreground/50">
                No earning in: {uncoveredCategories.map(c => formatCategory(c)).join(', ')}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Earn rate data not yet available.</p>
        )}
      </div>

      {/* ── Credits & Benefits ── */}
      {cardData.credits && cardData.credits.length > 0 && (
        <div className="px-8 sm:px-16 pb-12">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-[3px] h-5 rounded-full bg-primary" />
            <h2 className="text-base font-semibold">Credits & Benefits</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {cardData.credits.map((credit, i) => (
              <div key={i} className="flex items-start justify-between gap-4 px-4 py-3 rounded border border-border bg-card">
                <p className="text-sm text-foreground leading-snug">
                  {credit.description ?? ''}
                </p>
                {credit.value != null && (
                  <span className="text-sm font-semibold tabular-nums text-primary flex-shrink-0">
                    ${credit.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
