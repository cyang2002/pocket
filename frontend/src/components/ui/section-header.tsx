interface SectionHeaderProps {
  title: string
  children?: React.ReactNode
}

export function SectionHeader({ title, children }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2.5">
      <h2 className="text-base font-medium" style={{ fontFamily: 'var(--font-display)' }}>{title}</h2>
      {children}
    </div>
  )
}
