interface BizBadgeProps {
  size?: 'default' | 'sm'
}

export function BizBadge({ size = 'default' }: BizBadgeProps) {
  return (
    <span
      className={`font-bold tracking-[0.08em] uppercase rounded-sm bg-foreground text-background leading-none flex-shrink-0 ${
        size === 'sm' ? 'text-[8px] px-1 py-0.5' : 'text-[9px] px-1.5 py-0.5'
      }`}
    >
      Biz
    </span>
  )
}
