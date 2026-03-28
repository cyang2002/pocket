interface SectionHeaderProps {
  title: string
  children?: React.ReactNode
}

export function SectionHeader({ title, children }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-[3px] h-5 rounded-full bg-primary" />
      <h2 className="text-base font-semibold">{title}</h2>
      {children}
    </div>
  )
}
