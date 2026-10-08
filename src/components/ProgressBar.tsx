export function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className="sticker h-4 w-full overflow-hidden rounded-full bg-surface"
    >
      <div className="h-full rounded-full bg-lime transition-[width] duration-std ease-brand" style={{ width: `${pct}%` }} />
    </div>
  )
}
