import { Link } from 'react-router-dom'
import { CATEGORIES, formatCategory } from '@/lib/constants'
import { useCardGrid } from '@/hooks/useCardGrid'

export function LandingPage() {
  const { data } = useCardGrid({})
  const cardCount = data?.length

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-8 py-24">
        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-6">
          Credit Card Earn Rates
        </p>
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-tight max-w-2xl">
          Know which card to reach for.
        </h1>
        <p className="mt-6 text-base text-muted-foreground max-w-md">
          {cardCount != null
            ? `Tracking earn rates across ${cardCount} cards in ${CATEGORIES.length} spend categories.`
            : `Tracking earn rates across ${CATEGORIES.length} spend categories.`}
        </p>
        <div className="mt-10 flex items-center gap-4">
          <Link
            to="/browse"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-md text-sm font-semibold transition-colors"
          >
            Browse Cards
          </Link>
        </div>
      </section>

      {/* Category chips */}
      <section className="border-t border-border px-8 py-10">
        <div className="mx-auto max-w-screen-lg">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-5 text-center">
            Tracked categories
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map(cat => (
              <span
                key={cat}
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-border text-muted-foreground"
              >
                {formatCategory(cat)}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
