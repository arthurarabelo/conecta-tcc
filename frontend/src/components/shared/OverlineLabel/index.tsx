interface Props {
  children: React.ReactNode
}

export function OverlineLabel({ children }: Props) {
  return (
    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </div>
  )
}
