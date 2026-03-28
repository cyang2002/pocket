import { Badge } from '@/components/ui/badge'

interface StalenessIndicatorProps {
  abbreviated?: boolean
}

export function StalenessIndicator({ abbreviated = false }: StalenessIndicatorProps) {
  return (
    <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
      {abbreviated ? 'May be outdated' : 'Earn rate data may be outdated — last verified over 30 days ago.'}
    </Badge>
  )
}
