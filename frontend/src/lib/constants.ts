export const CATEGORIES = [
  'business', 'dining', 'drugstore', 'entertainment', 'gas', 'groceries',
  'home_improvement', 'online_shopping', 'other', 'streaming', 'transit', 'travel',
] as const

export type Category = typeof CATEGORIES[number]

export function formatCategory(cat: string): string {
  return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function formatIssuer(issuer: string): string {
  return issuer.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

/** Shared badge color for earn rate values — use everywhere rates appear */
export function rateColorClass(val: number): string {
  if (val >= 4) return 'bg-purple-50 text-purple-700'
  if (val >= 3) return 'bg-emerald-50 text-emerald-700'
  if (val >= 2) return 'bg-sky-50 text-sky-700'
  return 'bg-stone-100 text-stone-500'
}

/** Tile background + border for the detail rate grid */
export function rateTileBg(val: number | null | undefined): string {
  if (val == null) return 'bg-card border-border/40 opacity-40'
  if (val >= 4) return 'bg-purple-50 border-purple-200/60'
  if (val >= 3) return 'bg-emerald-50 border-emerald-200/60'
  if (val >= 2) return 'bg-sky-50 border-sky-200/60'
  return 'bg-card border-border'
}

/** Number color for the detail rate tile */
export function rateNumColor(val: number | null | undefined): string {
  if (val == null) return 'text-muted-foreground/30'
  if (val >= 4) return 'text-purple-700'
  if (val >= 3) return 'text-emerald-700'
  if (val >= 2) return 'text-sky-700'
  return 'text-foreground'
}

/** Extract top earn rates from a card's earnRates map */
export function getTopRates(
  earnRates: Record<string, number | null>,
  count = 3
): [string, number][] {
  return (Object.entries(earnRates) as [string, number | null][])
    .filter((e): e is [string, number] => e[1] != null && e[1] > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
}

export function isStaleDate(dateStr: string | null | undefined, thresholdDays = 30): boolean {
  if (!dateStr) return true
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - thresholdDays)
  return new Date(dateStr) < cutoff
}
