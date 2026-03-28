export const CATEGORIES = [
  'business', 'dining', 'drugstore', 'entertainment', 'gas', 'groceries',
  'home_improvement', 'online_shopping', 'other', 'streaming', 'transit', 'travel',
] as const

export type Category = typeof CATEGORIES[number]

export function formatCategory(cat: string): string {
  return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function isStaleDate(dateStr: string | null | undefined, thresholdDays = 30): boolean {
  if (!dateStr) return true
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - thresholdDays)
  return new Date(dateStr) < cutoff
}
