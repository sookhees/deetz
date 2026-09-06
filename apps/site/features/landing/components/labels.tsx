export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs tracking-wider text-chart-3 uppercase dark:text-chart-2">
      {children}
    </p>
  )
}

export function Numeral({ index }: { index: number }) {
  return (
    <span className="font-mono text-xs text-chart-3 dark:text-chart-2">
      {String(index + 1).padStart(2, "0")}
    </span>
  )
}
