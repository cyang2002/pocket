import { useQuery } from '@tanstack/react-query'
import { fetchCardById, fetchEarnRates } from '@/lib/api'

export function useCardDetail(cardId: string) {
  const card = useQuery({
    queryKey: ['card', cardId],
    queryFn: () => fetchCardById(cardId),
    staleTime: 5 * 60 * 1000,
    enabled: !!cardId,
  })

  const earnRates = useQuery({
    queryKey: ['earnRates', cardId],
    queryFn: () => fetchEarnRates(cardId),
    staleTime: 5 * 60 * 1000,
    enabled: !!cardId,
  })

  return { card, earnRates }
}
